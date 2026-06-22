import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerMissionControlRoutes } from "../src/api/routes/mission-control.js";
import { createMissionControlModule } from "../src/experience/mission-control/module.js";
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
  buildExecutiveActionQueue,
  buildGovernmentCommandPanel,
  buildGrowthCommandPanel,
  buildInvestorCommandPanel,
  buildMissionControlCenter,
  buildMissionControlSnapshot,
  buildOperationsCommandPanel,
  buildTopDecisionsPanel,
  buildTopOpportunitiesPanel,
  buildTopRisksPanel,
  computeMissionControlScore,
  toMissionControlCenterView,
} from "../src/experience/mission-control/domain/mission-control.js";
import type { MissionControlRawSnapshot } from "../src/experience/mission-control/domain/mission-control.js";
import type { StrategicOperatingRawSnapshot } from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
import {
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
} from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
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
      "createMissionControlModule",
      "createReleaseReadinessCenterModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerExecutiveCommandCenterRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerGovernmentPartnershipRoutes",
      "registerStrategicOperatingRoutes",
      "registerMissionControlRoutes",
      "registerReleaseReadinessRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x21"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      "docs/experience/X18-Investor-Readiness-Center.md",
      "docs/experience/X19-Government-Partnership-Center.md",
      "docs/experience/X20-APP13-Strategic-Operating-System.md",
      "docs/experience/X21-Mission-Control.md",
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

function buildUnitStrategicRaw(): StrategicOperatingRawSnapshot {
  return {
    governmentRaw: {
      investorRaw: buildUnitInvestorRaw(),
    },
  };
}

function buildUnitRawSnapshot(): MissionControlRawSnapshot {
  return {
    strategicRaw: buildUnitStrategicRaw(),
  };
}

function buildUnitStrategicSystem() {
  const snapshot = buildStrategicOperatingSnapshot({
    raw: buildUnitStrategicRaw(),
    generatedAt: FIXED_TIME,
  });
  return buildStrategicOperatingSystem({ snapshot });
}

function buildUnitContext() {
  const investor = buildInvestorReadinessSnapshot({
    raw: buildUnitStrategicRaw().governmentRaw.investorRaw,
    generatedAt: FIXED_TIME,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: buildUnitStrategicRaw().governmentRaw.investorRaw.launchRaw,
    generatedAt: FIXED_TIME,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: buildUnitStrategicRaw().governmentRaw.investorRaw.launchRaw.executiveRaw,
    generatedAt: FIXED_TIME,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: buildUnitStrategicRaw().governmentRaw,
    generatedAt: FIXED_TIME,
  });
  const strategic = buildUnitStrategicSystem();

  return { investor, simulation, executive, government, strategic };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x21-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x21-customer-session",
});

async function seedX21Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x21@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x21@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X21 Mission Control Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds decision, risk, and opportunity panels from strategic intelligence", () => {
      const { strategic } = buildUnitContext();

      const decisions = buildTopDecisionsPanel({ strategic });
      const risks = buildTopRisksPanel({ strategic });
      const opportunities = buildTopOpportunitiesPanel({ strategic });

      assert.equal(decisions.decisions.length, 5);
      assert.ok(risks.risks.length <= 10);
      assert.ok(opportunities.opportunities.length >= 8);
    });

    it("builds growth, government, investor, and operations command panels", () => {
      const { investor, simulation, executive, government } = buildUnitContext();

      const growth = buildGrowthCommandPanel({ investor, simulation, executive });
      const governmentPanel = buildGovernmentCommandPanel({ government });
      const investors = buildInvestorCommandPanel({ investor });
      const operations = buildOperationsCommandPanel({ executive });

      assert.ok(growth.userGrowthReadiness >= 0);
      assert.equal(governmentPanel.partnerships.length, 5);
      assert.ok(investors.investorReadinessScore >= 0);
      assert.ok(Array.isArray(operations.launchBlockers));
    });

    it("builds executive action queue with four horizons", () => {
      const { strategic } = buildUnitContext();
      const actionQueue = buildExecutiveActionQueue({ strategic });

      assert.equal(actionQueue.groups.length, 4);
      assert.deepEqual(
        actionQueue.groups.map((entry) => entry.horizon),
        ["immediate", "today", "this_week", "this_month"]
      );
    });

    it("computes mission control score deterministically", () => {
      const { investor, government, strategic } = buildUnitContext();
      const score = computeMissionControlScore({ strategic, investor, government });

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.strategicOperatingWeight, 25);
      assert.equal(score.governmentWeight, 15);
      assert.ok(["command_ready", "developing", "attention_required"].includes(score.status));
    });

    it("composes full mission control center view with snake_case fields", () => {
      const snapshot = buildMissionControlSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildMissionControlCenter({ snapshot });
      const view = toMissionControlCenterView(center);

      assert.equal(view.overview.headline, "APP13 mission control");
      assert.ok(view.overview.mission_score >= 0);
      assert.equal(view.decisions.decisions.length, 5);
      assert.ok(view.risks.risks.length <= 10);
      assert.equal(view.action_queue.groups.length, 4);
      assert.ok(view.mission_score.score >= 0);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x21@test.app13', 'customer-x21@test.app13')`
        );
        const admin = await seedX21Admin(db);
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

    it("loads mission control center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { missionControl } = createMissionControlModule(db);
      const view = await missionControl.getMissionControlCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "APP13 mission control");
      assert.ok(view.mission_score.score >= 0);
      assert.equal(view.decisions.decisions.length, 5);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { missionControl } = createMissionControlModule(db);

      const overview = await missionControl.getMissionControlOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const decisions = await missionControl.getTopDecisionsPanel(ADMIN_AUTH(adminUserId));
      assert.equal(decisions.decisions.length, 5);

      const risks = await missionControl.getTopRisksPanel(ADMIN_AUTH(adminUserId));
      assert.ok(risks.risks.length <= 10);

      const opportunities = await missionControl.getTopOpportunitiesPanel(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(opportunities.opportunities.length >= 8);

      const growth = await missionControl.getGrowthCommandPanel(ADMIN_AUTH(adminUserId));
      assert.ok(growth.user_growth_readiness >= 0);

      const government = await missionControl.getGovernmentCommandPanel(ADMIN_AUTH(adminUserId));
      assert.equal(government.partnerships.length, 5);

      const investors = await missionControl.getInvestorCommandPanel(ADMIN_AUTH(adminUserId));
      assert.ok(investors.investor_readiness_score >= 0);

      const operations = await missionControl.getOperationsCommandPanel(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(operations.launch_blockers));

      const actionQueue = await missionControl.getExecutiveActionQueue(ADMIN_AUTH(adminUserId));
      assert.equal(actionQueue.groups.length, 4);

      const score = await missionControl.getMissionControlScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { missionControl } = createMissionControlModule(db);

      await assert.rejects(
        () => missionControl.getMissionControlCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers mission control routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { missionControl } = createMissionControlModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x21");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerMissionControlRoutes(app, missionControl);

      for (const path of [
        "/mission-control",
        "/mission-control/overview",
        "/mission-control/decisions",
        "/mission-control/risks",
        "/mission-control/opportunities",
        "/mission-control/growth",
        "/mission-control/government",
        "/mission-control/investors",
        "/mission-control/operations",
        "/mission-control/action-queue",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
