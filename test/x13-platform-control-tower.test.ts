import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerPlatformControlTowerRoutes } from "../src/api/routes/platform-control-tower.js";
import { createPlatformControlTowerModule } from "../src/experience/platform-control-tower/module.js";
import type { PlatformAnalyticsSnapshot } from "../src/analytics/domain/platform-analytics.js";
import {
  buildContractOverview,
  buildEscrowOverview,
  buildExecutionOverview,
  buildIssueOverview,
  buildOfferOverview,
  buildPlatformOverview,
  buildRequestOverview,
  buildRiskOverview,
  buildTrustOverview,
} from "../src/operations/domain/admin-console.js";
import {
  buildFinancialMetrics,
  buildLiveFrameDistribution,
  buildMarketplaceMetrics,
  buildPlatformControlTower,
  buildPlatformControlTowerSnapshot,
  buildPlatformOverviewMetrics,
  buildSystemHealthMetrics,
  buildTrustMetrics,
  toPlatformControlTowerView,
} from "../src/experience/platform-control-tower/domain/platform-control-tower.js";
import { buildAnalyticsSummary } from "../src/analytics/domain/platform-analytics.js";
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

function buildUnitPlatformOverview() {
  const base = { totalCount: 4, statusDistribution: [{ status: "open", count: 2 }], recentCount: 1, priorCount: 0 };
  return buildPlatformOverview({
    requests: buildRequestOverview(base),
    offers: buildOfferOverview({ ...base, statusDistribution: [{ status: "offer_created", count: 2 }] }),
    contracts: buildContractOverview({
      totalCount: 4,
      statusDistribution: [{ status: "active", count: 2 }],
      recentCount: 1,
      priorCount: 0,
    }),
    escrow: buildEscrowOverview({
      totalCount: 3,
      statusDistribution: [{ status: "held", count: 2 }],
      recentCount: 1,
      priorCount: 0,
    }),
    execution: buildExecutionOverview({
      totalMilestones: 8,
      milestoneStatusDistribution: [{ status: "completed", count: 3 }],
      totalEvidence: 5,
      contractsWithMilestones: 2,
      inProgressMilestones: 2,
      recentCount: 1,
      priorCount: 0,
    }),
    issues: buildIssueOverview({
      totalCount: 1,
      statusDistribution: [{ status: "raised", count: 1 }],
      recentCount: 0,
      priorCount: 0,
    }),
    trust: buildTrustOverview({
      providersWithScores: 2,
      averageTrustScore: 72,
      lowTrustProviderCount: 0,
      frameTierDistribution: [{ status: "SAPPHIRE_VERIFIED", count: 2 }],
      recentCount: 1,
      priorCount: 0,
    }),
    risks: buildRiskOverview({
      frozenEscrows: 0,
      openIssues: 1,
      escalatedIssues: 0,
      disputedContracts: 1,
      failedOperations: 0,
      staleOffers: 0,
      lowTrustProviders: 0,
      pendingFundingEscrows: 1,
    }),
    failedOperations: 0,
    generatedAt: FIXED_TIME,
  });
}

function buildUnitSnapshot() {
  return buildPlatformControlTowerSnapshot({
    raw: {
      analyticsSnapshot: ANALYTICS_SNAPSHOT,
      platformOverview: buildUnitPlatformOverview(),
      platformTrustContext: {
        providersWithScores: 2,
        averageTrustScore: 72,
        lowTrustProviderCount: 0,
        tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 2 }],
        trustEventsLast7Days: 1,
        trustEventsLast30Days: 2,
      },
    },
    generatedAt: FIXED_TIME,
  });
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x13-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x13-customer-session",
});

async function seedX13Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x13@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x13@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X13 Platform Control Tower Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds platform overview metrics from analytics and operations", () => {
      const analytics = buildAnalyticsSummary(ANALYTICS_SNAPSHOT, FIXED_TIME);
      const overview = buildPlatformOverviewMetrics({
        analytics,
        operations: buildUnitPlatformOverview(),
      });
      assert.equal(overview.headline, "Platform control tower");
      assert.equal(overview.totalRequests, 10);
      assert.equal(overview.averageTrustScore, 72);
      assert.ok(["healthy", "attention", "degraded"].includes(overview.healthStatus));
    });

    it("builds financial metrics from escrow and revenue sections", () => {
      const analytics = buildAnalyticsSummary(ANALYTICS_SNAPSHOT, FIXED_TIME);
      const financial = buildFinancialMetrics(analytics);
      assert.equal(financial.escrow.totalEscrows, 3);
      assert.equal(financial.revenue.currencyCode, "USD");
      assert.match(financial.summary, /escrow/i);
    });

    it("builds trust metrics from analytics snapshot", () => {
      const trust = buildTrustMetrics(ANALYTICS_SNAPSHOT);
      assert.equal(trust.providersWithScores, 2);
      assert.equal(trust.averageTrustScore, 72);
      assert.equal(trust.trustTierDistribution.length, 1);
    });

    it("builds live frame distribution with tier share percentages", () => {
      const analytics = buildAnalyticsSummary(ANALYTICS_SNAPSHOT, FIXED_TIME);
      const distribution = buildLiveFrameDistribution({
        platformTrustContext: {
          providersWithScores: 2,
          averageTrustScore: 72,
          lowTrustProviderCount: 0,
          tierDistribution: [
            { tier: "SAPPHIRE_VERIFIED", count: 2 },
            { tier: "EMERALD_TRUSTED", count: 1 },
          ],
          trustEventsLast7Days: 1,
          trustEventsLast30Days: 2,
        },
        trustMetrics: analytics.trust,
      });
      assert.equal(distribution.tierDistribution.length, 2);
      assert.equal(
        distribution.tierDistribution.reduce((total, entry) => total + entry.sharePercent, 0),
        100
      );
    });

    it("builds marketplace metrics from discovery and growth KPIs", () => {
      const analytics = buildAnalyticsSummary(ANALYTICS_SNAPSHOT, FIXED_TIME);
      const marketplace = buildMarketplaceMetrics(analytics);
      assert.equal(marketplace.discovery.openRequests, 4);
      assert.equal(marketplace.requestsCreated.allTime, 10);
      assert.equal(marketplace.offerToContractRatePercent, analytics.conversion.offerToContractRate.ratePercent);
    });

    it("builds system health metrics from operations overview", () => {
      const systemHealth = buildSystemHealthMetrics(buildUnitPlatformOverview());
      assert.ok(["healthy", "attention", "degraded"].includes(systemHealth.healthStatus));
      assert.equal(systemHealth.openIssues, 1);
      assert.ok(systemHealth.nextRecommendedAction.length > 0);
    });

    it("composes platform control tower snapshot with all sections", () => {
      const snapshot = buildUnitSnapshot();
      assert.equal(snapshot.contracts.totalContracts, 4);
      assert.equal(snapshot.financial.escrow.fundedEscrows, 2);
      assert.equal(snapshot.trust.averageTrustScore, 72);
      assert.equal(snapshot.liveFrameDistribution.providersWithScores, 2);
      assert.equal(snapshot.marketplace.discovery.matchableProviders, 2);
      assert.equal(snapshot.systemHealth.openIssues, 1);
    });

    it("composes full platform control tower deterministically", () => {
      const tower = buildPlatformControlTower({ snapshot: buildUnitSnapshot() });
      assert.equal(tower.overview.totalContracts, 4);
      assert.equal(tower.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("serializes platform control tower view with snake_case fields", () => {
      const view = toPlatformControlTowerView(
        buildPlatformControlTower({ snapshot: buildUnitSnapshot() })
      );
      assert.equal(view.overview.total_requests, 10);
      assert.ok(view.contracts.total_contracts >= 0);
      assert.ok(view.live_frame_distribution.tier_distribution.length >= 1);
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM identity.users WHERE email IN ('admin-x13@test.app13', 'customer-x13@test.app13')`);
        const admin = await seedX13Admin(db);
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

    it("composes platform control tower from S11, S14, and X2 integrations", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformControlTower } = createPlatformControlTowerModule(db);
      const view = await platformControlTower.getPlatformControlTower(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "Platform control tower");
      assert.ok(view.contracts.total_contracts >= 0);
      assert.ok(view.trust.average_trust_score >= 0);
      assert.ok(Array.isArray(view.live_frame_distribution.tier_distribution));
    });

    it("returns overview, contracts, financial, trust, marketplace, and system health sections", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformControlTower } = createPlatformControlTowerModule(db);

      const overview = await platformControlTower.getOverviewMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(overview.total_requests >= 0);

      const contracts = await platformControlTower.getContractsMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(contracts.total_contracts >= 0);

      const financial = await platformControlTower.getFinancialMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(financial.escrow.total_escrows >= 0);

      const trust = await platformControlTower.getTrustMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(trust.providers_with_scores >= 0);

      const marketplace = await platformControlTower.getMarketplaceMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(marketplace.discovery.open_requests >= 0);

      const systemHealth = await platformControlTower.getSystemHealthMetrics(ADMIN_AUTH(adminUserId));
      assert.ok(["healthy", "attention", "degraded"].includes(systemHealth.health_status));
    });

    it("rejects non-admin access and serves platform control tower routes", async (t) => {
      if (!postgresReady || !db || !adminUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformControlTower } = createPlatformControlTowerModule(db);

      await assert.rejects(
        () => platformControlTower.getPlatformControlTower(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH(adminUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerPlatformControlTowerRoutes(app, platformControlTower);

      for (const path of [
        "/platform-control-tower",
        "/platform-control-tower/overview",
        "/platform-control-tower/contracts",
        "/platform-control-tower/financial",
        "/platform-control-tower/trust",
        "/platform-control-tower/live-frame",
        "/platform-control-tower/marketplace",
        "/platform-control-tower/system-health",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
