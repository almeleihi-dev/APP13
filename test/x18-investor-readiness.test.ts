import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerInvestorReadinessRoutes } from "../src/api/routes/investor-readiness.js";
import { createInvestorReadinessModule } from "../src/experience/investor-readiness/module.js";
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
  buildFundingReadiness,
  buildInvestmentOverview,
  buildInvestorReadinessCenter,
  buildInvestorReadinessSnapshot,
  buildMarketOpportunity,
  buildPartnershipReadiness,
  buildRevenuePotential,
  buildRiskMatrix,
  buildScaleReadiness,
  buildStrategicStrengths,
  computeInvestorReadinessScore,
  toInvestorReadinessCenterView,
} from "../src/experience/investor-readiness/domain/investor-readiness.js";
import { buildLaunchSimulationSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
import { buildExecutiveCommandCenterSnapshot } from "../src/experience/executive-command-center/domain/executive-command-center.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../src/discovery/infrastructure/discovery-repository.js";
import type { ReadinessSources } from "../src/experience/release-readiness/domain/release-readiness.js";
import type { InvestorReadinessRawSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
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
  return {
    indexSource: [
      "createMarketplaceIntelligenceModule",
      "createExecutiveCommandCenterModule",
      "createLaunchSimulationModule",
      "createInvestorReadinessModule",
      "createReleaseReadinessCenterModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerExecutiveCommandCenterRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerReleaseReadinessRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x18"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      "docs/experience/X18-Investor-Readiness-Center.md",
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

function buildUnitLaunchRaw(): LaunchSimulationRawSnapshot {
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

function buildUnitRawSnapshot(): InvestorReadinessRawSnapshot {
  return {
    launchRaw: buildUnitLaunchRaw(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x18-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x18-customer-session",
});

async function seedX18Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x18@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x18@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X18 Investor Readiness Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds investment overview from executive and simulation layers", () => {
      const raw = buildUnitRawSnapshot();
      const simulation = buildLaunchSimulationSnapshot({ raw: raw.launchRaw, generatedAt: FIXED_TIME });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: raw.launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });
      const overview = buildInvestmentOverview({ executive, simulation });

      assert.equal(overview.headline, "Investor readiness center");
      assert.ok(overview.executiveHealthScore >= 0);
      assert.ok(overview.releaseReadinessScore >= 0);
      assert.ok(overview.marketplaceHealthScore >= 0);
      assert.ok(overview.simulationScore >= 0);
      assert.ok(overview.trustScore >= 0);
      assert.ok(overview.financialScore >= 0);
    });

    it("builds market opportunity and revenue potential projections", () => {
      const snapshot = buildInvestorReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: buildUnitRawSnapshot().launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulationSnapshot({
        raw: buildUnitRawSnapshot().launchRaw,
        generatedAt: FIXED_TIME,
      });

      const market = buildMarketOpportunity({ executive, simulation });
      const revenue = buildRevenuePotential({ simulation });

      assert.ok(market.demandGrowthPercent >= 0);
      assert.equal(revenue.projections.length, 3);
      assert.equal(revenue.projections[0]?.level, "100k");
      assert.equal(revenue.projections[2]?.level, "10m");
    });

    it("builds scale readiness, risk matrix, and strategic strengths", () => {
      const raw = buildUnitRawSnapshot();
      const simulation = buildLaunchSimulationSnapshot({ raw: raw.launchRaw, generatedAt: FIXED_TIME });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: raw.launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });
      const scaleReadiness = buildScaleReadiness({ executive, simulation });
      const riskMatrix = buildRiskMatrix({ executive, simulation });
      const strengths = buildStrategicStrengths({ executive, simulation });

      assert.ok(scaleReadiness.launchReadinessScore >= 0);
      assert.equal(riskMatrix.entries.length, 5);
      assert.ok(strengths.some((entry) => entry.strengthCode === "trust-infrastructure"));
      assert.ok(strengths.some((entry) => entry.strengthCode === "simulation-capability"));
    });

    it("builds funding and partnership readiness deterministically", () => {
      const snapshot = buildInvestorReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: buildUnitRawSnapshot().launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulationSnapshot({
        raw: buildUnitRawSnapshot().launchRaw,
        generatedAt: FIXED_TIME,
      });
      const scaleReadiness = buildScaleReadiness({ executive, simulation });
      const funding = buildFundingReadiness({
        overview: snapshot.overview,
        scaleReadiness,
        riskMatrix: snapshot.riskMatrix,
        executive,
      });
      const partnerships = buildPartnershipReadiness({
        overview: snapshot.overview,
        scaleReadiness,
        executive,
        simulation,
      });

      assert.equal(funding.stages.length, 5);
      assert.equal(partnerships.targets.length, 5);
      assert.ok(partnerships.targets.some((entry) => entry.target === "government"));
      assert.ok(partnerships.targets.some((entry) => entry.target === "enterprise_partners"));
    });

    it("computes investor readiness score and full snake_case view", () => {
      const snapshot = buildInvestorReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const score = computeInvestorReadinessScore({
        overview: snapshot.overview,
        scaleReadiness: snapshot.scaleReadiness,
      });
      const center = buildInvestorReadinessCenter({ snapshot: { ...snapshot, investorScore: score } });
      const view = toInvestorReadinessCenterView(center);

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.executiveWeight, 20);
      assert.equal(score.financialWeight, 25);
      assert.equal(view.overview.headline, "Investor readiness center");
      assert.equal(view.revenue_potential.projections.length, 3);
      assert.equal(view.risk_matrix.entries.length, 5);
      assert.equal(view.funding_readiness.stages.length, 5);
      assert.equal(view.partnership_readiness.targets.length, 5);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x18@test.app13', 'customer-x18@test.app13')`
        );
        const admin = await seedX18Admin(db);
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

    it("loads investor readiness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { investorReadiness } = createInvestorReadinessModule(db);
      const view = await investorReadiness.getInvestorReadinessCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "Investor readiness center");
      assert.ok(view.investor_score.score >= 0);
      assert.equal(view.revenue_potential.projections.length, 3);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { investorReadiness } = createInvestorReadinessModule(db);

      const overview = await investorReadiness.getInvestmentOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const market = await investorReadiness.getMarketOpportunity(ADMIN_AUTH(adminUserId));
      assert.ok(market.opportunity_count >= 0);

      const revenue = await investorReadiness.getRevenuePotential(ADMIN_AUTH(adminUserId));
      assert.equal(revenue.projections.length, 3);

      const scale = await investorReadiness.getScaleReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(scale.launch_readiness_score >= 0);

      const risks = await investorReadiness.getRiskMatrix(ADMIN_AUTH(adminUserId));
      assert.equal(risks.entries.length, 5);

      const strengths = await investorReadiness.getStrategicStrengths(ADMIN_AUTH(adminUserId));
      assert.ok(strengths.length >= 5);

      const funding = await investorReadiness.getFundingReadiness(ADMIN_AUTH(adminUserId));
      assert.equal(funding.stages.length, 5);

      const partnerships = await investorReadiness.getPartnershipReadiness(ADMIN_AUTH(adminUserId));
      assert.equal(partnerships.targets.length, 5);

      const score = await investorReadiness.getInvestorReadinessScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { investorReadiness } = createInvestorReadinessModule(db);

      await assert.rejects(
        () => investorReadiness.getInvestorReadinessCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers investor readiness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { investorReadiness } = createInvestorReadinessModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x18");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerInvestorReadinessRoutes(app, investorReadiness);

      for (const path of [
        "/investor-readiness",
        "/investor-readiness/overview",
        "/investor-readiness/market",
        "/investor-readiness/revenue",
        "/investor-readiness/scale",
        "/investor-readiness/risks",
        "/investor-readiness/strengths",
        "/investor-readiness/funding",
        "/investor-readiness/partnerships",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
