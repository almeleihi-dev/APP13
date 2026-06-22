import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutiveExperienceRoutes } from "../src/api/routes/executive-experience.js";
import { createExecutiveExperienceModule } from "../src/experience/executive-experience/module.js";
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
import type { MissionControlRawSnapshot } from "../src/experience/mission-control/domain/mission-control.js";
import {
  buildExecutiveDashboardExperience,
  buildExecutiveExperienceSnapshot,
  buildExecutiveExperienceLayer,
  buildExecutiveSummaryExperience,
  buildGovernmentPresentationExperience,
  buildGrowthExperience,
  buildInvestorPresentationExperience,
  buildStrategicNarrativeExperience,
  computeExecutiveExperienceScore,
  toExecutiveExperienceLayerView,
} from "../src/experience/executive-experience/domain/executive-experience.js";
import type { ExecutiveExperienceRawSnapshot } from "../src/experience/executive-experience/domain/executive-experience.js";
import type { StrategicOperatingRawSnapshot } from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
import {
  buildMissionControlCenter,
  buildMissionControlSnapshot,
} from "../src/experience/mission-control/domain/mission-control.js";
import {
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
} from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
import { buildInvestorReadinessSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
import { buildLaunchSimulationSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
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
      "createExecutiveExperienceModule",
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
      "registerExecutiveExperienceRoutes",
      "registerReleaseReadinessRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x22"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      "docs/experience/X18-Investor-Readiness-Center.md",
      "docs/experience/X19-Government-Partnership-Center.md",
      "docs/experience/X20-APP13-Strategic-Operating-System.md",
      "docs/experience/X21-Mission-Control.md",
      "docs/experience/X22-Executive-Experience-Layer.md",
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

function buildUnitMissionRaw(): MissionControlRawSnapshot {
  return {
    strategicRaw: {
      governmentRaw: {
        investorRaw: buildUnitInvestorRaw(),
      },
    },
  };
}

function buildUnitRawSnapshot(): ExecutiveExperienceRawSnapshot {
  return {
    missionRaw: buildUnitMissionRaw(),
  };
}

function buildUnitContext() {
  const missionSnapshot = buildMissionControlSnapshot({
    raw: buildUnitMissionRaw(),
    generatedAt: FIXED_TIME,
  });
  const mission = buildMissionControlCenter({ snapshot: missionSnapshot });
  const strategicSnapshot = buildStrategicOperatingSnapshot({
    raw: buildUnitMissionRaw().strategicRaw,
    generatedAt: FIXED_TIME,
  });
  const strategic = buildStrategicOperatingSystem({ snapshot: strategicSnapshot });
  const investor = buildInvestorReadinessSnapshot({
    raw: buildUnitMissionRaw().strategicRaw.governmentRaw.investorRaw,
    generatedAt: FIXED_TIME,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: buildUnitMissionRaw().strategicRaw.governmentRaw.investorRaw.launchRaw,
    generatedAt: FIXED_TIME,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: buildUnitMissionRaw().strategicRaw.governmentRaw,
    generatedAt: FIXED_TIME,
  });

  return { mission, strategic, investor, simulation, government };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x22-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x22-customer-session",
});

async function seedX22Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x22@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x22@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X22 Executive Experience Layer", () => {
  describe("domain layer (unit)", () => {
    it("builds executive dashboard and summary experiences", () => {
      const { mission, strategic } = buildUnitContext();

      const dashboard = buildExecutiveDashboardExperience({ mission, strategic });
      const summary = buildExecutiveSummaryExperience({ mission });

      assert.equal(dashboard.headline, "Executive dashboard");
      assert.ok(dashboard.missionScore >= 0);
      assert.equal(summary.topDecisions.length, 5);
      assert.ok(summary.platformStatus.length > 0);
    });

    it("builds investor and government presentation experiences", () => {
      const { mission, investor, government } = buildUnitContext();

      const investorPresentation = buildInvestorPresentationExperience({ investor, mission });
      const governmentPresentation = buildGovernmentPresentationExperience({ government });

      assert.ok(investorPresentation.investorReadinessScore >= 0);
      assert.ok(investorPresentation.strategicStrengths.length >= 0);
      assert.ok(governmentPresentation.governmentReadinessScore >= 0);
      assert.ok(governmentPresentation.digitalAlignmentScore >= 0);
    });

    it("builds growth experience and strategic narrative", () => {
      const { mission, strategic, investor, simulation, government } = buildUnitContext();

      const growth = buildGrowthExperience({ simulation, mission });
      const narrative = buildStrategicNarrativeExperience({
        mission,
        strategic,
        investor,
        government,
      });

      assert.equal(growth.targets.length, 4);
      assert.ok(narrative.whereApp13IsToday.length > 0);
      assert.ok(narrative.whereApp13IsGoing.length > 0);
      assert.ok(narrative.recommendedFocusAreas.length >= 1);
    });

    it("computes executive experience score deterministically", () => {
      const { mission, strategic, investor, government } = buildUnitContext();
      const score = computeExecutiveExperienceScore({
        mission,
        strategic,
        investor,
        government,
      });

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.missionControlWeight, 25);
      assert.equal(score.releaseReadinessWeight, 15);
      assert.ok(["presentation_ready", "developing", "attention_required"].includes(score.status));
    });

    it("composes full executive experience layer with snake_case fields", () => {
      const snapshot = buildExecutiveExperienceSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const layer = buildExecutiveExperienceLayer({ snapshot });
      const view = toExecutiveExperienceLayerView(layer);

      assert.equal(view.dashboard.headline, "Executive dashboard");
      assert.ok(view.dashboard.mission_score >= 0);
      assert.equal(view.summary.top_decisions.length, 5);
      assert.equal(view.growth.targets.length, 4);
      assert.ok(view.narrative.where_app13_is_today.length > 0);
      assert.ok(view.experience_score.score >= 0);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x22@test.app13', 'customer-x22@test.app13')`
        );
        const admin = await seedX22Admin(db);
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

    it("loads executive experience layer for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveExperience } = createExecutiveExperienceModule(db);
      const view = await executiveExperience.getExecutiveExperienceLayer(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.dashboard.headline, "Executive dashboard");
      assert.ok(view.experience_score.score >= 0);
      assert.equal(view.summary.top_decisions.length, 5);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveExperience } = createExecutiveExperienceModule(db);

      const dashboard = await executiveExperience.getExecutiveDashboardExperience(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(dashboard.summary.length > 0);

      const summary = await executiveExperience.getExecutiveSummaryExperience(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(summary.top_decisions.length, 5);

      const investor = await executiveExperience.getInvestorPresentationExperience(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(investor.investor_readiness_score >= 0);

      const government = await executiveExperience.getGovernmentPresentationExperience(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(government.government_readiness_score >= 0);

      const growth = await executiveExperience.getGrowthExperience(ADMIN_AUTH(adminUserId));
      assert.equal(growth.targets.length, 4);

      const narrative = await executiveExperience.getStrategicNarrativeExperience(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(narrative.where_app13_is_today.length > 0);

      const snapshot = await executiveExperience.getExecutiveSnapshot(ADMIN_AUTH(adminUserId));
      assert.equal(snapshot.top_decisions.length, 5);

      const score = await executiveExperience.getExecutiveExperienceScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveExperience } = createExecutiveExperienceModule(db);

      await assert.rejects(
        () =>
          executiveExperience.getExecutiveExperienceLayer(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers executive experience routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { executiveExperience } = createExecutiveExperienceModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x22");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutiveExperienceRoutes(app, executiveExperience);

      for (const path of [
        "/executive-experience",
        "/executive-experience/dashboard",
        "/executive-experience/summary",
        "/executive-experience/investor",
        "/executive-experience/government",
        "/executive-experience/growth",
        "/executive-experience/narrative",
        "/executive-experience/snapshot",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
