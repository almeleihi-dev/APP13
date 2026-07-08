import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerCustomerDashboardRoutes } from "../src/api/routes/customer-dashboard.js";
import {
  buildCustomerDashboardSummary,
  buildCustomerEscrowStatus,
  buildCustomerExecutionStatus,
  buildCustomerIssueSummary,
  deriveNextRecommendedAction,
  mapCustomerContractStatusLabel,
  mapCustomerOfferStatusLabel,
  mapCustomerRequestStatusLabel,
} from "../src/customer-experience/domain/customer-dashboard.js";
import { createCustomerExperienceModule } from "../src/customer-experience/module.js";
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

async function seedS9Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s9@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s9@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S9 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'S9 Provider', 'active')
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
  parties: Awaited<ReturnType<typeof seedS9Parties>>
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
      "S9 provider offering",
    ]
  );

  return action.rows[0].id;
}

async function seedCustomerRequest(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS9Parties>>
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
let parties: Awaited<ReturnType<typeof seedS9Parties>> | undefined;
let providerActionId: string | undefined;
let customerRequestId: string | undefined;

describe("S9 Customer Order Dashboard", () => {
  describe("projection layer (unit)", () => {
    it("maps customer-facing status labels", () => {
      assert.equal(mapCustomerRequestStatusLabel("open"), "Open");
      assert.equal(mapCustomerOfferStatusLabel("draft_previewed"), "Draft ready");
      assert.equal(mapCustomerContractStatusLabel("issue_raised"), "Issue reported");
    });

    it("derives next recommended action from dashboard cards", () => {
      const nextAction = deriveNextRecommendedAction({
        requests: [
          {
            requestId: "req-1",
            requestText: "Need a website",
            status: "matched",
            statusLabel: "Providers matched",
            budget: 9000,
            preferredDays: 21,
            offerCount: 0,
            contractCount: 0,
            summary: "Matched request",
            nextAction: "Select a provider match",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        offers: [
          {
            offerId: "offer-1",
            customerRequestId: "req-1",
            providerDisplayName: "S9 Provider",
            selectedActionCode: "technology.code",
            selectedActionName: "Technology — Code",
            status: "draft_previewed",
            statusLabel: "Draft ready",
            contractId: null,
            summary: "Draft ready",
            nextAction: "Accept or cancel offer",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        contracts: [],
        openIssues: 0,
        pendingFunding: 0,
      });

      assert.equal(nextAction, "Review and accept contract offer");
    });

    it("builds dashboard summary counts", () => {
      const summary = buildCustomerDashboardSummary({
        requests: [
          {
            requestId: "req-1",
            requestText: "Need a website",
            status: "open",
            statusLabel: "Open",
            budget: 9000,
            preferredDays: 21,
            offerCount: 1,
            contractCount: 0,
            summary: "Open request",
            nextAction: "Review conversion offers",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
        offers: [
          {
            offerId: "offer-1",
            customerRequestId: "req-1",
            providerDisplayName: "S9 Provider",
            selectedActionCode: "technology.code",
            selectedActionName: "Technology — Code",
            status: "draft_previewed",
            statusLabel: "Draft ready",
            contractId: null,
            summary: "Draft ready",
            nextAction: "Accept or cancel offer",
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
            providerDisplayName: "S9 Provider",
            status: "active",
            statusLabel: "In progress",
            customerRequestId: "req-1",
            offerId: "offer-1",
            escrow: buildCustomerEscrowStatus({
              contractId: "contract-1",
              escrowId: "escrow-1",
              status: "held",
              fundedAmountLabel: "90.00 USD",
            }),
            execution: buildCustomerExecutionStatus({
              contractId: "contract-1",
              totalMilestones: 2,
              completedMilestones: 1,
              inProgressMilestones: 1,
              pendingMilestones: 0,
            }),
            evidence: {
              contractId: "contract-1",
              evidenceCount: 1,
              statusLabel: "Submitted",
              summary: "1 evidence item submitted.",
            },
            issue: buildCustomerIssueSummary({
              contractId: "contract-1",
              openIssueCount: 0,
              latestIssueStatus: null,
            }),
            summary: "Active contract",
            nextAction: "Track delivery progress",
            createdAt: new Date("2026-06-19T20:00:00.000Z"),
            updatedAt: new Date("2026-06-19T20:00:00.000Z"),
          },
        ],
      });

      assert.equal(summary.totalRequests, 1);
      assert.equal(summary.activeOffers, 1);
      assert.equal(summary.activeContracts, 1);
      assert.match(summary.summary, /active contract/i);
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
        await db.query(`DELETE FROM action.actions WHERE title = 'S9 provider offering'`);
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s9@test.app13', 'provider-s9@test.app13')
          `
        );
        parties = await seedS9Parties(db);
        providerActionId = await seedProviderAction(db, parties);
        customerRequestId = await seedCustomerRequest(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("aggregates requests, offers, and contracts for the customer dashboard", async (t) => {
      if (!postgresReady || !db || !parties || !providerActionId || !customerRequestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { matchContractConversion } = createConversionModule(db);
      const offer = await matchContractConversion.createContractOffer(parties.customerUserId, {
        customer_request_id: customerRequestId,
        provider_user_id: parties.providerUserId,
        selected_action_id: providerActionId,
        idempotency_key: `s9-dashboard:${Date.now()}`,
      });
      await matchContractConversion.getContractDraftPreview(parties.customerUserId, offer.id);
      await matchContractConversion.acceptContractOffer(parties.customerUserId, offer.id);

      const { customerDashboard } = createCustomerExperienceModule(db);
      const dashboard = await customerDashboard.getDashboard(
        parties.customerUserId,
        parties.customerUserId
      );

      assert.equal(dashboard.customer_user_id, parties.customerUserId);
      assert.equal(dashboard.requests.length, 1);
      assert.equal(dashboard.offers.length, 1);
      assert.equal(dashboard.contracts.length, 1);
      assert.equal(dashboard.requests[0]?.offer_count, 1);
      assert.equal(dashboard.offers[0]?.status, "contract_created");
      assert.equal(dashboard.contracts[0]?.customer_request_id, customerRequestId);
      assert.ok(dashboard.summary.next_recommended_action);
    });

    it("exposes customer dashboard routes", async (t) => {
      if (!postgresReady || !db || !parties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { customerDashboard } = createCustomerExperienceModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = {
          ...TEST_AUTH_CONTEXT,
          userId: parties!.customerUserId,
        };
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerCustomerDashboardRoutes(app, customerDashboard);

      const dashboardResponse = await app.inject({
        method: "GET",
        url: `/customers/${parties.customerUserId}/dashboard`,
      });
      assert.equal(dashboardResponse.statusCode, 200);

      const requestsResponse = await app.inject({
        method: "GET",
        url: `/customers/${parties.customerUserId}/requests`,
      });
      assert.equal(requestsResponse.statusCode, 200);
      assert.ok(Array.isArray(requestsResponse.json().requests));

      const offersResponse = await app.inject({
        method: "GET",
        url: `/customers/${parties.customerUserId}/offers`,
      });
      assert.equal(offersResponse.statusCode, 200);

      const contractsResponse = await app.inject({
        method: "GET",
        url: `/customers/${parties.customerUserId}/contracts`,
      });
      assert.equal(contractsResponse.statusCode, 200);

      await app.close();
    });

    it("rejects dashboard access for another user", async (t) => {
      if (!postgresReady || !db || !parties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { customerDashboard } = createCustomerExperienceModule(db);
      await assert.rejects(
        () => customerDashboard.getDashboard(parties!.providerUserId, parties!.customerUserId),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );
    });
  });
});
