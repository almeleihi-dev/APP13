import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutiveCommandCenterRoutes } from "../src/api/routes/executive-command-center.js";
import { createExecutiveCommandCenterModule } from "../src/experience/executive-command-center/module.js";
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
  buildExecutiveCommandCenter,
  buildExecutiveCommandCenterSnapshot,
  buildFinancialEscrowOverview,
  buildMarketplaceOverview,
  buildOperationalBlockers,
  buildOperationalStrengths,
  buildOperationalWarnings,
  buildReleaseReadinessOverview,
  buildTrustReputationOverview,
  computeExecutiveHealthScore,
  deriveExecutiveRecommendedActions,
  deriveExecutiveStatus,
  toExecutiveCommandCenterView,
} from "../src/experience/executive-command-center/domain/executive-command-center.js";
import { buildReleaseReadinessCenterSnapshot } from "../src/experience/release-readiness/domain/release-readiness.js";
import { buildMarketplaceIntelligenceSnapshot } from "../src/experience/marketplace-intelligence/domain/marketplace-intelligence.js";
import { buildPlatformControlTowerSnapshot } from "../src/experience/platform-control-tower/domain/platform-control-tower.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../src/discovery/infrastructure/discovery-repository.js";
import type { ReadinessSources } from "../src/experience/release-readiness/domain/release-readiness.js";
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
    "createNotificationsModule",
    "createContractEngineService",
    "createContractJourneyModule",
    "createEscrowService",
    "createEscrowPaymentExperienceModule",
    "createExecutionService",
    "createIssueService",
    "createTrustModule",
    "createTrustReputationExperienceModule",
    "createConversionModule",
    "createDiscoveryMatchingModule",
    "createProfessionalPassportModule",
    "createProfessionalSealsModule",
    "createLiveFrameExperienceModule",
    "createLiveTrustFrameModule",
    "createProviderCommandCenterModule",
    "createCustomerCommandCenterModule",
    "createPlatformControlTowerModule",
    "createMarketplaceIntelligenceModule",
    "createExecutiveCommandCenterModule",
    "createReleaseReadinessCenterModule",
  ].join("\n");

  const serverSource = [
    "registerHomeRoutes",
    "registerNotificationRoutes",
    "registerContractRoutes",
    "registerContractJourneyRoutes",
    "registerEscrowPaymentRoutes",
    "registerEvidenceRoutes",
    "registerExecutionExperienceRoutes",
    "registerEvidenceReadRoutes",
    "registerIssueRoutes",
    "registerDisputesReadRoutes",
    "registerTrustReputationExperienceRoutes",
    "registerConversionRoutes",
    "registerDiscoveryMatchingRoutes",
    "registerProfessionalPassportRoutes",
    "registerLiveFrameRoutes",
    "registerLiveTrustFrameRoutes",
    "registerProviderCommandCenterRoutes",
    "registerCustomerCommandCenterRoutes",
    "registerPlatformControlTowerRoutes",
    "registerMarketplaceIntelligenceRoutes",
    "registerExecutiveCommandCenterRoutes",
    "registerReleaseReadinessRoutes",
    "registerSecurityAuthRoutes",
    "requireAuthMiddleware",
    "createAuthenticateMiddleware",
    "registerAdminConsoleRoutes",
  ].join("\n");

  const packageSource =
    '"build"\n"lint:imports"\n"verify:x11"\n"verify:x12"\n"verify:x13"\n"verify:x14"\n"verify:x15"\n"verify:x16"';

  return {
    indexSource,
    serverSource,
    packageSource,
    existingPaths: new Set([
      "docs/experience/X1-Unified-Home-Experience.md",
      "docs/experience/X3-Contract-Journey-Experience.md",
      "docs/experience/X6-Escrow-Payment-Experience.md",
      "docs/experience/X7-Trust-Reputation-Experience.md",
      "docs/experience/X8-Discovery-Matching-Experience.md",
      "docs/experience/X9-Professional-Passport-Experience.md",
      "docs/experience/X10-Live-Trust-Frame-Experience.md",
      "docs/experience/X11-Provider-Command-Center.md",
      "docs/experience/X12-Customer-Command-Center.md",
      "docs/experience/X13-Platform-Control-Tower.md",
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X16-Executive-Command-Center.md",
      "docs/release/RC1-Readiness-Report.md",
      "docs/release/RC1-Architecture-Summary.md",
      "docs/release/RC1-Operational-Checklist.md",
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

function buildUnitSnapshot() {
  const releaseReadinessSnapshot = buildReleaseReadinessCenterSnapshot({
    sources: buildHealthySources(),
    generatedAt: FIXED_TIME,
  });
  const marketplaceSnapshot = buildMarketplaceIntelligenceSnapshot({
    raw: {
      analyticsSnapshot: ANALYTICS_SNAPSHOT,
      providers: PROVIDERS,
      actionCounts: ACTION_COUNTS,
      requests: REQUESTS,
    },
    generatedAt: FIXED_TIME,
  });
  const controlTowerSnapshot = buildPlatformControlTowerSnapshot({
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

  return buildExecutiveCommandCenterSnapshot({
    raw: {
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
    generatedAt: FIXED_TIME,
  });
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x16-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x16-customer-session",
});

async function seedX16Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x16@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x16@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X16 Executive Command Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds release readiness overview from X15 snapshot", () => {
      const releaseSnapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildHealthySources(),
        generatedAt: FIXED_TIME,
      });
      const overview = buildReleaseReadinessOverview(releaseSnapshot);

      assert.equal(overview.score, 100);
      assert.equal(overview.status, "ready");
      assert.equal(overview.readyAreas, 16);
      assert.equal(overview.blockerCount, 0);
    });

    it("builds marketplace overview from X14 snapshot", () => {
      const marketplaceSnapshot = buildMarketplaceIntelligenceSnapshot({
        raw: {
          analyticsSnapshot: ANALYTICS_SNAPSHOT,
          providers: PROVIDERS,
          actionCounts: ACTION_COUNTS,
          requests: REQUESTS,
        },
        generatedAt: FIXED_TIME,
      });
      const overview = buildMarketplaceOverview(marketplaceSnapshot);

      assert.ok(overview.healthScore >= 0);
      assert.equal(overview.openRequests, 4);
      assert.ok(overview.opportunityCount >= 0);
    });

    it("builds trust and financial overviews from control tower snapshot", () => {
      const controlTowerSnapshot = buildPlatformControlTowerSnapshot({
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

      const trust = buildTrustReputationOverview({ controlTower: controlTowerSnapshot });
      const financial = buildFinancialEscrowOverview({ controlTower: controlTowerSnapshot });

      assert.equal(trust.averageTrustScore, 72);
      assert.equal(trust.providersWithScores, 2);
      assert.equal(financial.currencyCode, "USD");
      assert.equal(financial.fundedMinor, 10000);
    });

    it("merges operational blockers, warnings, strengths, and actions", () => {
      const snapshot = buildUnitSnapshot();
      const releaseSnapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildHealthySources(),
        generatedAt: FIXED_TIME,
      });
      const marketplaceSnapshot = buildMarketplaceIntelligenceSnapshot({
        raw: {
          analyticsSnapshot: ANALYTICS_SNAPSHOT,
          providers: PROVIDERS,
          actionCounts: ACTION_COUNTS,
          requests: REQUESTS,
        },
        generatedAt: FIXED_TIME,
      });
      const controlTowerSnapshot = buildPlatformControlTowerSnapshot({
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

      const blockers = buildOperationalBlockers({
        releaseReadiness: releaseSnapshot,
        controlTower: controlTowerSnapshot,
        marketplace: marketplaceSnapshot,
      });
      const warnings = buildOperationalWarnings({
        releaseReadiness: releaseSnapshot,
        controlTower: controlTowerSnapshot,
        marketplace: marketplaceSnapshot,
      });
      const strengths = buildOperationalStrengths({
        releaseReadiness: releaseSnapshot,
        controlTower: controlTowerSnapshot,
        marketplace: marketplaceSnapshot,
      });
      const actions = deriveExecutiveRecommendedActions({
        releaseReadiness: releaseSnapshot,
        blockers,
        warnings,
        overview: snapshot.overview,
      });

      assert.ok(blockers.some((entry) => entry.code === "open-issues"));
      assert.ok(warnings.length >= 0);
      assert.ok(strengths.some((entry) => entry.code === "trust-strong"));
      assert.ok(actions.length > 0);
    });

    it("computes executive health score and status deterministically", () => {
      const score = computeExecutiveHealthScore({
        releaseScore: 100,
        marketplaceHealthScore: 70,
        averageTrustScore: 72,
        systemHealthStatus: "healthy",
      });

      assert.ok(score >= 80);
      assert.equal(deriveExecutiveStatus(score), "strong");
      assert.equal(deriveExecutiveStatus(60), "stable");
      assert.equal(deriveExecutiveStatus(40), "at_risk");
    });

    it("composes full executive command center view with snake_case fields", () => {
      const snapshot = buildUnitSnapshot();
      const center = buildExecutiveCommandCenter({ snapshot });
      const view = toExecutiveCommandCenterView(center);

      assert.equal(view.overview.headline, "Executive command center");
      assert.equal(view.release_readiness.score, 100);
      assert.equal(view.marketplace.open_requests, 4);
      assert.equal(view.trust.average_trust_score, 72);
      assert.equal(view.financial.currency_code, "USD");
      assert.ok(Array.isArray(view.blockers));
      assert.ok(Array.isArray(view.actions));
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
          `DELETE FROM identity.users WHERE email IN ('admin-x16@test.app13', 'customer-x16@test.app13')`
        );
        const admin = await seedX16Admin(db);
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

    it("loads executive command center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveCommandCenter } = createExecutiveCommandCenterModule(db);
      const view = await executiveCommandCenter.getExecutiveCommandCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "Executive command center");
      assert.ok(view.release_readiness.score >= 0);
      assert.ok(view.marketplace.health_score >= 0);
      assert.ok(view.trust.average_trust_score >= 0);
      assert.ok(view.financial.funded_minor >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveCommandCenter } = createExecutiveCommandCenterModule(db);

      const release = await executiveCommandCenter.getReleaseReadinessOverview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(release.summary.length > 0);

      const marketplace = await executiveCommandCenter.getMarketplaceOverview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(marketplace.summary.length > 0);

      const trust = await executiveCommandCenter.getTrustReputationOverview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(trust.summary.length > 0);

      const financial = await executiveCommandCenter.getFinancialOverview(ADMIN_AUTH(adminUserId));
      assert.ok(financial.summary.length > 0);

      const blockers = await executiveCommandCenter.getOperationalBlockers(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(blockers));

      const warnings = await executiveCommandCenter.getOperationalWarnings(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(warnings));

      const strengths = await executiveCommandCenter.getOperationalStrengths(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(strengths));

      const actions = await executiveCommandCenter.getRecommendedActions(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(actions));
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveCommandCenter } = createExecutiveCommandCenterModule(db);

      await assert.rejects(
        () => executiveCommandCenter.getExecutiveCommandCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers executive command center routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => ({
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
        }),
      };
      const { executiveCommandCenter } = createExecutiveCommandCenterModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x16");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutiveCommandCenterRoutes(app, executiveCommandCenter);

      for (const path of [
        "/executive-command-center",
        "/executive-command-center/release-readiness",
        "/executive-command-center/marketplace",
        "/executive-command-center/trust",
        "/executive-command-center/financial",
        "/executive-command-center/blockers",
        "/executive-command-center/warnings",
        "/executive-command-center/strengths",
        "/executive-command-center/actions",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
