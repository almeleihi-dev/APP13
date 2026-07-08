import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerPlatformOperationsRoutes } from "../src/api/routes/platform-operations.js";
import { createPlatformOperationsModule } from "../src/experience/platform-operations/module.js";
import type { PlatformAnalyticsSnapshot } from "../src/analytics/domain/platform-analytics.js";
import {
  PLATFORM_OPERATIONS_ROUTES,
  buildComplaintOperationsView,
  buildContractOperationsView,
  buildOperationalRiskRegister,
  buildPlatformOperationsCenter,
  buildPlatformOperationsSnapshot,
  computeOperationsScore,
  toPlatformOperationsCenterView,
  type PlatformOperationsRawSnapshot,
} from "../src/experience/platform-operations/domain/platform-operations.js";
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

const FIXED_TIME = new Date("2026-06-19T23:30:00.000Z");

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
  const base = {
    totalCount: 4,
    statusDistribution: [{ status: "open", count: 2 }],
    recentCount: 1,
    priorCount: 0,
  };

  return buildPlatformOverview({
    requests: buildRequestOverview(base),
    offers: buildOfferOverview({
      ...base,
      statusDistribution: [{ status: "offer_created", count: 2 }],
    }),
    contracts: buildContractOverview({
      totalCount: 4,
      statusDistribution: [
        { status: "active", count: 2 },
        { status: "completed", count: 1 },
        { status: "disputed", count: 1 },
      ],
      recentCount: 1,
      priorCount: 0,
    }),
    escrow: buildEscrowOverview({
      totalCount: 3,
      statusDistribution: [
        { status: "held", count: 2 },
        { status: "released", count: 1 },
      ],
      recentCount: 1,
      priorCount: 0,
    }),
    execution: buildExecutionOverview({
      totalMilestones: 8,
      milestoneStatusDistribution: [
        { status: "completed", count: 3 },
        { status: "in_progress", count: 2 },
      ],
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

function buildUnitRawSnapshot(): PlatformOperationsRawSnapshot {
  return {
    analyticsSnapshot: ANALYTICS_SNAPSHOT,
    platformOverview: buildUnitPlatformOverview(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x27-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x27-customer-session",
});

async function seedX27Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x27@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x27@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X27 platform operations center", () => {
  describe("domain (unit)", () => {
    it("builds contract and complaint operational views", () => {
      const raw = buildUnitRawSnapshot();
      const analytics = buildAnalyticsSummary(raw.analyticsSnapshot, FIXED_TIME);
      const contracts = buildContractOperationsView({
        platformOverview: raw.platformOverview,
        analytics,
      });
      const complaints = buildComplaintOperationsView({
        platformOverview: raw.platformOverview,
      });

      assert.equal(contracts.totalContracts, 4);
      assert.equal(contracts.activeContracts, 3);
      assert.equal(complaints.openComplaints, 1);
      assert.ok(complaints.complaintHealthScore >= 0);
    });

    it("computes weighted operations score deterministically", () => {
      const snapshot = buildPlatformOperationsSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildPlatformOperationsCenter({ snapshot });
      const view = toPlatformOperationsCenterView(center);

      assert.equal(view.overview.headline, "APP13 platform operations center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(view.operations_score.score >= 0);

      const score = computeOperationsScore({
        contracts: snapshot.contracts,
        escrow: snapshot.escrow,
        trust: snapshot.trust,
        complaints: snapshot.complaints,
        execution: snapshot.execution,
        financial: snapshot.financial,
        systemHealth: snapshot.systemHealth,
      });
      assert.equal(score.score, snapshot.operationsScore.score);
    });

    it("builds operational risk register across categories", () => {
      const snapshot = buildPlatformOperationsSnapshot({ raw: buildUnitRawSnapshot() });
      const riskRegister = buildOperationalRiskRegister({
        contracts: snapshot.contracts,
        escrow: snapshot.escrow,
        trust: snapshot.trust,
        complaints: snapshot.complaints,
        execution: snapshot.execution,
        financial: snapshot.financial,
        systemHealth: snapshot.systemHealth,
        platformOverview: buildUnitPlatformOverview(),
      });

      assert.ok(riskRegister.risks.some((risk) => risk.category === "contract"));
      assert.ok(riskRegister.summary.length > 0);
    });

    it("composes center view with recommendation horizons", () => {
      const view = toPlatformOperationsCenterView(
        buildPlatformOperationsCenter({
          snapshot: buildPlatformOperationsSnapshot({
            raw: buildUnitRawSnapshot(),
            generatedAt: FIXED_TIME,
          }),
        })
      );

      assert.ok(view.recommendations.this_month.length >= 1);
      assert.equal(view.system_health.module_count, 9);
    });
  });

  describe("integration (postgres)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(
          `DELETE FROM identity.users WHERE email IN ('admin-x27@test.app13', 'customer-x27@test.app13')`
        );
        const admin = await seedX27Admin(db);
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

    it("loads platform operations center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformOperations } = createPlatformOperationsModule(db);
      const view = await platformOperations.getPlatformOperationsCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "APP13 platform operations center");
      assert.ok(view.operations_score.score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformOperations } = createPlatformOperationsModule(db);

      const overview = await platformOperations.getOperationsOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const contracts = await platformOperations.getContractOperations(ADMIN_AUTH(adminUserId));
      assert.ok(contracts.total_contracts >= 0);

      const escrow = await platformOperations.getEscrowOperations(ADMIN_AUTH(adminUserId));
      assert.ok(escrow.summary.length > 0);

      const trust = await platformOperations.getTrustOperations(ADMIN_AUTH(adminUserId));
      assert.ok(trust.trust_events >= 0);

      const complaints = await platformOperations.getComplaintOperations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(complaints.complaint_health_score >= 0);

      const execution = await platformOperations.getExecutionOperations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(execution.execution_health_score >= 0);

      const financial = await platformOperations.getFinancialOperations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(financial.financial_activity_score >= 0);

      const systemHealth = await platformOperations.getSystemHealthView(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(systemHealth.operational_health_score >= 0);

      const risks = await platformOperations.getOperationalRiskRegister(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(risks.risks));

      const recommendations = await platformOperations.getOperationalRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { platformOperations } = createPlatformOperationsModule(db);

      await assert.rejects(
        () =>
          platformOperations.getPlatformOperationsCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers platform operations routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { platformOperations } = createPlatformOperationsModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x27");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerPlatformOperationsRoutes(app, platformOperations);

      for (const routePath of PLATFORM_OPERATIONS_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
