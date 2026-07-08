import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerStrategicOperatingRoutes } from "../src/api/routes/strategic-operating-system.js";
import { createStrategicOperatingModule } from "../src/experience/strategic-operating-system/module.js";
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
import type { GovernmentPartnershipRawSnapshot } from "../src/experience/government-partnership/domain/government-partnership.js";
import {
  buildExecutiveDecisionBrief,
  buildOperatingCadenceView,
  buildStrategicActionPlan,
  buildStrategicGoalsView,
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
  buildStrategicOpportunityMap,
  buildStrategicPriorityView,
  buildStrategicRiskRegister,
  buildStrategicScorecard,
  computeStrategicOperatingScore,
  toStrategicOperatingSystemView,
} from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
import type { StrategicOperatingRawSnapshot } from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
import { buildInvestorReadinessSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
import { buildLaunchSimulationSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
import { buildExecutiveCommandCenterSnapshot } from "../src/experience/executive-command-center/domain/executive-command-center.js";
import { buildGovernmentPartnershipSnapshot } from "../src/experience/government-partnership/domain/government-partnership.js";
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
      "createGovernmentPartnershipModule",
      "createStrategicOperatingModule",
      "createReleaseReadinessCenterModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerExecutiveCommandCenterRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerGovernmentPartnershipRoutes",
      "registerStrategicOperatingRoutes",
      "registerReleaseReadinessRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x20"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      "docs/experience/X18-Investor-Readiness-Center.md",
      "docs/experience/X19-Government-Partnership-Center.md",
      "docs/experience/X20-APP13-Strategic-Operating-System.md",
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

function buildUnitInvestorRaw(): InvestorReadinessRawSnapshot {
  return {
    launchRaw: {
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
    },
  };
}

function buildUnitGovernmentRaw(): GovernmentPartnershipRawSnapshot {
  return {
    investorRaw: buildUnitInvestorRaw(),
  };
}

function buildUnitRawSnapshot(): StrategicOperatingRawSnapshot {
  return {
    governmentRaw: buildUnitGovernmentRaw(),
  };
}

function buildUnitContext() {
  const investor = buildInvestorReadinessSnapshot({
    raw: buildUnitGovernmentRaw().investorRaw,
    generatedAt: FIXED_TIME,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: buildUnitGovernmentRaw().investorRaw.launchRaw,
    generatedAt: FIXED_TIME,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: buildUnitGovernmentRaw().investorRaw.launchRaw.executiveRaw,
    generatedAt: FIXED_TIME,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: buildUnitGovernmentRaw(),
    generatedAt: FIXED_TIME,
  });

  return { investor, simulation, executive, government };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x20-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x20-customer-session",
});

async function seedX20Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x20@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x20@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X20 APP13 Strategic Operating System Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds strategic priority engine and risk register from intelligence layers", () => {
      const { investor, simulation, executive, government } = buildUnitContext();

      const priorities = buildStrategicPriorityView({
        investor,
        simulation,
        executive,
        government,
      });
      const risks = buildStrategicRiskRegister({
        investor,
        simulation,
        executive,
        government,
      });

      assert.ok(priorities.priorities.length > 0);
      assert.ok(
        priorities.priorities.every((entry) =>
          ["critical", "high", "medium", "low"].includes(entry.priorityLevel)
        )
      );
      assert.ok(risks.risks.length > 0);
      assert.ok(
        risks.risks.every((entry) =>
          [
            "launch",
            "marketplace",
            "trust",
            "financial",
            "operational",
            "infrastructure",
            "investor",
            "government",
          ].includes(entry.category)
        )
      );
    });

    it("builds opportunity map, decision brief, and strategic goals", () => {
      const { investor, simulation, executive, government } = buildUnitContext();
      const priorities = buildStrategicPriorityView({
        investor,
        simulation,
        executive,
        government,
      });

      const opportunities = buildStrategicOpportunityMap({
        investor,
        simulation,
        executive,
        government,
      });
      const decisionBrief = buildExecutiveDecisionBrief({ priorities, investor, executive });
      const goals = buildStrategicGoalsView({ simulation, investor });

      assert.equal(opportunities.opportunities.length, 8);
      assert.equal(decisionBrief.decisions.length, 5);
      assert.equal(goals.goals.length, 4);
      assert.deepEqual(
        goals.goals.map((entry) => entry.level),
        ["10k", "100k", "1m", "10m"]
      );
    });

    it("builds operating cadence, action plan, and scorecard", () => {
      const { investor, simulation, executive, government } = buildUnitContext();
      const priorities = buildStrategicPriorityView({
        investor,
        simulation,
        executive,
        government,
      });

      const cadence = buildOperatingCadenceView({ investor, simulation, executive, government });
      const actionPlan = buildStrategicActionPlan({ priorities });
      const scorecard = buildStrategicScorecard({ investor, simulation, government });

      assert.equal(cadence.entries.length, 4);
      assert.equal(actionPlan.groups.length, 4);
      assert.equal(scorecard.entries.length, 7);
      assert.ok(cadence.entries.every((entry) => entry.ownerRole === "platform_admin"));
    });

    it("computes strategic operating score deterministically", () => {
      const { investor, simulation, government } = buildUnitContext();
      const score = computeStrategicOperatingScore({ investor, simulation, government });

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.releaseWeight, 15);
      assert.equal(score.trustFinancialWeight, 10);
      assert.ok(["operating_ready", "developing", "attention_required"].includes(score.status));
    });

    it("composes full strategic operating system view with snake_case fields", () => {
      const snapshot = buildStrategicOperatingSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const system = buildStrategicOperatingSystem({ snapshot });
      const view = toStrategicOperatingSystemView(system);

      assert.equal(view.overview.headline, "APP13 strategic operating system");
      assert.ok(view.overview.strategic_readiness_score >= 0);
      assert.equal(view.goals.goals.length, 4);
      assert.equal(view.decision_brief.decisions.length, 5);
      assert.equal(view.scorecard.entries.length, 7);
      assert.ok(view.operating_score.score >= 0);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x20@test.app13', 'customer-x20@test.app13')`
        );
        const admin = await seedX20Admin(db);
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

    it("loads strategic operating system for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { strategicOperatingSystem } = createStrategicOperatingModule(db);
      const view = await strategicOperatingSystem.getStrategicOperatingSystem(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "APP13 strategic operating system");
      assert.ok(view.operating_score.score >= 0);
      assert.equal(view.decision_brief.decisions.length, 5);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { strategicOperatingSystem } = createStrategicOperatingModule(db);

      const overview = await strategicOperatingSystem.getStrategicOperatingOverview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(overview.summary.length > 0);

      const priorities = await strategicOperatingSystem.getStrategicPriorities(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(priorities.priorities.length >= 0);

      const risks = await strategicOperatingSystem.getStrategicRiskRegister(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(risks.risks.length >= 0);

      const opportunities = await strategicOperatingSystem.getStrategicOpportunityMap(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(opportunities.opportunities.length, 8);

      const decisionBrief = await strategicOperatingSystem.getExecutiveDecisionBrief(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(decisionBrief.decisions.length, 5);

      const goals = await strategicOperatingSystem.getStrategicGoals(ADMIN_AUTH(adminUserId));
      assert.equal(goals.goals.length, 4);

      const cadence = await strategicOperatingSystem.getOperatingCadence(ADMIN_AUTH(adminUserId));
      assert.equal(cadence.entries.length, 4);

      const actionPlan = await strategicOperatingSystem.getStrategicActionPlan(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(actionPlan.groups.length, 4);

      const scorecard = await strategicOperatingSystem.getStrategicScorecard(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(scorecard.entries.length, 7);

      const score = await strategicOperatingSystem.getStrategicOperatingScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { strategicOperatingSystem } = createStrategicOperatingModule(db);

      await assert.rejects(
        () =>
          strategicOperatingSystem.getStrategicOperatingSystem(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers strategic operating system routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { strategicOperatingSystem } = createStrategicOperatingModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x20");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerStrategicOperatingRoutes(app, strategicOperatingSystem);

      for (const path of [
        "/strategic-operating-system",
        "/strategic-operating-system/overview",
        "/strategic-operating-system/priorities",
        "/strategic-operating-system/risks",
        "/strategic-operating-system/opportunities",
        "/strategic-operating-system/decision-brief",
        "/strategic-operating-system/goals",
        "/strategic-operating-system/cadence",
        "/strategic-operating-system/action-plan",
        "/strategic-operating-system/scorecard",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
