import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import type { Contract } from "../src/contract/domain/contract.js";
import type { EscrowAgreement } from "../src/financial/domain/escrow.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerEscrowPaymentRoutes } from "../src/api/routes/escrow-payment.js";
import { createEscrowPaymentExperienceModule } from "../src/experience/escrow-payment/module.js";
import {
  buildEscrowPaymentExperience,
  buildEscrowPaymentSummary,
  buildFinancialTimeline,
  buildFundingProgress,
  buildFundingReadiness,
  buildPaymentBreakdown,
  buildReleaseReadiness,
  type EscrowPaymentSnapshot,
} from "../src/experience/escrow-payment/domain/escrow-payment-experience.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const FIXED_TIME = new Date("2026-06-19T20:00:00.000Z");

function buildContractFixture(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "contract-1",
    actionId: "action-1",
    customerId: "customer-1",
    providerId: "provider-1",
    contractNumber: "CTR-2026-X6TEST",
    templateId: "CT-E.3.1@v1",
    templateVersion: "1.0.0",
    jurisdictionPack: "US-GENERIC-v1",
    status: "active",
    tekrrSnapshot: {},
    commercialTerms: {
      estimated_value: 9000,
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
    id: "escrow-1",
    contractId: "contract-1",
    status: "pending_funding",
    grossAmountMinor: 900_000,
    platformFeeMinor: 45_000,
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

const BASE_SNAPSHOT: EscrowPaymentSnapshot = {
  contractId: "contract-1",
  contractNumber: "CTR-2026-X6TEST",
  contractStatus: "active",
  customerUserId: "customer-user-1",
  providerUserId: "provider-user-1",
  customerDisplayName: "X6 Customer",
  providerDisplayName: "X6 Provider",
  commercialTerms: {
    estimated_value: 9000,
    currency_code: "SAR",
  },
  contract: buildContractFixture(),
  escrow: buildEscrowFixture(),
  milestones: {
    totalMilestones: 2,
    completedMilestones: 0,
    inProgressMilestones: 1,
    pendingMilestones: 1,
  },
  openIssueCount: 0,
  journalEvents: [],
  escrowStatusEvents: [
    {
      fromStatus: null,
      toStatus: "pending_funding",
      occurredAt: new Date("2026-06-19T18:00:00.000Z"),
    },
  ],
  inboxEvents: [],
};

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x6-escrow-payment-test-session",
  };
}

interface X6Parties {
  customerUserId: string;
  providerUserId: string;
  customerId: string;
  providerId: string;
}

async function seedX6Parties(db: DbPool): Promise<X6Parties> {
  const existing = await db.query<{
    customer_user_id: string;
    provider_user_id: string;
    customer_id: string;
    provider_id: string;
  }>(
    `
      SELECT
        cu.id AS customer_user_id,
        pu.id AS provider_user_id,
        c.id AS customer_id,
        p.id AS provider_id
      FROM identity.users cu
      JOIN identity.customers c ON c.user_id = cu.id
      JOIN identity.users pu ON pu.email = 'provider-x6@test.app13'
      JOIN identity.providers p ON p.user_id = pu.id
      WHERE cu.email = 'customer-x6@test.app13'
      LIMIT 1
    `
  );

  if (existing.rows[0]) {
    return {
      customerUserId: existing.rows[0].customer_user_id,
      providerUserId: existing.rows[0].provider_user_id,
      customerId: existing.rows[0].customer_id,
      providerId: existing.rows[0].provider_id,
    };
  }

  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x6@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x6@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X6 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X6 Provider', 'active')
      RETURNING id
    `,
    [providerUser.rows[0].id]
  );

  return {
    customerUserId: customerUser.rows[0].id,
    providerUserId: providerUser.rows[0].id,
    customerId: customer.rows[0].id,
    providerId: provider.rows[0].id,
  };
}

async function cleanupX6Data(db: DbPool) {
  const contracts = await db.query<{ id: string }>(
    `
      SELECT DISTINCT c.id
      FROM contract.contracts c
      LEFT JOIN identity.customers cust ON cust.id = c.customer_id
      LEFT JOIN identity.users cu ON cu.id = cust.user_id
      LEFT JOIN identity.providers prov ON prov.id = c.provider_id
      LEFT JOIN identity.users pu ON pu.id = prov.user_id
      WHERE cu.email = 'customer-x6@test.app13'
         OR pu.email = 'provider-x6@test.app13'
    `
  );
  const contractIds = contracts.rows.map((row) => row.id);

  if (contractIds.length > 0) {
    await db.query(`DELETE FROM execution.evidence WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(`DELETE FROM execution.milestones WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(
      `
        DELETE FROM financial.payment_intents
        WHERE escrow_id IN (
          SELECT id FROM financial.escrow_agreements WHERE contract_id = ANY($1::uuid[])
        )
      `,
      [contractIds]
    );
    await db.query(
      `
        DELETE FROM financial.ledger_entries
        WHERE journal_id IN (
          SELECT id FROM financial.journals WHERE contract_id = ANY($1::uuid[])
        )
      `,
      [contractIds]
    );
    await db.query(`DELETE FROM financial.journals WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(
      `
        DELETE FROM financial.escrow_status_history
        WHERE escrow_id IN (
          SELECT id FROM financial.escrow_agreements WHERE contract_id = ANY($1::uuid[])
        )
      `,
      [contractIds]
    );
    await db.query(`DELETE FROM financial.escrow_agreements WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(`DELETE FROM contract.contract_status_history WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(`DELETE FROM contract.contract_parties WHERE contract_id = ANY($1::uuid[])`, [
      contractIds,
    ]);
    await db.query(`DELETE FROM contract.contracts WHERE id = ANY($1::uuid[])`, [contractIds]);
  }
}

async function seedX6Contract(db: DbPool, parties: X6Parties) {
  const existingAction = await db.query<{ id: string }>(
    `
      SELECT id
      FROM action.actions
      WHERE provider_id = $1
        AND title = 'X6 provider offering'
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [parties.providerId]
  );

  const actionId =
    existingAction.rows[0]?.id ??
    (
      await db.query<{ id: string }>(
        `
          INSERT INTO action.actions (
            action_code,
            action_name,
            domain,
            status,
            customer_id,
            provider_id,
            title,
            tekrr_completeness
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 100)
          RETURNING id
        `,
        [
          "technology.code",
          "Technology — Code",
          "E",
          "ready_for_contract",
          parties.customerId,
          parties.providerId,
          "X6 provider offering",
        ]
      )
    ).rows[0].id;

  const contract = await db.query<{ id: string }>(
    `
      INSERT INTO contract.contracts (
        action_id,
        customer_id,
        provider_id,
        contract_number,
        template_id,
        template_version,
        jurisdiction_pack,
        status,
        tekrr_snapshot,
        commercial_terms,
        document_hash,
        pdf_storage_key,
        payment_ready,
        escrow_ready
      )
      VALUES (
        $1, $2, $3, 'CTR-2026-X6TEST', 'CT-E.3.1@v1', '1.0.0', 'US-GENERIC-v1', 'active',
        '{}'::jsonb, '{"estimated_value":9000,"currency_code":"SAR"}'::jsonb,
        'sha256:x6', 'contracts/x6.pdf', true, true
      )
      RETURNING id
    `,
    [actionId, parties.customerId, parties.providerId]
  );

  await db.query(
    `
      INSERT INTO contract.contract_parties (contract_id, user_id, party_role, accepted_at)
      VALUES ($1, $2, 'customer', now()), ($1, $3, 'provider', now())
    `,
    [contract.rows[0].id, parties.customerUserId, parties.providerUserId]
  );

  await db.query(
    `
      INSERT INTO financial.escrow_agreements (
        contract_id,
        status,
        gross_amount_minor,
        platform_fee_minor,
        currency_code,
        fee_policy_snapshot
      )
      VALUES ($1, 'pending_funding', 900000, 45000, 'SAR', '{}'::jsonb)
    `,
    [contract.rows[0].id]
  );

  return contract.rows[0].id;
}

let db: DbPool | undefined;
let postgresReady = false;
let customerUserId: string | undefined;
let contractId: string | undefined;

describe("X6 Escrow & Payment Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds escrow summary with contract value and platform fee", () => {
      const summary = buildEscrowPaymentSummary(BASE_SNAPSHOT);
      assert.ok(summary);
      assert.match(summary!.contractValueLabel, /9,000.00 SAR/);
      assert.match(summary!.platformFeeLabel, /450.00 SAR/);
      assert.equal(summary!.fundingReferenceNumber, "APP13-CTR-2026-X6TEST");
    });

    it("builds payment breakdown with net provider earnings and refund visibility", () => {
      const breakdown = buildPaymentBreakdown(BASE_SNAPSHOT);
      assert.ok(breakdown);
      assert.match(breakdown!.netProviderEarningsLabel, /8,550/);
      assert.equal(breakdown!.refundVisible, false);
    });

    it("builds funding progress for pending funding escrow", () => {
      const progress = buildFundingProgress(BASE_SNAPSHOT);
      assert.equal(progress.totalStageCount, 5);
      assert.equal(progress.completedStageCount, 1);
      assert.equal(progress.currentStage, "customer_funding");
    });

    it("marks funding readiness as ready_to_fund for pending funding escrow", () => {
      const readiness = buildFundingReadiness(BASE_SNAPSHOT);
      assert.equal(readiness.status, "ready_to_fund");
      assert.equal(readiness.canFund, true);
    });

    it("marks release readiness as not ready before funding", () => {
      const readiness = buildReleaseReadiness(BASE_SNAPSHOT);
      assert.equal(readiness.status, "not_ready");
      assert.equal(readiness.canRelease, false);
    });

    it("builds financial timeline from escrow status history", () => {
      const timeline = buildFinancialTimeline(BASE_SNAPSHOT);
      assert.ok(timeline.events.length >= 1);
      assert.match(timeline.summary, /financial lifecycle event/);
    });

    it("composes full escrow payment experience deterministically", () => {
      const experience = buildEscrowPaymentExperience({
        snapshot: BASE_SNAPSHOT,
        perspective: "customer",
        generatedAt: FIXED_TIME,
      });

      assert.equal(experience.contractId, "contract-1");
      assert.equal(experience.escrowStatus.status, "pending_funding");
      assert.equal(experience.fundingReadiness.canFund, true);
      assert.equal(experience.recommendedNextAction.actionCode, "fund_escrow");
      assert.equal(experience.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await cleanupX6Data(db);

        const parties = await seedX6Parties(db);
        customerUserId = parties.customerUserId;
        contractId = await seedX6Contract(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes escrow payment experience from financial projections", async (t) => {
      if (!postgresReady || !db || !customerUserId || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { escrowPaymentExperience } = createEscrowPaymentExperienceModule(db);
      const view = await escrowPaymentExperience.getEscrowPaymentExperience(
        authContext(customerUserId),
        contractId
      );

      assert.equal(view.customer_user_id, customerUserId);
      assert.equal(view.contract_id, contractId);
      assert.equal(view.escrow_status.status, "pending_funding");
      assert.ok(view.summary.platform_fee_label.length > 0);
      assert.equal(view.funding_readiness.can_fund, true);
    });

    it("returns progress, timeline, and readiness endpoints", async (t) => {
      if (!postgresReady || !db || !customerUserId || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { escrowPaymentExperience } = createEscrowPaymentExperienceModule(db);

      const progress = await escrowPaymentExperience.getFundingProgress(
        authContext(customerUserId),
        contractId
      );
      assert.equal(progress.funding_progress.total_stage_count, 5);
      assert.equal(progress.funding_readiness.can_fund, true);

      const timeline = await escrowPaymentExperience.getFinancialTimeline(
        authContext(customerUserId),
        contractId
      );
      assert.ok(Array.isArray(timeline.events));

      const readiness = await escrowPaymentExperience.getFinancialReadiness(
        authContext(customerUserId),
        contractId
      );
      assert.equal(readiness.funding_readiness.can_fund, true);
      assert.equal(readiness.recommended_next_action.action_code, "fund_escrow");
    });

    it("rejects non-party access and serves escrow payment routes", async (t) => {
      if (!postgresReady || !db || !customerUserId || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const outsiderExisting = await db.query<{ id: string }>(
        `SELECT id FROM identity.users WHERE email = 'outsider-x6@test.app13'`
      );
      let outsiderUserId = outsiderExisting.rows[0]?.id;
      if (!outsiderUserId) {
        const outsider = await db.query<{ id: string }>(
          `
            INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
            VALUES ('outsider-x6@test.app13', 'hash', 'customer', now(), 'T1')
            RETURNING id
          `
        );
        outsiderUserId = outsider.rows[0].id;
        await db.query(
          `
            INSERT INTO identity.customers (user_id, display_name)
            VALUES ($1, 'X6 Outsider')
          `,
          [outsiderUserId]
        );
      }

      const { escrowPaymentExperience } = createEscrowPaymentExperienceModule(db);

      await assert.rejects(
        () =>
          escrowPaymentExperience.getEscrowPaymentExperience(
            authContext(outsiderUserId),
            contractId!
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerEscrowPaymentRoutes(app, escrowPaymentExperience);

      for (const path of [
        `/escrow-payment/${contractId}`,
        `/escrow-payment/${contractId}/progress`,
        `/escrow-payment/${contractId}/timeline`,
        `/escrow-payment/${contractId}/readiness`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
