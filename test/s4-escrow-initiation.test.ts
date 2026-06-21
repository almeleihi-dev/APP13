import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Contract } from "../src/contract/domain/contract.js";
import type { EscrowAgreement } from "../src/financial/domain/escrow.js";
import {
  buildEscrowInitiationView,
  buildEscrowSummary,
  buildFundingInstructions,
  buildFundingReferenceNumber,
  createEscrowInitiationService,
  projectPlatformFeeMinor,
  readContractValueMinor,
} from "../src/financial-experience/module.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { createEscrowService } from "../src/financial/application/escrow-service.js";
import { createLedgerService } from "../src/financial/application/ledger-service.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  activateS3Contract,
  resetS3FinancialData,
} from "./helpers/s3-financial-harness.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const FIXED_TIME = new Date("2026-06-19T23:00:00.000Z");

function buildContractFixture(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "00000000-0000-4000-8000-000000000400",
    actionId: "00000000-0000-4000-8000-000000000401",
    customerId: "00000000-0000-4000-8000-000000000402",
    providerId: "00000000-0000-4000-8000-000000000403",
    contractNumber: "CTR-2026-TEST01",
    templateId: "CT-E.3.1@v1",
    templateVersion: "1.0.0",
    jurisdictionPack: "US-GENERIC-v1",
    status: "active",
    tekrrSnapshot: {},
    commercialTerms: {
      estimated_value: 10_000,
      currency_code: "SAR",
    },
    verificationSnapshot: null,
    documentHash: "sha256:test",
    pdfStorageKey: "contracts/test.pdf",
    customerAcceptedAt: FIXED_TIME,
    providerAcceptedAt: FIXED_TIME,
    activatedAt: FIXED_TIME,
    completedAt: null,
    complaintWindowEndsAt: null,
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    ...overrides,
  };
}

function buildEscrowFixture(overrides: Partial<EscrowAgreement> = {}): EscrowAgreement {
  return {
    id: "00000000-0000-4000-8000-000000000500",
    contractId: "00000000-0000-4000-8000-000000000400",
    status: "pending_funding",
    grossAmountMinor: 1_000_000,
    platformFeeMinor: 50_000,
    currencyCode: "SAR",
    feePolicySnapshot: {},
    paymentIntentId: null,
    frozenAt: null,
    frozenReason: null,
    frozenByIssueId: null,
    fundedAt: null,
    releasedAt: null,
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    ...overrides,
  };
}

describe("S4.4 Escrow Initiation Experience", () => {
  describe("projection layer (unit)", () => {
    it("projects escrow initiation view with fee visibility", () => {
      const contract = buildContractFixture();
      const view = buildEscrowInitiationView({
        contract,
        escrow: null,
        generatedAt: FIXED_TIME,
      });

      assert.ok(view);
      assert.equal(view!.contractValue, "10,000.00 SAR");
      assert.equal(view!.platformFee, "500.00 SAR");
      assert.equal(view!.fundingAmount, "10,500.00 SAR");
      assert.equal(view!.escrowAmount, "10,000.00 SAR");
      assert.equal(view!.status, "awaiting_escrow");
    });

    it("builds funding instructions with reference number and guidance", () => {
      const contract = buildContractFixture();
      const summary = buildEscrowSummary({ contract, escrow: null })!;
      const instructions = buildFundingInstructions({
        contractNumber: contract.contractNumber,
        summary,
      });

      assert.equal(
        instructions.referenceNumber,
        buildFundingReferenceNumber(contract.contractNumber)
      );
      assert.equal(instructions.amount, "10,500.00 SAR");
      assert.match(instructions.paymentExplanation, /protected in escrow/);
      assert.match(instructions.paymentExplanation, /platform fee/);
      assert.match(instructions.customerGuidance, /APP13-CTR-2026-TEST01/);
    });

    it("reads existing escrow data when an agreement is present", () => {
      const contract = buildContractFixture();
      const escrow = buildEscrowFixture();
      const summary = buildEscrowSummary({ contract, escrow })!;

      assert.equal(summary.contractValueMinor, 1_000_000);
      assert.equal(summary.platformFeeMinor, 50_000);
      assert.equal(summary.fundingAmountMinor, 1_050_000);
      assert.equal(summary.currencyCode, "SAR");
    });

    it("projects platform fee from commercial terms when provided", () => {
      const terms = { platform_fee: 750 };
      const contractValueMinor = readContractValueMinor({ estimated_value: 10_000 });
      assert.equal(projectPlatformFeeMinor(contractValueMinor, terms), 75_000);
    });

    it("returns deterministic escrow initiation output", () => {
      const contract = buildContractFixture();
      const first = buildEscrowInitiationView({
        contract,
        escrow: null,
        generatedAt: FIXED_TIME,
      });
      const second = buildEscrowInitiationView({
        contract,
        escrow: null,
        generatedAt: FIXED_TIME,
      });

      assert.deepEqual(first, second);
    });
  });

  describe("PostgreSQL integration", () => {
    let db: DbPool | undefined;
    let postgresReady = false;

    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
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

    it("builds escrow initiation view from a real active contract", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      await contractRepository.updateCommercialTerms(db.pool, contract.id, {
        estimated_value: 10_000,
        currency_code: "SAR",
      });

      const service = createEscrowInitiationService({
        db,
        contracts: contractRepository,
        escrow: createEscrowService(db, createLedgerService(db)),
        ledger: createLedgerService(db),
      });

      const view = await service.buildEscrowInitiationView(contract.id, FIXED_TIME);
      assert.ok(view);
      assert.equal(view!.contractNumber, contract.contract_number);
      assert.equal(view!.contractValue, "10,000.00 SAR");
      assert.equal(view!.platformFee, "500.00 SAR");
      assert.equal(view!.fundingAmount, "10,500.00 SAR");
      assert.match(view!.fundingInstructions.paymentExplanation, /10,500.00 SAR/);
    });

    it("reads escrow agreement amounts when escrow already exists", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3FinancialData(db);
      const { contract } = await activateS3Contract(db);
      const escrowService = createEscrowService(db, createLedgerService(db));

      await escrowService.createForContract({
        contractId: contract.id,
        grossAmountMinor: 1_000_000,
        platformFeeMinor: 50_000,
        currencyCode: "SAR",
        idempotencyKey: "s4-escrow-read-fixture",
      });

      const service = createEscrowInitiationService({
        db,
        contracts: contractRepository,
        escrow: escrowService,
        ledger: createLedgerService(db),
      });

      const summary = await service.buildEscrowSummary(contract.id);
      assert.ok(summary);
      assert.equal(summary!.contractValueMinor, 1_000_000);
      assert.equal(summary!.platformFeeMinor, 50_000);
      assert.equal(summary!.fundingAmount, "10,500.00 SAR");
    });
  });
});
