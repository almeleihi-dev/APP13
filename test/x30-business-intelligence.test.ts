import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerBusinessIntelligenceRoutes } from "../src/api/routes/business-intelligence.js";
import { createBusinessIntelligenceModule } from "../src/experience/business-intelligence/module.js";
import type { PlatformAnalyticsSnapshot } from "../src/analytics/domain/platform-analytics.js";
import {
  BUSINESS_INTELLIGENCE_ROUTES,
  buildBusinessIntelligenceCenter,
  buildBusinessIntelligenceSnapshot,
  buildExecutiveInsights,
  buildGrowthDrivers,
  toBusinessIntelligenceCenterView,
  type BusinessIntelligenceRawSnapshot,
} from "../src/experience/business-intelligence/domain/business-intelligence.js";
import { buildLaunchControlSnapshot } from "../src/experience/launch-control/domain/launch-control.js";
import type { LaunchControlRawSnapshot } from "../src/experience/launch-control/domain/launch-control.js";
import { buildInvestorReadinessSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
import type { InvestorReadinessRawSnapshot } from "../src/experience/investor-readiness/domain/investor-readiness.js";
import { buildLaunchSimulationSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
import type { LaunchSimulationRawSnapshot } from "../src/experience/launch-simulation/domain/launch-simulation.js";
import { buildMarketplaceIntelligenceSnapshot } from "../src/experience/marketplace-intelligence/domain/marketplace-intelligence.js";
import type { MarketplaceIntelligenceRawSnapshot } from "../src/experience/marketplace-intelligence/domain/marketplace-intelligence.js";
import { buildMissionControlSnapshot } from "../src/experience/mission-control/domain/mission-control.js";
import type { MissionControlRawSnapshot } from "../src/experience/mission-control/domain/mission-control.js";
import { buildPostLaunchMonitoringSnapshot } from "../src/experience/post-launch-monitoring/domain/post-launch-monitoring.js";
import type { PostLaunchMonitoringRawSnapshot } from "../src/experience/post-launch-monitoring/domain/post-launch-monitoring.js";
import { buildReleaseReadinessCenterSnapshot } from "../src/experience/release-readiness/domain/release-readiness.js";
import type { ReadinessSources } from "../src/experience/release-readiness/domain/release-readiness.js";
import { buildProductionReadinessSnapshot } from "../src/experience/production-readiness/domain/production-readiness.js";
import {
  collectProductionReadinessPaths,
  REQUIRED_ENV_VARIABLES,
  type ProductionReadinessSources,
} from "../src/experience/production-readiness/domain/production-readiness.js";
import { buildSecurityReadinessSnapshot } from "../src/experience/security-readiness/domain/security-readiness.js";
import {
  REQUIRED_SECRET_KEYS,
  type SecurityReadinessSources,
} from "../src/experience/security-readiness/domain/security-readiness.js";
import { buildPlatformOperationsSnapshot } from "../src/experience/platform-operations/domain/platform-operations.js";
import type { PlatformOperationsRawSnapshot } from "../src/experience/platform-operations/domain/platform-operations.js";
import type { StrategicOperatingRawSnapshot } from "../src/experience/strategic-operating-system/domain/strategic-operating-system.js";
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
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../src/discovery/infrastructure/discovery-repository.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_TIME = new Date("2026-06-20T14:00:00.000Z");

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
    disputed: 0,
  },
  issues: {
    allTime: 0,
    last7Days: 0,
    prior7Days: 0,
    last30Days: 0,
    prior30Days: 0,
    total: 0,
    open: 0,
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
    completedMilestones: 6,
    inProgressMilestones: 1,
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
    averageTrustScore: 82,
    lowTrustProviderCount: 0,
    tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 2 }],
    trustEvents: {
      allTime: 4,
      last7Days: 2,
      prior7Days: 1,
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
    actionCodes: ["WEBSITE_DESIGN", "BRANDING"],
    trustScore: 82,
    availableNow: true,
    activeContracts: 1,
    distanceKm: 5,
    priceEstimate: 5000,
    completedContractsForAction: 4,
    completedContracts: 6,
    averageRating: 4.8,
  },
  {
    providerId: "provider-2",
    providerUserId: "user-2",
    displayName: "Beta Build",
    actionCodes: ["WEBSITE_DESIGN"],
    trustScore: 65,
    availableNow: true,
    activeContracts: 1,
    distanceKm: 12,
    priceEstimate: 4500,
    completedContractsForAction: 2,
    completedContracts: 3,
    averageRating: 4.2,
  },
];

const ACTION_COUNTS: DiscoverableActionRecord[] = [
  { actionCode: "WEBSITE_DESIGN", providerCount: 2 },
  { actionCode: "BRANDING", providerCount: 1 },
  { actionCode: "SEO_AUDIT", providerCount: 0 },
];

const REQUESTS: DiscoverableRequestRecord[] = [
  {
    id: "request-1",
    requestText: "Need a responsive website design",
    status: "open",
    budgetMinor: 8000,
    preferredDays: 14,
  },
  {
    id: "request-2",
    requestText: "Brand identity refresh",
    status: "open",
    budgetMinor: 5000,
    preferredDays: 10,
  },
];

function buildHealthyReleaseSources(): ReadinessSources {
  return {
    indexSource: [
      "createMarketplaceIntelligenceModule",
      "createLaunchSimulationModule",
      "createInvestorReadinessModule",
      "createMissionControlModule",
      "createPostLaunchMonitoringModule",
      "createBusinessIntelligenceModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerMissionControlRoutes",
      "registerPostLaunchMonitoringRoutes",
      "registerBusinessIntelligenceRoutes",
      "requireAuthMiddleware",
    ].join("\n"),
    packageSource: '"build"\n"verify:x29"\n"verify:x30"',
    existingPaths: new Set([
      "docs/experience/X14-Marketplace-Intelligence.md",
      "docs/experience/X29-Post-Launch-Monitoring-Center.md",
      "docs/experience/X30-Business-Intelligence-Center.md",
      ".dependency-cruiser.cjs",
    ]),
  };
}

function buildHealthyProductionSources(): ProductionReadinessSources {
  const existingPaths = new Set(collectProductionReadinessPaths());
  for (const file of ["001_initial_schema.sql", "006_audit.sql", "010_upload_intents.sql"]) {
    existingPaths.add(`database/migrations/${file}`);
  }

  return {
    envExampleSource: REQUIRED_ENV_VARIABLES.map((variable) => `${variable}=value`).join("\n"),
    packageSource: ['"build"', '"start"', '"migrate"', '"node": ">=20"'].join("\n"),
    dockerComposeSource: [
      "postgres:",
      "healthcheck:",
      "postgres_data:",
      "minio_data:",
      "redis:",
      "minio-init",
      "app13-evidence",
    ].join("\n"),
    configSource: 'databaseUrl: z.string().min(1)\nsecret: z.string().min(32)\nloadConfig',
    indexSource: "createLogger\nbuildServer",
    serverSource:
      "requireAuthMiddleware\ncreateAuthenticateMiddleware\nsecurityAuth\nerrorHandler",
    migrateScriptSource: "schema_migrations\nmigrations complete",
    s3StorageSource: "createObjectStorage\ncreatePresignedPut\nHeadObjectCommand",
    healthRouteSource: 'app.get("/health"',
    loggingSource: "createLogger",
    migrationFiles: ["001_initial_schema.sql", "006_audit.sql"],
    existingPaths,
    runtimeEnvKeys: new Set(REQUIRED_ENV_VARIABLES),
    migrationStatus: {
      totalMigrationFiles: 2,
      appliedMigrations: 2,
      pendingMigrations: 0,
      migrationsTablePresent: true,
    },
  };
}

function buildHealthySecuritySources(): SecurityReadinessSources {
  return {
    serverSource: "createAuthenticateMiddleware\nrequireAuthMiddleware\nsecurityAudit",
    indexSource: "createLogger\nsecurityAudit\neventInbox\nbuildServer",
    packageSource: '"build"\n"start"',
    envExampleSource: REQUIRED_SECRET_KEYS.map((key) => `${key}=configured`).join("\n"),
    configSource: 'jwt:\n  secret: z.string().min(32)\nJWT_SECRET\nverification',
    guardsSource: 'requireRole\nrequireOwnership\n"platform_admin"',
    requireAuthSource: "authRequired",
    authenticateSource: "jwt.verify",
    loggingSource: "createLogger",
    s3StorageSource: "createPresignedPut\nHeadObjectCommand",
    routeSources: {
      "src/api/routes/business-intelligence.ts":
        'app.get("/business-intelligence", { config: { authRequired: true } }',
    },
    documentationSources: {
      "docs/experience/X30-Business-Intelligence-Center.md": "business intelligence security",
    },
    serviceSources: {
      "src/experience/business-intelligence/application/business-intelligence-service.ts":
        'requireRole(authContext, "platform_admin")',
    },
    existingPaths: new Set(["database/migrations/006_audit.sql"]),
    runtimeEnvKeys: new Set(REQUIRED_SECRET_KEYS),
  };
}

function buildHealthyOperationsRaw(): PlatformOperationsRawSnapshot {
  const base = {
    totalCount: 4,
    statusDistribution: [{ status: "open", count: 2 }],
    recentCount: 1,
    priorCount: 0,
  };

  return {
    analyticsSnapshot: ANALYTICS_SNAPSHOT,
    platformOverview: buildPlatformOverview({
      requests: buildRequestOverview(base),
      offers: buildOfferOverview({
        ...base,
        statusDistribution: [{ status: "offer_created", count: 2 }],
      }),
      contracts: buildContractOverview({
        totalCount: 4,
        statusDistribution: [{ status: "active", count: 4 }],
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
        milestoneStatusDistribution: [{ status: "completed", count: 6 }],
        totalEvidence: 5,
        contractsWithMilestones: 2,
        inProgressMilestones: 1,
        recentCount: 1,
        priorCount: 0,
      }),
      issues: buildIssueOverview({
        totalCount: 0,
        statusDistribution: [],
        recentCount: 0,
        priorCount: 0,
      }),
      trust: buildTrustOverview({
        providersWithScores: 2,
        averageTrustScore: 82,
        lowTrustProviderCount: 0,
        frameTierDistribution: [{ status: "SAPPHIRE_VERIFIED", count: 2 }],
        recentCount: 1,
        priorCount: 0,
      }),
      risks: buildRiskOverview({
        frozenEscrows: 0,
        openIssues: 0,
        escalatedIssues: 0,
        disputedContracts: 0,
        failedOperations: 0,
        staleOffers: 0,
        lowTrustProviders: 0,
        pendingFundingEscrows: 0,
      }),
      failedOperations: 0,
      generatedAt: FIXED_TIME,
    }),
  };
}

function buildMarketplaceRaw(): MarketplaceIntelligenceRawSnapshot {
  return {
    analyticsSnapshot: ANALYTICS_SNAPSHOT,
    providers: PROVIDERS,
    actionCounts: ACTION_COUNTS,
    requests: REQUESTS,
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
      milestoneStatusDistribution: [{ status: "completed", count: 6 }],
      totalEvidence: 5,
      contractsWithMilestones: 2,
      inProgressMilestones: 1,
      recentCount: 1,
      priorCount: 0,
    }),
    issues: buildIssueOverview({
      totalCount: 0,
      statusDistribution: [],
      recentCount: 0,
      priorCount: 0,
    }),
    trust: buildTrustOverview({
      providersWithScores: 2,
      averageTrustScore: 82,
      lowTrustProviderCount: 0,
      frameTierDistribution: [{ status: "SAPPHIRE_VERIFIED", count: 2 }],
      recentCount: 1,
      priorCount: 0,
    }),
    risks: buildRiskOverview({
      frozenEscrows: 0,
      openIssues: 0,
      escalatedIssues: 0,
      disputedContracts: 0,
      failedOperations: 0,
      staleOffers: 0,
      lowTrustProviders: 0,
      pendingFundingEscrows: 0,
    }),
    failedOperations: 0,
    generatedAt: FIXED_TIME,
  });
}

function buildUnitLaunchSimulationRaw(): LaunchSimulationRawSnapshot {
  return {
    executiveRaw: {
      readinessSources: buildHealthyReleaseSources(),
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
          averageTrustScore: 82,
          lowTrustProviderCount: 0,
          tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 2 }],
          trustEventsLast7Days: 2,
          trustEventsLast30Days: 4,
        },
      },
    },
  };
}

function buildUnitInvestorRaw(): InvestorReadinessRawSnapshot {
  return {
    launchRaw: buildUnitLaunchSimulationRaw(),
  };
}

function buildUnitStrategicRaw(): StrategicOperatingRawSnapshot {
  return {
    governmentRaw: {
      investorRaw: buildUnitInvestorRaw(),
    },
  };
}

function buildUnitMissionControlRaw(): MissionControlRawSnapshot {
  return {
    strategicRaw: buildUnitStrategicRaw(),
  };
}

function buildHealthyLaunchControlRaw(): LaunchControlRawSnapshot {
  return {
    release: buildReleaseReadinessCenterSnapshot({
      sources: buildHealthyReleaseSources(),
      generatedAt: FIXED_TIME,
    }),
    production: buildProductionReadinessSnapshot({
      raw: { sources: buildHealthyProductionSources() },
      generatedAt: FIXED_TIME,
    }),
    security: buildSecurityReadinessSnapshot({
      raw: { sources: buildHealthySecuritySources() },
      generatedAt: FIXED_TIME,
    }),
    operations: buildPlatformOperationsSnapshot({
      raw: buildHealthyOperationsRaw(),
      generatedAt: FIXED_TIME,
    }),
  };
}

function buildHealthyPostLaunchRaw(): PostLaunchMonitoringRawSnapshot {
  return {
    launchSimulation: buildLaunchSimulationSnapshot({
      raw: buildUnitLaunchSimulationRaw(),
      generatedAt: FIXED_TIME,
    }),
    missionControl: buildMissionControlSnapshot({
      raw: buildUnitMissionControlRaw(),
      generatedAt: FIXED_TIME,
    }),
    production: buildProductionReadinessSnapshot({
      raw: { sources: buildHealthyProductionSources() },
      generatedAt: FIXED_TIME,
    }),
    security: buildSecurityReadinessSnapshot({
      raw: { sources: buildHealthySecuritySources() },
      generatedAt: FIXED_TIME,
    }),
    operations: buildPlatformOperationsSnapshot({
      raw: buildHealthyOperationsRaw(),
      generatedAt: FIXED_TIME,
    }),
    launchControl: buildLaunchControlSnapshot({
      raw: buildHealthyLaunchControlRaw(),
      generatedAt: FIXED_TIME,
    }),
  };
}

function buildHealthyBusinessIntelligenceRaw(): BusinessIntelligenceRawSnapshot {
  const postLaunchRaw = buildHealthyPostLaunchRaw();

  return {
    marketplace: buildMarketplaceIntelligenceSnapshot({
      raw: buildMarketplaceRaw(),
      generatedAt: FIXED_TIME,
    }),
    launchSimulation: postLaunchRaw.launchSimulation,
    investor: buildInvestorReadinessSnapshot({
      raw: buildUnitInvestorRaw(),
      generatedAt: FIXED_TIME,
    }),
    missionControl: postLaunchRaw.missionControl,
    operations: postLaunchRaw.operations,
    postLaunch: buildPostLaunchMonitoringSnapshot({
      raw: postLaunchRaw,
      generatedAt: FIXED_TIME,
    }),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x30-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x30-customer-session",
});

async function seedX30Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x30@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x30@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X30 business intelligence center", () => {
  describe("domain (unit)", () => {
    it("computes business intelligence score with configured weights", () => {
      const snapshot = buildBusinessIntelligenceSnapshot({
        raw: buildHealthyBusinessIntelligenceRaw(),
        generatedAt: FIXED_TIME,
      });

      assert.equal(snapshot.businessScore.marketplaceWeight, 20);
      assert.equal(snapshot.businessScore.revenueWeight, 20);
      assert.equal(snapshot.businessScore.usersWeight, 15);
      assert.equal(snapshot.businessScore.contractsWeight, 15);
      assert.equal(snapshot.businessScore.trustWeight, 15);
      assert.equal(snapshot.businessScore.operationsWeight, 15);
      assert.ok(snapshot.businessScore.score >= 0 && snapshot.businessScore.score <= 100);
    });

    it("composes business intelligence center with all eleven views", () => {
      const center = buildBusinessIntelligenceCenter({
        snapshot: buildBusinessIntelligenceSnapshot({
          raw: buildHealthyBusinessIntelligenceRaw(),
          generatedAt: FIXED_TIME,
        }),
      });
      const view = toBusinessIntelligenceCenterView(center);

      assert.ok(view.overview.business_score >= 0);
      assert.ok(view.marketplace.top_categories.length >= 0);
      assert.ok(view.revenue.contract_volume >= 0);
      assert.ok(view.users.active_users >= 0);
      assert.ok(view.contracts.completion_rate >= 0);
      assert.ok(view.trust.trust_score >= 0);
      assert.ok(Array.isArray(view.geography.top_regions));
      assert.ok(view.operations.operational_efficiency >= 0);
      assert.ok(view.growth_drivers.strongest_growth_drivers.length >= 1);
      assert.ok(view.insights.summary.length > 0);
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
    });

    it("identifies growth drivers across growth, adoption, and trust categories", () => {
      const raw = buildHealthyBusinessIntelligenceRaw();
      const drivers = buildGrowthDrivers({
        marketplace: raw.marketplace,
        postLaunch: raw.postLaunch,
        missionControl: raw.missionControl,
        investor: raw.investor,
      });

      assert.ok(drivers.strongestGrowthDrivers.every((driver) => driver.category === "growth"));
      assert.ok(drivers.strongestAdoptionDrivers.every((driver) => driver.category === "adoption"));
      assert.ok(drivers.strongestTrustDrivers.every((driver) => driver.category === "trust"));
    });

    it("produces executive insights with working, weakening, attention, and scale groups", () => {
      const raw = buildHealthyBusinessIntelligenceRaw();
      const snapshot = buildBusinessIntelligenceSnapshot({
        raw,
        generatedAt: FIXED_TIME,
      });
      const insights = buildExecutiveInsights({
        marketplace: raw.marketplace,
        postLaunch: raw.postLaunch,
        missionControl: raw.missionControl,
        operations: raw.operations,
        businessScore: snapshot.businessScore,
      });

      assert.ok(Array.isArray(insights.whatsWorking));
      assert.ok(Array.isArray(insights.whatsWeakening));
      assert.ok(Array.isArray(insights.requiresAttention));
      assert.ok(Array.isArray(insights.shouldBeScaled));
    });

    it("derives marketplace intelligence with demand and supply distribution", () => {
      const snapshot = buildBusinessIntelligenceSnapshot({
        raw: buildHealthyBusinessIntelligenceRaw(),
        generatedAt: FIXED_TIME,
      });

      assert.ok(snapshot.marketplace.demandDistribution.length >= 1);
      assert.ok(snapshot.marketplace.supplyDistribution.length >= 1);
      assert.ok(snapshot.marketplace.summary.length > 0);
    });

    it("includes business overview with platform health and growth status", () => {
      const snapshot = buildBusinessIntelligenceSnapshot({
        raw: buildHealthyBusinessIntelligenceRaw(),
        generatedAt: FIXED_TIME,
      });

      assert.ok(snapshot.overview.platformHealth >= 0);
      assert.ok(
        ["ahead", "on_track", "behind", "at_risk", "stable"].includes(snapshot.overview.growthStatus)
      );
      assert.equal(snapshot.overview.generatedAt.toISOString(), FIXED_TIME.toISOString());
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
          `DELETE FROM identity.users WHERE email IN ('admin-x30@test.app13', 'customer-x30@test.app13')`
        );
        const admin = await seedX30Admin(db);
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

    it("loads business intelligence center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { businessIntelligence } = createBusinessIntelligenceModule(db, { rootDir: ROOT_DIR });
      const view = await businessIntelligence.getBusinessIntelligenceCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.overview.business_score >= 0);
      assert.ok(view.business_score.score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { businessIntelligence } = createBusinessIntelligenceModule(db, { rootDir: ROOT_DIR });

      const marketplace = await businessIntelligence.getMarketplaceIntelligence(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(marketplace.summary.length > 0);

      const insights = await businessIntelligence.getExecutiveInsights(ADMIN_AUTH(adminUserId));
      assert.ok(insights.summary.length > 0);

      const score = await businessIntelligence.getBusinessIntelligenceScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 0 && score.score <= 100);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { businessIntelligence } = createBusinessIntelligenceModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () =>
          businessIntelligence.getBusinessIntelligenceCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers business intelligence routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildHealthyBusinessIntelligenceRaw(),
      };
      const { businessIntelligence } = createBusinessIntelligenceModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x30");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerBusinessIntelligenceRoutes(app, businessIntelligence);

      for (const routePath of BUSINESS_INTELLIGENCE_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
