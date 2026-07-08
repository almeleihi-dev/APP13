import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createLedgerService } from "../src/financial/application/ledger-service.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  runMigrations,
  seedPartyUsers,
  resetContractEngineData,
  isPostgresAvailable,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import type { EscrowStatus } from "../src/financial/domain/escrow.js";

let db: DbPool;
let postgresReady = false;

async function resetFinancialData(dbPool: DbPool): Promise<void> {
  await dbPool.query(`
    TRUNCATE TABLE
      financial.processor_webhook_log,
      financial.settlement_instructions,
      financial.payment_intents,
      financial.escrow_status_history,
      financial.ledger_entries,
      financial.journals,
      financial.escrow_agreements,
      financial.accounts
    RESTART IDENTITY CASCADE
  `);
  await resetContractEngineData(dbPool);
}

async function seedMinimalContract(dbPool: DbPool): Promise<string> {
  const parties = await seedPartyUsers(dbPool);
  const action = await dbPool.query<{ id: string }>(
    `
      INSERT INTO action.actions (
        action_code, action_name, domain, customer_id, provider_id,
        title, template_id, status, tekrr_completeness
      )
      VALUES ('A.2.1', 'Ledger test', 'A', $1, $2, 'T', 'CT-A.2.1@v1', 'contract_active', 100)
      RETURNING id
    `,
    [parties.customerId, parties.providerId]
  );
  const contract = await dbPool.query<{ id: string }>(
    `
      INSERT INTO contract.contracts (
        action_id, customer_id, provider_id, contract_number, template_id,
        template_version, jurisdiction_pack, status, tekrr_snapshot, document_hash,
        pdf_storage_key, payment_ready, escrow_ready
      )
      VALUES ($1, $2, $3, 'CTR-LEDGER-1', 'CT-A.2.1@v1', '1.0.0', 'US-GENERIC-v1', 'active',
              '{}', 'sha256:ledger', 'k-ledger', true, true)
      RETURNING id
    `,
    [action.rows[0].id, parties.customerId, parties.providerId]
  );
  return contract.rows[0].id;
}

interface EscrowFixture {
  contractId: string;
  escrowId: string;
  grossAmountMinor: number;
  platformFeeMinor: number;
  currencyCode: string;
  customerAccountId: string;
  escrowAccountId: string;
  providerAccountId: string;
  platformAccountId: string;
}

async function seedEscrowFixture(
  dbPool: DbPool,
  options?: { status?: EscrowStatus; grossAmountMinor?: number; platformFeeMinor?: number }
): Promise<EscrowFixture> {
  const contractId = await seedMinimalContract(dbPool);
  const grossAmountMinor = options?.grossAmountMinor ?? 100_000;
  const platformFeeMinor = options?.platformFeeMinor ?? 10_000;
  const status = options?.status ?? "funded";

  const escrow = await dbPool.query<{ id: string }>(
    `
      INSERT INTO financial.escrow_agreements (
        contract_id, gross_amount_minor, platform_fee_minor, currency_code, status
      )
      VALUES ($1, $2, $3, 'USD', $4)
      RETURNING id
    `,
    [contractId, grossAmountMinor, platformFeeMinor, status]
  );
  const escrowId = escrow.rows[0].id;

  const customerAccount = await dbPool.query<{ id: string }>(
    `
      INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
      VALUES ($1, 'customer_wallet', 'USD', 'platform')
      RETURNING id
    `,
    [`ledger:customer:${escrowId}`]
  );
  const escrowAccount = await dbPool.query<{ id: string }>(
    `
      INSERT INTO financial.accounts (
        account_code, account_type, currency_code, owner_entity_type, owner_entity_id
      )
      VALUES ($1, 'escrow_contract', 'USD', 'escrow', $2)
      RETURNING id
    `,
    [`ledger:escrow:${escrowId}`, escrowId]
  );
  const providerAccount = await dbPool.query<{ id: string }>(
    `
      INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
      VALUES ($1, 'provider_wallet', 'USD', 'platform')
      RETURNING id
    `,
    [`ledger:provider:${escrowId}`]
  );
  const platformAccount = await dbPool.query<{ id: string }>(
    `
      INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
      VALUES ($1, 'platform_revenue', 'USD', 'platform')
      RETURNING id
    `,
    [`ledger:platform:${escrowId}`]
  );

  return {
    contractId,
    escrowId,
    grossAmountMinor,
    platformFeeMinor,
    currencyCode: "USD",
    customerAccountId: customerAccount.rows[0].id,
    escrowAccountId: escrowAccount.rows[0].id,
    providerAccountId: providerAccount.rows[0].id,
    platformAccountId: platformAccount.rows[0].id,
  };
}

async function journalNet(dbPool: DbPool, journalId: string): Promise<number> {
  const result = await dbPool.query<{ net: string }>(
    `
      SELECT COALESCE(SUM(
        CASE WHEN direction = 'debit' THEN amount_minor ELSE -amount_minor END
      ), 0)::text AS net
      FROM financial.ledger_entries
      WHERE journal_id = $1
    `,
    [journalId]
  );
  return Number(result.rows[0].net);
}

describe("B6.4 LedgerService integration", () => {
  before(async () => {
    postgresReady = await isPostgresAvailable();
    if (!postgresReady) {
      throw new Error(
        `PostgreSQL unavailable at ${DEFAULT_DATABASE_URL} — run: docker compose up -d postgres`
      );
    }
    await runMigrations();
    db = await createTestDbPool();
  });

  after(async () => {
    if (db) await db.close();
  });

  it("creates balanced hold journal", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    const result = await ledger.fundEscrowHold({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-hold-1",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    assert.equal(result.journal.journalType, "escrow_hold");
    assert.equal(result.entries.length, 2);
    assert.equal(await journalNet(db, result.journal.id), 0);
    assert.equal(result.idempotentReplay, false);

    const escrow = await db.query<{ status: string }>(
      `SELECT status FROM financial.escrow_agreements WHERE id = $1`,
      [fixture.escrowId]
    );
    assert.equal(escrow.rows[0].status, "held");
  });

  it("rejects unbalanced journal", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    await assert.rejects(
      () =>
        ledger.postJournalStandalone({
          journalType: "escrow_hold",
          idempotencyKey: "ledger-unbalanced",
          escrowId: fixture.escrowId,
          contractId: fixture.contractId,
          entries: [
            {
              accountId: fixture.customerAccountId,
              direction: "debit",
              amountMinor: fixture.grossAmountMinor,
              currencyCode: fixture.currencyCode,
              entryType: "hold",
              sequenceNo: 1,
            },
            {
              accountId: fixture.escrowAccountId,
              direction: "credit",
              amountMinor: fixture.grossAmountMinor - 1,
              currencyCode: fixture.currencyCode,
              entryType: "hold",
              sequenceNo: 2,
            },
          ],
        }),
      (error) =>
        error instanceof AppError && error.problem.code === ErrorCodes.VALIDATION_ERROR
    );
  });

  it("idempotent duplicate journal returns existing result", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);
    const input = {
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-hold-idempotent",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    };

    const first = await ledger.fundEscrowHold(input);
    const second = await ledger.fundEscrowHold(input);

    assert.equal(second.journal.id, first.journal.id);
    assert.equal(second.idempotentReplay, true);
    assert.deepEqual(
      second.entries.map((entry) => entry.id),
      first.entries.map((entry) => entry.id)
    );

    const journalCount = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM financial.journals WHERE idempotency_key = $1`,
      [input.idempotencyKey]
    );
    assert.equal(Number(journalCount.rows[0].count), 1);
  });

  it("releases escrow into provider receivable + platform fee", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    await ledger.fundEscrowHold({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-release-hold",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    await db.query(
      `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE id = $1`,
      [fixture.escrowId]
    );

    const result = await ledger.releaseEscrow({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-release-1",
      providerAccountId: fixture.providerAccountId,
      platformAccountId: fixture.platformAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    assert.equal(result.journal.journalType, "escrow_release");
    assert.equal(await journalNet(db, result.journal.id), 0);

    const providerEntry = result.entries.find(
      (entry) => entry.accountId === fixture.providerAccountId && entry.entryType === "release"
    );
    const feeEntry = result.entries.find(
      (entry) => entry.accountId === fixture.platformAccountId && entry.entryType === "fee"
    );
    assert.ok(providerEntry);
    assert.ok(feeEntry);
    assert.equal(providerEntry.amountMinor, fixture.grossAmountMinor - fixture.platformFeeMinor);
    assert.equal(feeEntry.amountMinor, fixture.platformFeeMinor);

    const escrow = await db.query<{ status: string }>(
      `SELECT status FROM financial.escrow_agreements WHERE id = $1`,
      [fixture.escrowId]
    );
    assert.equal(escrow.rows[0].status, "released");
  });

  it("blocks release while frozen", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db, { status: "frozen" });
    const ledger = createLedgerService(db);

    await assert.rejects(
      () =>
        ledger.releaseEscrow({
          escrowId: fixture.escrowId,
          contractId: fixture.contractId,
          idempotencyKey: "ledger-release-frozen",
          providerAccountId: fixture.providerAccountId,
          platformAccountId: fixture.platformAccountId,
          escrowAccountId: fixture.escrowAccountId,
          currencyCode: fixture.currencyCode,
        }),
      (error) =>
        error instanceof AppError && error.problem.code === ErrorCodes.INVALID_TRANSITION
    );
  });

  it("refunds partial amount", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    await ledger.fundEscrowHold({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-refund-hold",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    const refundAmountMinor = 25_000;
    const result = await ledger.refundEscrow({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-partial-refund",
      refundAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    assert.equal(result.journal.journalType, "escrow_partial_refund");
    assert.equal(await journalNet(db, result.journal.id), 0);

    const escrow = await db.query<{ status: string }>(
      `SELECT status FROM financial.escrow_agreements WHERE id = $1`,
      [fixture.escrowId]
    );
    assert.equal(escrow.rows[0].status, "partially_refunded");
  });

  it("rejects refund greater than escrow gross", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    await ledger.fundEscrowHold({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-refund-limit-hold",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    await assert.rejects(
      () =>
        ledger.refundEscrow({
          escrowId: fixture.escrowId,
          contractId: fixture.contractId,
          idempotencyKey: "ledger-refund-too-large",
          refundAmountMinor: fixture.grossAmountMinor + 1,
          customerAccountId: fixture.customerAccountId,
          escrowAccountId: fixture.escrowAccountId,
          currencyCode: fixture.currencyCode,
        }),
      (error) =>
        error instanceof AppError && error.problem.code === ErrorCodes.VALIDATION_ERROR
    );
  });

  it("does not create balance columns or mutable balances", async () => {
    await resetFinancialData(db);
    const fixture = await seedEscrowFixture(db);
    const ledger = createLedgerService(db);

    await ledger.fundEscrowHold({
      escrowId: fixture.escrowId,
      contractId: fixture.contractId,
      idempotencyKey: "ledger-fk2-check",
      amountMinor: fixture.grossAmountMinor,
      customerAccountId: fixture.customerAccountId,
      escrowAccountId: fixture.escrowAccountId,
      currencyCode: fixture.currencyCode,
    });

    const balanceColumns = await db.query<{ table_name: string; column_name: string }>(
      `
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'financial'
          AND column_name ILIKE '%balance%'
      `
    );
    assert.equal(balanceColumns.rowCount, 0);

    const accountColumns = await db.query<{ column_name: string }>(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'financial'
          AND table_name = 'accounts'
      `
    );
    assert.deepEqual(
      accountColumns.rows.map((row) => row.column_name).sort(),
      [
        "account_code",
        "account_type",
        "created_at",
        "currency_code",
        "id",
        "owner_entity_id",
        "owner_entity_type",
      ].sort()
    );
  });
});
