import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerGovernmentPartnershipRoutes } from "../src/api/routes/government-partnership.js";
import { createGovernmentPartnershipModule } from "../src/experience/government-partnership/module.js";
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
  buildDigitalGovernmentAlignment,
  buildEconomicImpact,
  buildFinancialAlignment,
  buildGovernmentPartnershipCenter,
  buildGovernmentPartnershipSnapshot,
  buildInsuranceAlignment,
  buildPartnershipMatrix,
  buildRegulatoryAlignment,
  buildWorkforceDevelopmentAlignment,
  buildWorkforceImpact,
  computeGovernmentReadinessScore,
  toGovernmentPartnershipCenterView,
} from "../src/experience/government-partnership/domain/government-partnership.js";
import { buildInvestorReadinessSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
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
import type { GovernmentPartnershipRawSnapshot } from "../src/experience/government-partnership/domain/government-partnership.js";
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
      "createReleaseReadinessCenterModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerExecutiveCommandCenterRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerGovernmentPartnershipRoutes",
      "registerReleaseReadinessRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x19"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/experience/X17-Launch-Simulation-Engine.md",
      "docs/experience/X18-Investor-Readiness-Center.md",
      "docs/experience/X19-Government-Partnership-Center.md",
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

function buildUnitRawSnapshot(): GovernmentPartnershipRawSnapshot {
  return {
    investorRaw: buildUnitInvestorRaw(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x19-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x19-customer-session",
});

async function seedX19Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x19@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x19@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X19 Government Partnership Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds economic impact and workforce views from intelligence layers", () => {
      const raw = buildUnitRawSnapshot();
      const investor = buildInvestorReadinessSnapshot({
        raw: raw.investorRaw,
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulationSnapshot({
        raw: raw.investorRaw.launchRaw,
        generatedAt: FIXED_TIME,
      });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: raw.investorRaw.launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });

      const economic = buildEconomicImpact({ investor, simulation });
      const workforce = buildWorkforceImpact({
        investor,
        simulation,
        executive,
        activeCustomers: ANALYTICS_SNAPSHOT.users.activeCustomers,
      });

      assert.equal(economic.scaleProjections.length, 3);
      assert.ok(economic.annualizedContractVolumeMinor >= 0);
      assert.equal(workforce.activeCustomers, 3);
      assert.ok(workforce.skillDemandIndicators.length >= 3);
    });

    it("builds financial, insurance, and workforce development alignment", () => {
      const raw = buildUnitRawSnapshot();
      const investor = buildInvestorReadinessSnapshot({
        raw: raw.investorRaw,
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulationSnapshot({
        raw: raw.investorRaw.launchRaw,
        generatedAt: FIXED_TIME,
      });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: raw.investorRaw.launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });

      const financial = buildFinancialAlignment({ investor, executive });
      const insurance = buildInsuranceAlignment({ investor, simulation });
      const workforceDevelopment = buildWorkforceDevelopmentAlignment({ investor, simulation });

      assert.equal(financial.targets.length, 3);
      assert.equal(insurance.targets.length, 2);
      assert.equal(workforceDevelopment.targets.length, 3);
    });

    it("builds digital government, regulatory alignment, and partnership matrix", () => {
      const raw = buildUnitRawSnapshot();
      const investor = buildInvestorReadinessSnapshot({
        raw: raw.investorRaw,
        generatedAt: FIXED_TIME,
      });
      const simulation = buildLaunchSimulationSnapshot({
        raw: raw.investorRaw.launchRaw,
        generatedAt: FIXED_TIME,
      });
      const executive = buildExecutiveCommandCenterSnapshot({
        raw: raw.investorRaw.launchRaw.executiveRaw,
        generatedAt: FIXED_TIME,
      });

      const digital = buildDigitalGovernmentAlignment({ investor, executive, simulation });
      const regulatory = buildRegulatoryAlignment({ investor, executive });
      const partnerships = buildPartnershipMatrix({ investor });

      assert.equal(digital.targets.length, 3);
      assert.equal(regulatory.entries.length, 6);
      assert.equal(partnerships.entries.length, 5);
      assert.ok(
        regulatory.entries.every((entry) =>
          ["aligned", "partially_aligned", "attention_required"].includes(entry.status)
        )
      );
    });

    it("computes government readiness score deterministically", () => {
      const snapshot = buildGovernmentPartnershipSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const score = computeGovernmentReadinessScore({
        economicImpact: snapshot.economicImpact,
        workforceImpact: snapshot.workforceImpact,
        financialAlignment: snapshot.financialAlignment,
        insuranceAlignment: snapshot.insuranceAlignment,
        digitalGovernment: snapshot.digitalGovernment,
        regulatoryAlignment: snapshot.regulatoryAlignment,
      });

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.economicWeight, 20);
      assert.equal(score.regulatoryWeight, 15);
      assert.ok(["partnership_ready", "developing", "attention_required"].includes(score.status));
    });

    it("composes full government partnership center view with snake_case fields", () => {
      const snapshot = buildGovernmentPartnershipSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildGovernmentPartnershipCenter({ snapshot });
      const view = toGovernmentPartnershipCenterView(center);

      assert.equal(view.overview.headline, "Government partnership center");
      assert.ok(view.overview.government_readiness_score >= 0);
      assert.equal(view.economic_impact.scale_projections.length, 3);
      assert.equal(view.regulatory.entries.length, 6);
      assert.equal(view.partnerships.entries.length, 5);
      assert.ok(view.government_score.score >= 0);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x19@test.app13', 'customer-x19@test.app13')`
        );
        const admin = await seedX19Admin(db);
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

    it("loads government partnership center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { governmentPartnership } = createGovernmentPartnershipModule(db);
      const view = await governmentPartnership.getGovernmentPartnershipCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "Government partnership center");
      assert.ok(view.government_score.score >= 0);
      assert.equal(view.partnerships.entries.length, 5);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { governmentPartnership } = createGovernmentPartnershipModule(db);

      const overview = await governmentPartnership.getGovernmentPartnershipOverview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(overview.summary.length > 0);

      const economic = await governmentPartnership.getEconomicImpact(ADMIN_AUTH(adminUserId));
      assert.equal(economic.scale_projections.length, 3);

      const workforce = await governmentPartnership.getWorkforceImpact(ADMIN_AUTH(adminUserId));
      assert.ok(workforce.active_providers >= 0);

      const financial = await governmentPartnership.getFinancialAlignment(ADMIN_AUTH(adminUserId));
      assert.equal(financial.targets.length, 3);

      const insurance = await governmentPartnership.getInsuranceAlignment(ADMIN_AUTH(adminUserId));
      assert.equal(insurance.targets.length, 2);

      const workforceDevelopment = await governmentPartnership.getWorkforceDevelopmentAlignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(workforceDevelopment.targets.length, 3);

      const digital = await governmentPartnership.getDigitalGovernmentAlignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(digital.targets.length, 3);

      const regulatory = await governmentPartnership.getRegulatoryAlignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(regulatory.entries.length, 6);

      const partnerships = await governmentPartnership.getPartnershipMatrix(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(partnerships.entries.length, 5);

      const score = await governmentPartnership.getGovernmentReadinessScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { governmentPartnership } = createGovernmentPartnershipModule(db);

      await assert.rejects(
        () =>
          governmentPartnership.getGovernmentPartnershipCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers government partnership routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { governmentPartnership } = createGovernmentPartnershipModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x19");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerGovernmentPartnershipRoutes(app, governmentPartnership);

      for (const path of [
        "/government-partnership",
        "/government-partnership/overview",
        "/government-partnership/economic-impact",
        "/government-partnership/workforce",
        "/government-partnership/financial",
        "/government-partnership/insurance",
        "/government-partnership/workforce-development",
        "/government-partnership/digital-government",
        "/government-partnership/regulatory",
        "/government-partnership/partnerships",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
