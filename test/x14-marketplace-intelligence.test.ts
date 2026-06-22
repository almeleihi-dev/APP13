import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerMarketplaceIntelligenceRoutes } from "../src/api/routes/marketplace-intelligence.js";
import { createMarketplaceIntelligenceModule } from "../src/experience/marketplace-intelligence/module.js";
import type { PlatformAnalyticsSnapshot } from "../src/analytics/domain/platform-analytics.js";
import {
  buildDemandAnalytics,
  buildMarketplaceHealthAnalytics,
  buildMarketplaceIntelligence,
  buildMarketplaceIntelligenceSnapshot,
  buildOpportunityInsights,
  buildPricingAnalytics,
  buildSupplyAnalytics,
  computeMarketplaceHealthScore,
  deriveMarketplaceHealthStatus,
  toMarketplaceIntelligenceView,
} from "../src/experience/marketplace-intelligence/domain/marketplace-intelligence.js";
import { buildRateMetric } from "../src/analytics/domain/platform-analytics.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../src/discovery/infrastructure/discovery-repository.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const FIXED_TIME = new Date("2026-06-19T20:00:00.000Z");

const ANALYTICS_SNAPSHOT: PlatformAnalyticsSnapshot = {
  requests: {
    allTime: 10,
    last7Days: 2,
    prior7Days: 1,
    last30Days: 5,
    prior30Days: 3,
    matched: 3,
    open: 4,
  },
  offers: {
    allTime: 6,
    last7Days: 1,
    prior7Days: 0,
    last30Days: 3,
    prior30Days: 1,
    contractCreated: 2,
    cancelled: 1,
  },
  contracts: {
    allTime: 4,
    last7Days: 1,
    prior7Days: 0,
    last30Days: 2,
    prior30Days: 1,
    completed: 1,
    active: 2,
    disputed: 1,
  },
  issues: {
    allTime: 1,
    last7Days: 0,
    prior7Days: 0,
    last30Days: 1,
    prior30Days: 0,
    total: 1,
    open: 1,
  },
  escrows: {
    allTime: 3,
    last7Days: 1,
    prior7Days: 0,
    last30Days: 2,
    prior30Days: 0,
    funded: 2,
    released: 1,
    frozen: 0,
    pendingFunding: 1,
  },
  escrowAmounts: {
    fundedMinor: {
      allTime: 10000,
      last7Days: 2000,
      prior7Days: 1000,
      last30Days: 5000,
      prior30Days: 2000,
    },
    releasedMinor: {
      allTime: 8000,
      last7Days: 1500,
      prior7Days: 500,
      last30Days: 4000,
      prior30Days: 1500,
    },
    platformFeeMinor: {
      allTime: 500,
      last7Days: 100,
      prior7Days: 50,
      last30Days: 250,
      prior30Days: 100,
    },
    currencyCode: "USD",
  },
  execution: {
    totalMilestones: 8,
    completedMilestones: 3,
    inProgressMilestones: 2,
    totalEvidence: 5,
    contractsWithMilestones: 2,
    milestoneActivity: {
      allTime: 8,
      last7Days: 2,
      prior7Days: 1,
      last30Days: 4,
      prior30Days: 2,
    },
  },
  trust: {
    providersWithScores: 2,
    averageTrustScore: 72,
    lowTrustProviderCount: 0,
    tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 2 }],
    trustEvents: {
      allTime: 4,
      last7Days: 1,
      prior7Days: 0,
      last30Days: 2,
      prior30Days: 1,
    },
  },
  discovery: {
    openRequests: 4,
    matchableProviders: 2,
    publishedActions: 3,
  },
  users: {
    activeUsers: {
      allTime: 5,
      last7Days: 2,
      prior7Days: 1,
      last30Days: 4,
      prior30Days: 2,
    },
    activeProviders: {
      allTime: 2,
      last7Days: 1,
      prior7Days: 0,
      last30Days: 2,
      prior30Days: 1,
    },
    activeCustomers: 3,
    providerUtilizationPercent: 40,
  },
};

const PROVIDERS: DiscoverableProviderRecord[] = [
  {
    providerId: "provider-1",
    providerUserId: "user-1",
    displayName: "Alpha Studio",
    actionCodes: ["WEBSITE_DESIGN", "BRANDING"],
    trustScore: 82,
    availableNow: true,
    activeContracts: 1,
    distanceKm: 5,
    priceEstimate: 5000,
    completedContractsForAction: 4,
    completedContracts: 6,
    averageRating: 4.8,
  },
  {
    providerId: "provider-2",
    providerUserId: "user-2",
    displayName: "Beta Build",
    actionCodes: ["WEBSITE_DESIGN"],
    trustScore: 65,
    availableNow: false,
    activeContracts: 2,
    distanceKm: 12,
    priceEstimate: 4500,
    completedContractsForAction: 2,
    completedContracts: 3,
    averageRating: 4.2,
  },
];

const ACTION_COUNTS: DiscoverableActionRecord[] = [
  { actionCode: "WEBSITE_DESIGN", providerCount: 2 },
  { actionCode: "BRANDING", providerCount: 1 },
  { actionCode: "SEO_AUDIT", providerCount: 0 },
];

const REQUESTS: DiscoverableRequestRecord[] = [
  {
    id: "request-1",
    requestText: "Need a responsive website design",
    status: "open",
    budgetMinor: 8000,
    preferredDays: 14,
  },
  {
    id: "request-2",
    requestText: "Looking for SEO audit and optimization",
    status: "open",
    budgetMinor: 3000,
    preferredDays: 7,
  },
  {
    id: "request-3",
    requestText: "Brand identity refresh",
    status: "matched",
    budgetMinor: null,
    preferredDays: null,
  },
];

function buildUnitSnapshot() {
  return buildMarketplaceIntelligenceSnapshot({
    raw: {
      analyticsSnapshot: ANALYTICS_SNAPSHOT,
      providers: PROVIDERS,
      actionCounts: ACTION_COUNTS,
      requests: REQUESTS,
    },
    generatedAt: FIXED_TIME,
  });
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x14-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x14-customer-session",
});

async function seedX14Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x14@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x14@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X14 Marketplace Intelligence Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds demand analytics from analytics snapshot and live requests", () => {
      const demand = buildDemandAnalytics({
        analyticsSnapshot: ANALYTICS_SNAPSHOT,
        requests: REQUESTS,
      });

      assert.equal(demand.totalRequests, 10);
      assert.equal(demand.openRequests, 4);
      assert.equal(demand.matchedRequests, 1);
      assert.equal(demand.requestsWithBudget, 2);
      assert.equal(demand.averageBudgetMinor, 5500);
      assert.equal(demand.requestsCreated.last7Days, 2);
    });

    it("builds supply analytics from providers and action counts", () => {
      const supply = buildSupplyAnalytics({
        analyticsSnapshot: ANALYTICS_SNAPSHOT,
        providers: PROVIDERS,
        actionCounts: ACTION_COUNTS,
      });

      assert.equal(supply.totalProviders, 2);
      assert.equal(supply.availableNowProviders, 1);
      assert.equal(supply.matchableProviders, 2);
      assert.equal(supply.publishedActions, 3);
      assert.equal(supply.averageTrustScore, 74);
      assert.equal(supply.topActions[0]?.actionCode, "WEBSITE_DESIGN");
    });

    it("builds pricing analytics with budget coverage rate", () => {
      const pricing = buildPricingAnalytics({
        analyticsSnapshot: ANALYTICS_SNAPSHOT,
        requests: REQUESTS,
        providers: PROVIDERS,
      });

      assert.equal(pricing.currencyCode, "USD");
      assert.equal(pricing.averageRequestBudgetMinor, 5500);
      assert.equal(pricing.averageProviderPriceEstimateMinor, 4750);
      assert.equal(pricing.budgetCoverageRate.numerator, 1);
      assert.equal(pricing.platformFeeTotalMinor, 500);
      assert.equal(pricing.escrowFundedMinor, 10000);
    });

    it("computes marketplace health score and status deterministically", () => {
      const health = buildMarketplaceHealthAnalytics({
        analyticsSnapshot: ANALYTICS_SNAPSHOT,
        openRequests: 4,
        availableNowProviders: 1,
      });

      assert.ok(health.healthScore >= 0 && health.healthScore <= 100);
      assert.ok(["healthy", "balanced", "constrained"].includes(health.healthStatus));
      assert.equal(health.demandSupplyRatio, 4);
      assert.equal(health.providerUtilizationPercent, 40);

      const score = computeMarketplaceHealthScore({
        offerToContractRate: buildRateMetric(2, 6, "test"),
        searchToMatchRate: buildRateMetric(3, 10, "test"),
        openRequests: 4,
        availableNowProviders: 1,
        providerUtilizationPercent: 40,
      });
      assert.ok(score >= 0 && score <= 100);
      assert.equal(deriveMarketplaceHealthStatus(80), "healthy");
      assert.equal(deriveMarketplaceHealthStatus(60), "balanced");
      assert.equal(deriveMarketplaceHealthStatus(30), "constrained");
    });

    it("builds ranked opportunity insights without AI dependencies", () => {
      const opportunities = buildOpportunityInsights({
        requests: REQUESTS,
        providers: PROVIDERS,
        actionCounts: ACTION_COUNTS,
      });

      assert.ok(opportunities.totalInsights > 0);
      assert.ok(opportunities.insights.length <= 8);
      assert.ok(
        opportunities.insights.some((insight) =>
          ["demand_gap", "supply_capacity", "pricing_fit", "action_gap"].includes(insight.category)
        )
      );
      for (let index = 1; index < opportunities.insights.length; index += 1) {
        assert.ok(
          opportunities.insights[index - 1]!.priorityScore >=
            opportunities.insights[index]!.priorityScore
        );
      }
    });

    it("builds full marketplace intelligence snapshot and snake_case view", () => {
      const snapshot = buildUnitSnapshot();
      const intelligence = buildMarketplaceIntelligence({ snapshot });
      const view = toMarketplaceIntelligenceView(intelligence);

      assert.equal(view.overview.headline, "Marketplace intelligence");
      assert.equal(view.demand.open_requests, 4);
      assert.equal(view.supply.available_now_providers, 1);
      assert.equal(view.pricing.currency_code, "USD");
      assert.equal(view.health.health_score, snapshot.health.healthScore);
      assert.equal(view.opportunities.total_insights, snapshot.opportunities.totalInsights);
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
    });
  });

  describe("integration layer (postgres)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(
          `DELETE FROM identity.users WHERE email IN ('admin-x14@test.app13', 'customer-x14@test.app13')`
        );
        const admin = await seedX14Admin(db);
        const customer = await seedSampleCustomer(db);
        adminUserId = admin.adminUserId;
        customerUserId = customer.customerUserId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("loads marketplace intelligence for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { marketplaceIntelligence } = createMarketplaceIntelligenceModule(db);
      const view = await marketplaceIntelligence.getMarketplaceIntelligence(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "Marketplace intelligence");
      assert.ok(typeof view.demand.total_requests === "number");
      assert.ok(typeof view.supply.total_providers === "number");
      assert.ok(typeof view.pricing.average_request_budget_minor === "number");
      assert.ok(typeof view.health.health_score === "number");
      assert.ok(Array.isArray(view.opportunities.insights));
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { marketplaceIntelligence } = createMarketplaceIntelligenceModule(db);

      const demand = await marketplaceIntelligence.getDemandAnalytics(ADMIN_AUTH(adminUserId));
      assert.ok(demand.summary.length > 0);

      const supply = await marketplaceIntelligence.getSupplyAnalytics(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(supply.top_actions));

      const pricing = await marketplaceIntelligence.getPricingAnalytics(ADMIN_AUTH(adminUserId));
      assert.ok(pricing.budget_coverage_rate.rate_percent >= 0);

      const health = await marketplaceIntelligence.getMarketplaceHealth(ADMIN_AUTH(adminUserId));
      assert.ok(["healthy", "balanced", "constrained"].includes(health.health_status));

      const opportunities = await marketplaceIntelligence.getOpportunityInsights(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(typeof opportunities.total_insights === "number");
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { marketplaceIntelligence } = createMarketplaceIntelligenceModule(db);

      await assert.rejects(
        () => marketplaceIntelligence.getMarketplaceIntelligence(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers marketplace intelligence routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => ({
          analyticsSnapshot: ANALYTICS_SNAPSHOT,
          providers: PROVIDERS,
          actionCounts: ACTION_COUNTS,
          requests: REQUESTS,
        }),
      };
      const { marketplaceIntelligence } = createMarketplaceIntelligenceModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x14");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerMarketplaceIntelligenceRoutes(app, marketplaceIntelligence);

      const full = await app.inject({ method: "GET", url: "/marketplace-intelligence" });
      assert.equal(full.statusCode, 200);
      assert.equal(JSON.parse(full.body).overview.headline, "Marketplace intelligence");

      const demand = await app.inject({ method: "GET", url: "/marketplace-intelligence/demand" });
      assert.equal(demand.statusCode, 200);

      const supply = await app.inject({ method: "GET", url: "/marketplace-intelligence/supply" });
      assert.equal(supply.statusCode, 200);

      const pricing = await app.inject({
        method: "GET",
        url: "/marketplace-intelligence/pricing",
      });
      assert.equal(pricing.statusCode, 200);

      const health = await app.inject({ method: "GET", url: "/marketplace-intelligence/health" });
      assert.equal(health.statusCode, 200);

      const opportunities = await app.inject({
        method: "GET",
        url: "/marketplace-intelligence/opportunities",
      });
      assert.equal(opportunities.statusCode, 200);

      await app.close();
    });
  });
});
