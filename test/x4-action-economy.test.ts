import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionEconomyRoutes } from "../src/api/routes/action-economy.js";
import { createActionEconomyModule } from "../src/experience/action-economy/module.js";
import {
  buildActionDemandSummaries,
  buildActionEconomyExperience,
  buildActionOpportunities,
  buildActionPerformanceSummaries,
  buildActionPortfolio,
  buildEarningsPotential,
  buildGrowthOpportunities,
  buildRecommendedActions,
  type ActionEconomySnapshot,
} from "../src/experience/action-economy/domain/action-economy.js";
import { createTrustModule } from "../src/trust/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const WEBSITE_REQUEST =
  "We need to build company website with design, coding, testing, and deployment.";

const BASE_SNAPSHOT: ActionEconomySnapshot = {
  providerId: "provider-1",
  providerUserId: "provider-user-1",
  displayName: "X4 Provider",
  verificationTier: "T1",
  trustScore: 55,
  trustTierLabel: null,
  actions: [
    {
      id: "action-published-1",
      actionCode: "engineering.design",
      actionName: "Engineering — Design",
      title: "Website design",
      status: "ready_for_contract",
      tekrrCompleteness: 100,
      createdAt: new Date("2026-06-19T10:00:00.000Z"),
      updatedAt: new Date("2026-06-19T12:00:00.000Z"),
    },
    {
      id: "action-published-2",
      actionCode: "technology.code",
      actionName: "Technology — Code",
      title: "Website builds",
      status: "ready_for_contract",
      tekrrCompleteness: 100,
      createdAt: new Date("2026-06-19T10:30:00.000Z"),
      updatedAt: new Date("2026-06-19T12:30:00.000Z"),
    },
    {
      id: "action-draft-1",
      actionCode: "technology.document",
      actionName: "Technology — Document",
      title: "Documentation services",
      status: "draft",
      tekrrCompleteness: 40,
      createdAt: new Date("2026-06-19T11:00:00.000Z"),
      updatedAt: new Date("2026-06-19T11:30:00.000Z"),
    },
    {
      id: "action-ready-draft",
      actionCode: "technology.test",
      actionName: "Technology — Test",
      title: "QA services",
      status: "tekrr_in_progress",
      tekrrCompleteness: 100,
      createdAt: new Date("2026-06-19T09:00:00.000Z"),
      updatedAt: new Date("2026-06-19T13:00:00.000Z"),
    },
  ],
  performanceByActionCode: [
    {
      actionCode: "engineering.design",
      totalContracts: 2,
      activeContracts: 0,
      completedContracts: 2,
    },
    {
      actionCode: "technology.code",
      totalContracts: 4,
      activeContracts: 1,
      completedContracts: 3,
    },
  ],
  platformProviderCounts: [
    { actionCode: "engineering.design", providerCount: 1 },
    { actionCode: "technology.code", providerCount: 2 },
    { actionCode: "technology.document", providerCount: 1 },
  ],
  openRequests: [
    {
      id: "request-1",
      requestText: WEBSITE_REQUEST,
      status: "open",
      budgetMinor: 9000,
      preferredDays: 21,
    },
    {
      id: "request-2",
      requestText: "Need logo design and brand identity package.",
      status: "open",
      budgetMinor: 4500,
      preferredDays: 14,
    },
    {
      id: "request-3",
      requestText: "Need QA testing and quality assurance for our app release.",
      status: "open",
      budgetMinor: 5000,
      preferredDays: 10,
    },
  ],
  earnings: {
    currencyCode: "SAR",
    releasedEarningsMinor: 12000,
    pendingHeldMinor: 3000,
    walletBalanceMinor: 1500,
    contractsWithEarnings: 2,
  },
  platformPublishedActions: 12,
};

function authContext(userId: string, roles: string[] = ["provider"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x4-action-economy-test-session",
  };
}

interface X4Parties {
  customerUserId: string;
  providerUserId: string;
  customerId: string;
  providerId: string;
}

async function seedX4Parties(db: DbPool): Promise<X4Parties> {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x4@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x4@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X4 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X4 Provider', 'active')
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

async function seedX4ProviderData(db: DbPool, parties: X4Parties) {
  const publishedAction = await db.query<{ id: string }>(
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      "technology.code",
      "Technology — Code",
      "E",
      "ready_for_contract",
      parties.customerId,
      parties.providerId,
      "X4 published offering",
      100,
    ]
  );

  await db.query(
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      "technology.design",
      "Technology — Design",
      "E",
      "draft",
      parties.customerId,
      parties.providerId,
      "X4 draft offering",
      45,
    ]
  );

  await db.query(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        budget_minor,
        preferred_days,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'open')
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );

  return {
    publishedActionId: publishedAction.rows[0].id,
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;

describe("X4 Action Economy Experience", () => {
  describe("domain layer (unit)", () => {
    it("separates published and draft actions in portfolio", () => {
      const portfolio = buildActionPortfolio(BASE_SNAPSHOT);
      assert.equal(portfolio.publishedCount, 2);
      assert.equal(portfolio.draftCount, 2);
      assert.equal(portfolio.published[0]?.actionCode, "engineering.design");
      assert.equal(portfolio.drafts[0]?.actionCode, "technology.document");
      assert.equal(portfolio.published[0]?.trustRequirementLabel, "Provider tier T1+");
      assert.equal(portfolio.published[0]?.completedContracts, 2);
    });

    it("builds demand summaries with deterministic demand levels", () => {
      const demand = buildActionDemandSummaries(BASE_SNAPSHOT);
      const designDemand = demand.find((entry) => entry.actionCode === "engineering.design");
      assert.ok(designDemand);
      assert.equal(designDemand!.openRequestCount, 2);
      assert.equal(designDemand!.demandLevel, "medium");
    });

    it("marks opportunities eligible when published action matches request intent", () => {
      const opportunities = buildActionOpportunities(BASE_SNAPSHOT);
      const eligible = opportunities.filter((entry) => entry.eligible);
      assert.ok(eligible.length >= 1);
      assert.equal(eligible[0]?.primaryActionCode, "engineering.design");
    });

    it("ranks top performing published actions", () => {
      const performance = buildActionPerformanceSummaries(BASE_SNAPSHOT);
      assert.equal(performance[0]?.actionCode, "technology.code");
      assert.equal(performance[0]?.rank, 1);
      assert.equal(performance[0]?.completionRatePercent, 75);
    });

    it("estimates earnings pipeline from eligible open requests", () => {
      const earnings = buildEarningsPotential(BASE_SNAPSHOT);
      assert.equal(earnings.contractsWithEarnings, 2);
      assert.match(earnings.estimatedPipelineLabel, /135/);
    });

    it("recommends publish-ready drafts and trust improvements", () => {
      const recommendations = buildRecommendedActions(BASE_SNAPSHOT);
      assert.ok(recommendations.some((entry) => entry.actionCode === "publish_ready_draft"));
      assert.ok(recommendations.some((entry) => entry.actionCode === "improve_trust"));
    });

    it("surfaces growth opportunities for high-demand unpublished actions", () => {
      const growth = buildGrowthOpportunities(BASE_SNAPSHOT);
      assert.ok(growth.some((entry) => entry.actionCode === "technology.test"));
    });

    it("composes full action economy experience deterministically", () => {
      const experience = buildActionEconomyExperience({
        snapshot: BASE_SNAPSHOT,
        generatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });

      assert.equal(experience.providerId, "provider-1");
      assert.equal(experience.portfolio.publishedCount, 2);
      assert.equal(experience.portfolio.draftCount, 2);
      assert.ok(experience.opportunities.length > 0);
      assert.ok(experience.demand.length > 0);
      assert.equal(experience.generatedAt.toISOString(), "2026-06-19T20:00:00.000Z");
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
        await db.query(`DELETE FROM experience.customer_requests WHERE request_text = $1`, [
          WEBSITE_REQUEST,
        ]);
        await db.query(`DELETE FROM action.actions WHERE title LIKE 'X4 %'`);
        await db.query(
          `
            DELETE FROM identity.customers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x4@test.app13', 'provider-x4@test.app13', 'outsider-x4@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.providers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x4@test.app13', 'provider-x4@test.app13', 'outsider-x4@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-x4@test.app13', 'provider-x4@test.app13', 'outsider-x4@test.app13')
          `
        );

        const parties = await seedX4Parties(db);
        providerUserId = parties.providerUserId;
        await seedX4ProviderData(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes action economy from provider portfolio projections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { actionEconomy } = createActionEconomyModule(db, { trustScore });
      const view = await actionEconomy.getActionEconomy(authContext(providerUserId));

      assert.equal(view.provider_user_id, providerUserId);
      assert.equal(view.portfolio.published_count, 1);
      assert.equal(view.portfolio.draft_count, 1);
      assert.ok(view.opportunities.length >= 1);
      assert.ok(view.demand.length >= 1);
      assert.ok(view.earnings.currency_code.length > 0);
    });

    it("returns actions, opportunities, and earnings endpoints", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { actionEconomy } = createActionEconomyModule(db, { trustScore });

      const actions = await actionEconomy.getActions(authContext(providerUserId));
      assert.equal(actions.published_count, 1);
      assert.equal(actions.draft_count, 1);

      const opportunities = await actionEconomy.getOpportunities(authContext(providerUserId));
      assert.ok(Array.isArray(opportunities.opportunities));
      assert.ok(Array.isArray(opportunities.demand));
      assert.ok(Array.isArray(opportunities.recommended_actions));

      const earnings = await actionEconomy.getEarnings(authContext(providerUserId));
      assert.ok(earnings.earnings.summary.length > 0);
      assert.ok(Array.isArray(earnings.performance));
    });

    it("rejects non-provider access and serves action economy routes", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const customerUser = await db.query<{ id: string }>(
        `
          INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
          VALUES ('outsider-x4@test.app13', 'hash', 'customer', now(), 'T1')
          RETURNING id
        `
      );
      await db.query(
        `
          INSERT INTO identity.customers (user_id, display_name)
          VALUES ($1, 'X4 Outsider')
        `,
        [customerUser.rows[0].id]
      );

      const { trustScore } = createTrustModule(db);
      const { actionEconomy } = createActionEconomyModule(db, { trustScore });

      await assert.rejects(
        () => actionEconomy.getActionEconomy(authContext(customerUser.rows[0].id, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionEconomyRoutes(app, actionEconomy);

      for (const path of [
        "/action-economy",
        "/action-economy/actions",
        "/action-economy/opportunities",
        "/action-economy/earnings",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
