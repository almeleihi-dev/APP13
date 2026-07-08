import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLaunchSimulationRoutes } from "../src/api/routes/launch-simulation.js";
import { createLaunchSimulationModule } from "../src/experience/launch-simulation/module.js";
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
  buildLaunchSimulation,
  buildLaunchSimulationSnapshot,
  buildSimulationBaseline,
  buildSimulationCostProjection,
  computeExecutiveSimulationScore,
  detectBottlenecks,
  projectScenarioSimulation,
  SIMULATION_LEVELS,
  SIMULATION_SCENARIOS,
  toLaunchSimulationView,
} from "../src/experience/launch-simulation/domain/launch-simulation.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../src/discovery/infrastructure/discovery-repository.js";
import type { ReadinessSources } from "../src/experience/release-readiness/domain/release-readiness.js";
import type { LaunchSimulationRawSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
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
    actionCodes: ["WEBSITE_DESIGN"],
    trustScore: 82,
    availableNow: true,
    activeContracts: 1,
    distanceKm: 5,
    priceEstimate: 5000,
    completedContractsForAction: 4,
    completedContracts: 6,
    averageRating: 4.8,
  },
];

const ACTION_COUNTS: DiscoverableActionRecord[] = [
  { actionCode: "WEBSITE_DESIGN", providerCount: 1 },
];

const REQUESTS: DiscoverableRequestRecord[] = [
  {
    id: "request-1",
    requestText: "Need a responsive website design",
    status: "open",
    budgetMinor: 8000,
    preferredDays: 14,
  },
];

function buildHealthySources(): ReadinessSources {
  const indexSource = [
    "createHomeExperienceModule",
    "createContractEngineService",
    "createPlatformControlTowerModule",
    "createMarketplaceIntelligenceModule",
    "createExecutiveCommandCenterModule",
    "createLaunchSimulationModule",
    "createReleaseReadinessCenterModule",
  ].join("\n");

  const serverSource = [
    "registerHomeRoutes",
    "registerPlatformControlTowerRoutes",
    "registerMarketplaceIntelligenceRoutes",
    "registerExecutiveCommandCenterRoutes",
    "registerLaunchSimulationRoutes",
    "registerReleaseReadinessRoutes",
    "requireAuthMiddleware",
  ].join("\n");

  return {
    indexSource,
    serverSource,
    packageSource: '"build"\n"lint:imports"\n"verify:x17"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      ".dependency-cruiser.cjs",
    ]),
  };
}

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

function buildUnitRawSnapshot(): LaunchSimulationRawSnapshot {
  return {
    executiveRaw: {
      readinessSources: buildHealthySources(),
      marketplaceRaw: {
        analyticsSnapshot: ANALYTICS_SNAPSHOT,
        providers: PROVIDERS,
        actionCounts: ACTION_COUNTS,
        requests: REQUESTS,
      },
      controlTowerRaw: {
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
    },
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x17-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x17-customer-session",
});

async function seedX17Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x17@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x17@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X17 Launch Simulation Engine Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds simulation baseline from executive intelligence layers", () => {
      const baseline = buildSimulationBaseline({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });

      assert.equal(baseline.activeUsers, 4);
      assert.equal(baseline.dailyRequests, 1);
      assert.ok(baseline.releaseReadinessScore >= 0);
      assert.ok(baseline.marketplaceHealthScore >= 0);
      assert.equal(baseline.currencyCode, "USD");
    });

    it("projects all four scenarios across five scale levels", () => {
      const baseline = buildSimulationBaseline({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });

      for (const scenario of SIMULATION_SCENARIOS) {
        for (const level of SIMULATION_LEVELS) {
          const simulation = projectScenarioSimulation({ baseline, scenario, level });
          assert.equal(simulation.scenario, scenario);
          assert.equal(simulation.level, level);
          assert.ok(simulation.marketplace.dailyRequests >= 0);
          assert.ok(simulation.financial.dailyContractValueMinor >= 0);
          assert.ok(simulation.trust.evaluations >= 0);
          assert.ok(simulation.operations.evidenceUploads >= 0);
          assert.ok(simulation.infrastructure.apiRequestsPerDay >= 0);
        }
      }
    });

    it("detects deterministic bottlenecks with severity and actions", () => {
      const baseline = buildSimulationBaseline({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const simulation = projectScenarioSimulation({
        baseline,
        scenario: "government_partnership",
        level: "10m",
      });

      assert.ok(simulation.bottlenecks.length > 0);
      assert.ok(simulation.bottlenecks.every((entry) => entry.recommendedAction.length > 0));
      assert.ok(
        simulation.bottlenecks.some((entry) =>
          ["low", "medium", "high", "critical"].includes(entry.severity)
        )
      );

      const bottlenecks = detectBottlenecks({
        scenario: simulation.scenario,
        level: simulation.level,
        marketplace: simulation.marketplace,
        financial: simulation.financial,
        trust: simulation.trust,
        operations: simulation.operations,
        infrastructure: simulation.infrastructure,
      });
      assert.equal(bottlenecks.length, simulation.bottlenecks.length);
    });

    it("computes executive simulation score and cost projections", () => {
      const snapshot = buildLaunchSimulationSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const score = computeExecutiveSimulationScore({
        baseline: snapshot.baseline,
        scenarios: snapshot.scenarios,
      });
      const anchor =
        snapshot.scenarios.find(
          (entry) => entry.scenario === "expected" && entry.level === "1m"
        ) ?? snapshot.scenarios[0]!;
      const costs = buildSimulationCostProjection({
        baseline: snapshot.baseline,
        scenario: anchor,
      });

      assert.ok(score >= 0 && score <= 100);
      assert.ok(costs.totalDailyCostMinor >= 0);
      assert.ok(costs.totalMonthlyCostMinor >= costs.totalDailyCostMinor);
    });

    it("composes full launch simulation view with snake_case fields", () => {
      const snapshot = buildLaunchSimulationSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulation({ snapshot });
      const view = toLaunchSimulationView(simulation);

      assert.equal(view.overview.headline, "Launch simulation engine");
      assert.equal(view.scenarios.length, SIMULATION_SCENARIOS.length * SIMULATION_LEVELS.length);
      assert.ok(view.overview.executive_simulation_score >= 0);
      assert.ok(Array.isArray(view.bottlenecks));
      assert.ok(Array.isArray(view.recommendations));
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
          `DELETE FROM identity.users WHERE email IN ('admin-x17@test.app13', 'customer-x17@test.app13')`
        );
        const admin = await seedX17Admin(db);
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

    it("loads launch simulation for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchSimulation } = createLaunchSimulationModule(db);
      const view = await launchSimulation.getLaunchSimulation(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "Launch simulation engine");
      assert.equal(view.scenarios.length, 20);
      assert.ok(view.overview.executive_simulation_score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchSimulation } = createLaunchSimulationModule(db);

      const scenarios = await launchSimulation.getScenarioSimulations(ADMIN_AUTH(adminUserId));
      assert.equal(scenarios.length, 20);

      const level1m = await launchSimulation.getLevelSimulation(ADMIN_AUTH(adminUserId), "1m");
      assert.equal(level1m.level, "1m");
      assert.equal(level1m.scenario, "expected");

      const bottlenecks = await launchSimulation.getBottleneckAnalysis(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(bottlenecks));

      const costs = await launchSimulation.getCostProjection(ADMIN_AUTH(adminUserId));
      assert.ok(costs.total_daily_cost_minor >= 0);

      const recommendations = await launchSimulation.getSimulationRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(recommendations));
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchSimulation } = createLaunchSimulationModule(db);

      await assert.rejects(
        () => launchSimulation.getLaunchSimulation(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers launch simulation routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { launchSimulation } = createLaunchSimulationModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x17");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLaunchSimulationRoutes(app, launchSimulation);

      for (const path of [
        "/launch-simulation",
        "/launch-simulation/scenarios",
        "/launch-simulation/1k",
        "/launch-simulation/10k",
        "/launch-simulation/100k",
        "/launch-simulation/1m",
        "/launch-simulation/10m",
        "/launch-simulation/bottlenecks",
        "/launch-simulation/costs",
        "/launch-simulation/recommendations",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
