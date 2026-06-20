import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createActionService } from "../src/action/application/action-service.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { createIssueService } from "../src/complaint/application/issue-service.js";
import { createEscrowService } from "../src/financial/application/escrow-service.js";
import { createLedgerService } from "../src/financial/application/ledger-service.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  resetContractEngineData,
  runMigrations,
  seedPartyUsers,
  FULL_TEKRR_PROFILE,
  isPostgresAvailable,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

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

async function activateContract(dbPool: DbPool, parties: Awaited<ReturnType<typeof seedPartyUsers>>) {
  const actions = createActionService(dbPool, identityRepository);
  const contracts = createContractEngineService(dbPool, identityRepository);

  const created = await actions.createAction(parties.customerUserId, {
    action_type_code: "A.2.1",
    title: "B6 escrow integration contract",
  });
  await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
  for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
    await actions.updateTekrrDimension(
      created.id,
      parties.customerUserId,
      dimension as keyof typeof FULL_TEKRR_PROFILE,
      data
    );
  }

  const { contract } = await contracts.generateContract(
    created.id,
    parties.customerUserId,
    "b6-escrow-generate"
  );
  const documentHash = contract.document_hash;

  await contracts.transitionContract(contract.id, parties.customerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });
  await contracts.transitionContract(contract.id, parties.providerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });

  return { contract, contracts };
}

function createServices(dbPool: DbPool) {
  const ledger = createLedgerService(dbPool);
  const escrow = createEscrowService(dbPool, ledger);
  const issues = createIssueService(dbPool, contractRepository, undefined, escrow);
  return { ledger, escrow, issues };
}

describe("B6.5 EscrowService integration", () => {
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

  it("creates escrow for contract", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService } = createServices(db);

    const agreement = await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 100_000,
      platformFeeMinor: 10_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create",
    });

    assert.equal(agreement.contractId, contract.id);
    assert.equal(agreement.status, "pending_funding");
    assert.equal(agreement.grossAmountMinor, 100_000);
    assert.equal(agreement.platformFeeMinor, 10_000);

    const history = await db.query<{ to_status: string; from_status: string | null }>(
      `SELECT from_status, to_status FROM financial.escrow_status_history WHERE escrow_id = $1`,
      [agreement.id]
    );
    assert.equal(history.rowCount, 1);
    assert.equal(history.rows[0].from_status, null);
    assert.equal(history.rows[0].to_status, "pending_funding");
  });

  it("funding transitions escrow correctly", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 80_000,
      platformFeeMinor: 8_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-funded",
    });

    const funded = await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded",
    });

    assert.equal(funded.status, "funded");
    assert.ok(funded.fundedAt);
  });

  it("hold creates ledger journal", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 75_000,
      platformFeeMinor: 7_500,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-hold",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-hold",
    });

    const result = await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold",
    });

    assert.equal(result.journal.journalType, "escrow_hold");
    assert.equal(result.entries.length, 2);

    const escrow = await escrowService.getByContractId(contract.id);
    assert.equal(escrow?.status, "held");

    const journalCount = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM financial.journals WHERE escrow_id = $1`,
      [escrow!.id]
    );
    assert.equal(Number(journalCount.rows[0].count), 1);
  });

  it("issue_raised freezes escrow", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService, issues } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 90_000,
      platformFeeMinor: 9_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-freeze",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-freeze",
    });
    await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold-freeze",
    });

    await issues.createIssue(parties.customerUserId, {
      contract_id: contract.id,
      description: "Surface finish does not meet acceptance criteria",
      dimensions: [{ tekrr_dimension: "S" }],
      idempotency_key: "b6-escrow-issue-freeze",
    });

    const escrow = await escrowService.getByContractId(contract.id);
    assert.equal(escrow?.status, "frozen");
    assert.equal(escrow?.frozenReason, "issue_raised");
    assert.ok(escrow?.frozenByIssueId);
  });

  it("release blocked while frozen", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService, issues } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 90_000,
      platformFeeMinor: 9_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-blocked",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-blocked",
    });
    await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold-blocked",
    });

    await db.query(
      `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
      [contract.id]
    );

    await issues.createIssue(parties.customerUserId, {
      contract_id: contract.id,
      description: "Quality concern on milestone delivery scope",
      dimensions: [{ tekrr_dimension: "E" }],
      idempotency_key: "b6-escrow-issue-blocked",
    });

    await assert.rejects(
      () =>
        escrowService.releaseAfterAcceptance({
          contractId: contract.id,
          idempotencyKey: "b6-escrow-release-blocked",
        }),
      (error) =>
        error instanceof AppError && error.problem.code === ErrorCodes.INVALID_TRANSITION
    );
  });

  it("issue_resolved allows release/refund", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService, issues } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 100_000,
      platformFeeMinor: 10_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-resolve",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-resolve",
    });
    await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold-resolve",
    });
    await db.query(
      `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
      [contract.id]
    );

    await issues.createIssue(parties.customerUserId, {
      contract_id: contract.id,
      description: "Issue resolved path for escrow release eligibility",
      dimensions: [{ tekrr_dimension: "S" }],
      idempotency_key: "b6-escrow-issue-resolve",
    });

    await contractRepository.transition(
      db.pool,
      contract.id,
      "disputed",
      parties.customerUserId,
      "issue_raised"
    );
    await contractRepository.transition(
      db.pool,
      contract.id,
      "resolved",
      parties.customerUserId,
      "disputed"
    );

    const unblocked = await escrowService.unfreezeAfterIssueResolved({
      contractId: contract.id,
      actorUserId: parties.customerUserId,
    });
    assert.equal(unblocked?.status, "awaiting_acceptance");

    const release = await escrowService.releaseAfterAcceptance({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-release-resolve",
    });
    assert.equal(release.journal.journalType, "escrow_release");
  });

  it("release records provider receivable + platform fee", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 100_000,
      platformFeeMinor: 10_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-release",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-release",
    });
    await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold-release",
    });
    await db.query(
      `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
      [contract.id]
    );

    const result = await escrowService.releaseAfterAcceptance({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-release-fee",
    });

    const feeEntry = result.entries.find(
      (entry) => entry.entryType === "fee" && entry.direction === "debit"
    );
    const providerEntry = result.entries.find(
      (entry) => entry.entryType === "release" && entry.direction === "debit"
    );
    assert.ok(feeEntry);
    assert.ok(providerEntry);
    assert.equal(feeEntry.amountMinor, 10_000);
    assert.equal(providerEntry.amountMinor, 90_000);
  });

  it("refund records customer refund", async () => {
    await resetFinancialData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const { escrow: escrowService } = createServices(db);

    await escrowService.createForContract({
      contractId: contract.id,
      grossAmountMinor: 60_000,
      platformFeeMinor: 6_000,
      currencyCode: "USD",
      idempotencyKey: "b6-escrow-create-refund",
    });
    await escrowService.markFunded({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-funded-refund",
    });
    await escrowService.holdFunds({
      contractId: contract.id,
      idempotencyKey: "b6-escrow-hold-refund",
    });

    const result = await escrowService.refund({
      contractId: contract.id,
      refundAmountMinor: 25_000,
      idempotencyKey: "b6-escrow-refund",
    });

    const customerEntry = result.entries.find(
      (entry) => entry.direction === "debit" && entry.entryType === "partial_refund"
    );
    assert.ok(customerEntry);
    assert.equal(customerEntry.amountMinor, 25_000);

    const escrow = await escrowService.getByContractId(contract.id);
    assert.equal(escrow?.status, "partially_refunded");
  });
});
