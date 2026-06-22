import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProviderDashboardRoutes } from "../src/api/routes/provider-dashboard.js";
import {
  buildProviderDashboardSummary,
  buildProviderEarningsSummary,
  buildProviderEscrowStatus,
  buildProviderExecutionStatus,
  buildProviderIssueSummary,
  deriveProviderNextRecommendedAction,
  mapProviderContractStatusLabel,
  mapProviderOfferStatusLabel,
} from "../src/provider-workspace/domain/provider-dashboard.js";
import { createProviderWorkspaceModule } from "../src/provider-workspace/module.js";
import { createConversionModule } from "../src/conversion/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { TEST_AUTH_CONTEXT } from "./helpers/experience-server-integration.js";

const WEBSITE_REQUEST =
  "We need to build company website with design, coding, testing, and deployment.";

async function seedS10Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s10@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s10@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S10 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'S10 Provider', 'active')
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

async function seedProviderAction(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS10Parties>>
) {
  const action = await db.query<{ id: string }>(
    `
      INSERT INTO action.actions (
        action_code,
        action_name,
        domain,
        status,
        customer_id,
        provider_id,
        title
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      "technology.code",
      "Technology — Code",
      "E",
      "ready_for_contract",
      parties.customerId,
      parties.providerId,
      "S10 provider offering",
    ]
  );

  return action.rows[0].id;
}

async function seedCustomerRequest(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS10Parties>>
) {
  const request = await db.query<{ id: string }>(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        budget_minor,
        preferred_days,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'matched')
      RETURNING id
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );

  return request.rows[0].id;
}

let db: DbPool | undefined;
let postgresReady = false;
let parties: Awaited<ReturnType<typeof seedS10Parties>> | undefined;
let providerActionId: string | undefined;
let customerRequestId: string | undefined;

describe("S10 Provider Work Dashboard", () => {
  describe("projection layer (unit)", () => {
    it("maps provider-facing status labels", () => {
      assert.equal(mapProviderOfferStatusLabel("draft_previewed"), "Draft viewed");
      assert.equal(mapProviderContractStatusLabel("active"), "In progress");
    });

    it("derives provider next recommended action", () => {
      const nextAction = deriveProviderNextRecommendedAction({
        offers: [
          {
            offerId: "offer-1",
            customerRequestId: "req-1",
            customerDisplayName: "S10 Customer",
            requestSummary: "Website build",
            selectedActionCode: "technology.code",
            selectedActionName: "Technology — Code",
            status: "draft_previewed",
            statusLabel: "Draft viewed",
            contractId: null,
            summary: "Draft viewed by customer",
            nextAction: "Wait for customer acceptance",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        contracts: [],
        openIssues: 0,
        pendingEscrowCount: 0,
      });

      assert.equal(nextAction, "Wait for customer acceptance");
    });

    it("builds provider dashboard summary counts", () => {
      const earnings = buildProviderEarningsSummary({
        providerId: "provider-1",
        currencyCode: "USD",
        releasedEarningsMinor: 90000,
        releasedEarningsLabel: "900.00 USD",
        pendingHeldMinor: 45000,
        pendingHeldLabel: "450.00 USD",
        walletBalanceMinor: 90000,
        walletBalanceLabel: "900.00 USD",
        contractsWithEarnings: 1,
      });

      const summary = buildProviderDashboardSummary({
        offers: [
          {
            offerId: "offer-1",
            customerRequestId: "req-1",
            customerDisplayName: "S10 Customer",
            requestSummary: "Website build",
            selectedActionCode: "technology.code",
            selectedActionName: "Technology — Code",
            status: "draft_previewed",
            statusLabel: "Draft viewed",
            contractId: null,
            summary: "Draft viewed by customer",
            nextAction: "Wait for customer acceptance",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        contracts: [
          {
            contractId: "contract-1",
            contractNumber: "C-1001",
            actionId: "action-1",
            actionCode: "technology.code",
            actionTitle: "Website build",
            customerDisplayName: "S10 Customer",
            status: "active",
            statusLabel: "In progress",
            customerRequestId: "req-1",
            offerId: "offer-1",
            escrow: buildProviderEscrowStatus({
              contractId: "contract-1",
              escrowId: "escrow-1",
              status: "held",
              heldAmountLabel: "450.00 USD",
            }),
            execution: buildProviderExecutionStatus({
              contractId: "contract-1",
              totalMilestones: 2,
              completedMilestones: 0,
              inProgressMilestones: 1,
              pendingMilestones: 1,
            }),
            evidence: {
              contractId: "contract-1",
              evidenceCount: 1,
              statusLabel: "Submitted",
              summary: "1 evidence item submitted.",
            },
            issue: buildProviderIssueSummary({
              contractId: "contract-1",
              openIssueCount: 0,
              latestIssueStatus: null,
            }),
            summary: "Active contract",
            nextAction: "Continue milestone delivery",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        earnings,
      });

      assert.equal(summary.incomingOffers, 1);
      assert.equal(summary.activeContracts, 1);
      assert.equal(summary.releasedEarningsLabel, "900.00 USD");
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.match_contract_offers`);
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(`DELETE FROM action.actions WHERE title = 'S10 provider offering'`);
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s10@test.app13', 'provider-s10@test.app13')
          `
        );
        parties = await seedS10Parties(db);
        providerActionId = await seedProviderAction(db, parties);
        customerRequestId = await seedCustomerRequest(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("aggregates offers, contracts, trust, and earnings for provider dashboard", async (t) => {
      if (!postgresReady || !db || !parties || !providerActionId || !customerRequestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { matchContractConversion } = createConversionModule(db);
      const offer = await matchContractConversion.createContractOffer(parties.customerUserId, {
        customer_request_id: customerRequestId,
        provider_user_id: parties.providerUserId,
        selected_action_id: providerActionId,
        idempotency_key: `s10-dashboard:${Date.now()}`,
      });
      await matchContractConversion.getContractDraftPreview(parties.customerUserId, offer.id);
      await matchContractConversion.acceptContractOffer(parties.customerUserId, offer.id);

      const { providerDashboard } = createProviderWorkspaceModule(db);
      const dashboard = await providerDashboard.getDashboard(
        parties.providerUserId,
        parties.providerUserId
      );

      assert.equal(dashboard.provider_user_id, parties.providerUserId);
      assert.equal(dashboard.offers.length, 1);
      assert.equal(dashboard.contracts.length, 1);
      assert.equal(dashboard.offers[0]?.status, "contract_created");
      assert.ok(dashboard.trust.trust_score >= 0);
      assert.ok(dashboard.summary.next_recommended_action);
      assert.ok(dashboard.earnings.summary);
    });

    it("exposes provider dashboard routes", async (t) => {
      if (!postgresReady || !db || !parties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { providerDashboard } = createProviderWorkspaceModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = {
          ...TEST_AUTH_CONTEXT,
          userId: parties!.providerUserId,
        };
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProviderDashboardRoutes(app, providerDashboard);

      const dashboardResponse = await app.inject({
        method: "GET",
        url: `/providers/${parties.providerUserId}/dashboard`,
      });
      assert.equal(dashboardResponse.statusCode, 200);

      const offersResponse = await app.inject({
        method: "GET",
        url: `/providers/${parties.providerUserId}/offers`,
      });
      assert.equal(offersResponse.statusCode, 200);

      const contractsResponse = await app.inject({
        method: "GET",
        url: `/providers/${parties.providerUserId}/contracts`,
      });
      assert.equal(contractsResponse.statusCode, 200);

      const earningsResponse = await app.inject({
        method: "GET",
        url: `/providers/${parties.providerUserId}/earnings`,
      });
      assert.equal(earningsResponse.statusCode, 200);

      await app.close();
    });

    it("rejects dashboard access for another user", async (t) => {
      if (!postgresReady || !db || !parties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { providerDashboard } = createProviderWorkspaceModule(db);
      await assert.rejects(
        () => providerDashboard.getDashboard(parties!.customerUserId, parties!.providerUserId),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );
    });
  });
});
