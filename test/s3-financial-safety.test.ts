import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  assertEscrowCanRelease,
  assertJournalBalanced,
  assertRefundDoesNotExceedEscrow,
  computeJournalNetByCurrency,
  RELEASE_ELIGIBLE_ESCROW_STATUSES,
  validateJournalDraft,
} from "../src/financial/domain/index.js";
import { createEscrowService } from "../src/financial/application/escrow-service.js";
import { createLedgerService } from "../src/financial/application/ledger-service.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import {
  activateS3Contract,
  createS3FinancialServices,
  resetS3FinancialData,
} from "./helpers/s3-financial-harness.js";

let db: DbPool | undefined;
let postgresReady = false;

function financialError(code: string) {
  return (error: unknown) =>
    error instanceof AppError &&
    error.problem.engine === "financial" &&
    error.problem.code === code;
}

describe("S3.2 Financial Safety Validation", () => {
  describe("domain safeguards (unit)", () => {
    it("validates escrow release eligibility states", () => {
      for (const status of ["held", "in_execution", "awaiting_acceptance"] as const) {
        assert.ok(RELEASE_ELIGIBLE_ESCROW_STATUSES.has(status));
        assert.doesNotThrow(() => assertEscrowCanRelease(status));
      }
      assert.throws(() => assertEscrowCanRelease("released"), financialError(ErrorCodes.INVALID_TRANSITION));
      assert.throws(() => assertEscrowCanRelease("refunded"), financialError(ErrorCodes.INVALID_TRANSITION));
    });

    it("enforces journal balance invariants", () => {
      const entries = [
        {
          accountId: "escrow",
          direction: "debit" as const,
          amountMinor: 10_000,
          currencyCode: "USD",
          entryType: "hold" as const,
          sequenceNo: 1,
        },
        {
          accountId: "clearing",
          direction: "credit" as const,
          amountMinor: 10_000,
          currencyCode: "USD",
          entryType: "hold" as const,
          sequenceNo: 2,
        },
      ];
      assert.doesNotThrow(() => assertJournalBalanced(entries));
      assert.equal(computeJournalNetByCurrency(entries).get("USD"), 0);
    });

    it("rejects refunds exceeding escrow gross amount", () => {
      assert.throws(
        () =>
          assertRefundDoesNotExceedEscrow({
            refundAmountMinor: 60_000,
            escrowGrossAmountMinor: 50_000,
          }),
        financialError(ErrorCodes.VALIDATION_ERROR)
      );
    });

    it("rejects release journals while escrow is frozen", () => {
      assert.throws(
        () =>
          validateJournalDraft({
            journalType: "escrow_release",
            escrowStatus: "frozen",
            entries: [
              {
                accountId: "escrow",
                direction: "credit",
                amountMinor: 10_000,
                currencyCode: "USD",
                entryType: "release",
                sequenceNo: 1,
              },
              {
                accountId: "provider",
                direction: "debit",
                amountMinor: 10_000,
                currencyCode: "USD",
                entryType: "release",
                sequenceNo: 2,
              },
            ],
          }),
        financialError(ErrorCodes.INVALID_TRANSITION)
      );
    });
  });

  describe("service safeguards (PostgreSQL integration)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) {
        return;
      }
      try {
        runMigrations();
        db = await createTestDbPool();
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("verifies ledger balance after hold and release journals", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const { escrow: escrowService } = createS3FinancialServices(db);

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 100_000,
        platformFeeMinor: 10_000,
        currencyCode: "USD",
        idempotencyKey: "s3-ledger-create",
      });
      await escrowService.markFunded({ contractId: contract.id, idempotencyKey: "s3-ledger-funded" });
      await escrowService.holdFunds({ contractId: contract.id, idempotencyKey: "s3-ledger-hold" });

      await db.query(
        `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
        [contract.id]
      );
      await escrowService.releaseAfterAcceptance({
        contractId: contract.id,
        idempotencyKey: "s3-ledger-release",
      });

      const imbalance = await db.query<{ journal_id: string; net: string }>(
        `
          SELECT journal_id,
                 SUM(CASE WHEN direction = 'debit' THEN amount_minor ELSE -amount_minor END)::text AS net
          FROM financial.ledger_entries
          GROUP BY journal_id
          HAVING SUM(CASE WHEN direction = 'debit' THEN amount_minor ELSE -amount_minor END) <> 0
        `
      );
      assert.equal(imbalance.rowCount, 0);
    });

    it("validates escrow terminal states after release", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const { escrow: escrowService } = createS3FinancialServices(db);

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 80_000,
        platformFeeMinor: 8_000,
        currencyCode: "USD",
        idempotencyKey: "s3-state-create",
      });
      await escrowService.markFunded({ contractId: contract.id, idempotencyKey: "s3-state-funded" });
      await escrowService.holdFunds({ contractId: contract.id, idempotencyKey: "s3-state-hold" });
      await db.query(
        `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
        [contract.id]
      );
      await escrowService.releaseAfterAcceptance({
        contractId: contract.id,
        idempotencyKey: "s3-state-release",
      });

      const escrow = await escrowService.getByContractId(contract.id);
      assert.equal(escrow?.status, "released");
      assert.ok(escrow?.releasedAt);
    });

    it("prevents double release with a new idempotency key", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const { escrow: escrowService } = createS3FinancialServices(db);

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 90_000,
        platformFeeMinor: 9_000,
        currencyCode: "USD",
        idempotencyKey: "s3-double-release-create",
      });
      await escrowService.markFunded({
        contractId: contract.id,
        idempotencyKey: "s3-double-release-funded",
      });
      await escrowService.holdFunds({
        contractId: contract.id,
        idempotencyKey: "s3-double-release-hold",
      });
      await db.query(
        `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
        [contract.id]
      );
      await escrowService.releaseAfterAcceptance({
        contractId: contract.id,
        idempotencyKey: "s3-double-release-first",
      });

      await assert.rejects(
        () =>
          escrowService.releaseAfterAcceptance({
            contractId: contract.id,
            idempotencyKey: "s3-double-release-second",
          }),
        financialError(ErrorCodes.INVALID_TRANSITION)
      );

      const journalCount = await db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM financial.journals WHERE journal_type = 'escrow_release'`
      );
      assert.equal(Number(journalCount.rows[0]!.count), 1);
    });

    it("prevents double refund beyond escrow gross amount", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const { escrow: escrowService } = createS3FinancialServices(db);

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 60_000,
        platformFeeMinor: 6_000,
        currencyCode: "USD",
        idempotencyKey: "s3-double-refund-create",
      });
      await escrowService.markFunded({
        contractId: contract.id,
        idempotencyKey: "s3-double-refund-funded",
      });
      await escrowService.holdFunds({
        contractId: contract.id,
        idempotencyKey: "s3-double-refund-hold",
      });

      await escrowService.refund({
        contractId: contract.id,
        refundAmountMinor: 40_000,
        idempotencyKey: "s3-double-refund-first",
      });

      await assert.rejects(
        () =>
          escrowService.refund({
            contractId: contract.id,
            refundAmountMinor: 30_000,
            idempotencyKey: "s3-double-refund-second",
          }),
        financialError(ErrorCodes.VALIDATION_ERROR)
      );
    });

    it("maintains journal consistency across idempotent replay", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const { escrow: escrowService } = createS3FinancialServices(db);

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 50_000,
        platformFeeMinor: 5_000,
        currencyCode: "USD",
        idempotencyKey: "s3-idem-create",
      });
      await escrowService.markFunded({
        contractId: contract.id,
        idempotencyKey: "s3-idem-funded",
      });

      const first = await escrowService.holdFunds({
        contractId: contract.id,
        idempotencyKey: "s3-idem-hold",
      });
      const second = await escrowService.holdFunds({
        contractId: contract.id,
        idempotencyKey: "s3-idem-hold",
      });

      assert.equal(first.journal.id, second.journal.id);
      assert.equal(second.idempotentReplay, true);

      const journalCount = await db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM financial.journals WHERE idempotency_key = 's3-idem-hold'`
      );
      assert.equal(Number(journalCount.rows[0]!.count), 1);
    });
  });
});
