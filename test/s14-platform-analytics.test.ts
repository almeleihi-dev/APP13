import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAnalyticsRoutes } from "../src/api/routes/analytics.js";
import {
  buildAnalyticsSummary,
  buildRateMetric,
  buildRollingCounts,
  buildTrendIndicator,
  deriveTrendDirection,
} from "../src/analytics/domain/platform-analytics.js";
import { createAnalyticsModule } from "../src/analytics/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

async function seedS14Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-s14@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleRequest(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s14@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S14 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );

  await db.query(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        status
      )
      VALUES ($1, $2, $3, 'open')
    `,
    [customerUser.rows[0].id, customer.rows[0].id, "Need analytics coverage for platform KPIs."]
  );
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "s14-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "s14-customer-session",
});

const EMPTY_SNAPSHOT = {
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

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;

describe("S14 Platform Metrics & Analytics", () => {
  describe("domain layer (unit)", () => {
    it("derives trend directions deterministically", () => {
      assert.equal(deriveTrendDirection(5, 3), "up");
      assert.equal(deriveTrendDirection(2, 4), "down");
      assert.equal(deriveTrendDirection(3, 3), "flat");
    });

    it("builds rolling counts with 7-day and 30-day trends", () => {
      const rolling = buildRollingCounts(
        {
          allTime: 10,
          last7Days: 4,
          prior7Days: 2,
          last30Days: 8,
          prior30Days: 6,
        },
        "new request"
      );

      assert.equal(rolling.trend7Day.direction, "up");
      assert.equal(rolling.trend30Day.direction, "up");
      assert.match(rolling.trend7Day.summary, /up from 2/);
    });

    it("builds rate metrics with safe denominators", () => {
      const rate = buildRateMetric(2, 5, "2 of 5 converted");
      assert.equal(rate.ratePercent, 40);
      assert.equal(rate.numerator, 2);
      assert.equal(rate.denominator, 5);

      const zero = buildRateMetric(0, 0, "no data");
      assert.equal(zero.ratePercent, 0);
    });

    it("builds analytics summary from snapshot", () => {
      const summary = buildAnalyticsSummary(EMPTY_SNAPSHOT);
      assert.equal(summary.platform.totalRequests, 10);
      assert.equal(summary.conversion.offerToContractRate.numerator, 2);
      assert.equal(summary.contracts.completionRate.numerator, 1);
      assert.equal(summary.trust.averageTrustScore, 72);
      assert.equal(summary.revenue.platformFeeTotalMinor.allTime, 500);
      assert.match(summary.headline, /average trust/);
    });

    it("builds trend indicator summaries", () => {
      const trend = buildTrendIndicator({
        recent: 4,
        prior: 2,
        periodDays: 7,
        entityLabel: "new offer",
      });
      assert.equal(trend.direction, "up");
      assert.match(trend.summary, /new offers/);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.event_inbox`);
        await db.query(`DELETE FROM experience.match_contract_offers`);
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('admin-s14@test.app13', 'customer-s14@test.app13')
          `
        );
        const admin = await seedS14Admin(db);
        adminUserId = admin.adminUserId;
        await seedSampleRequest(db);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("returns analytics overview for admin users", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformAnalytics } = createAnalyticsModule(db);
      const overview = await platformAnalytics.getOverview(ADMIN_AUTH(adminUserId));

      assert.ok(overview.headline);
      assert.ok(overview.platform.total_requests >= 1);
      assert.ok(overview.growth.requests_created.last_7_days >= 0);
      assert.ok(Array.isArray(overview.trust.trust_tier_distribution));
      assert.ok(overview.generated_at);
    });

    it("returns section analytics endpoints", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { platformAnalytics } = createAnalyticsModule(db);
      const auth = ADMIN_AUTH(adminUserId);

      const growth = await platformAnalytics.getGrowth(auth);
      assert.ok(growth.summary);
      assert.equal(typeof growth.requests_created.trend_7_day.direction, "string");

      const conversions = await platformAnalytics.getConversions(auth);
      assert.ok(conversions.offer_to_contract_rate.rate_percent >= 0);

      const contracts = await platformAnalytics.getContracts(auth);
      assert.ok(contracts.completion_rate.summary);

      const escrow = await platformAnalytics.getEscrow(auth);
      assert.ok(escrow.summary);

      const trust = await platformAnalytics.getTrust(auth);
      assert.ok(trust.average_trust_score >= 0);

      const discovery = await platformAnalytics.getDiscovery(auth);
      assert.ok(discovery.open_requests >= 1);

      const revenue = await platformAnalytics.getRevenue(auth);
      assert.ok(revenue.currency_code);
    });

    it("exposes analytics routes", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { platformAnalytics } = createAnalyticsModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH(adminUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAnalyticsRoutes(app, platformAnalytics);

      const overviewResponse = await app.inject({ method: "GET", url: "/analytics/overview" });
      assert.equal(overviewResponse.statusCode, 200);

      const growthResponse = await app.inject({ method: "GET", url: "/analytics/growth" });
      assert.equal(growthResponse.statusCode, 200);

      const revenueResponse = await app.inject({ method: "GET", url: "/analytics/revenue" });
      assert.equal(revenueResponse.statusCode, 200);

      await app.close();
    });

    it("rejects non-admin access", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { platformAnalytics } = createAnalyticsModule(db);
      await assert.rejects(
        () => platformAnalytics.getOverview(CUSTOMER_AUTH(adminUserId!)),
        (error: unknown) => error instanceof AppError
      );
    });
  });
});
