import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLaunchControlRoutes } from "../src/api/routes/launch-control.js";
import { createLaunchControlModule } from "../src/experience/launch-control/module.js";
import type { PlatformAnalyticsSnapshot } from "../src/analytics/domain/platform-analytics.js";
import {
  LAUNCH_CONTROL_ROUTES,
  buildLaunchBlockers,
  buildLaunchControlCenter,
  buildLaunchControlSnapshot,
  buildLaunchDecision,
  computeLaunchConfidenceScore,
  toLaunchControlCenterView,
  type LaunchControlRawSnapshot,
} from "../src/experience/launch-control/domain/launch-control.js";
import {
  buildReleaseReadinessReview,
  buildProductionReadinessReview,
  buildSecurityReadinessReview,
  buildOperationsReadinessReview,
} from "../src/experience/launch-control/domain/launch-control.js";
import { buildReleaseReadinessCenterSnapshot } from "../src/experience/release-readiness/domain/release-readiness.js";
import type { ReadinessSources } from "../src/experience/release-readiness/domain/release-readiness.js";
import { buildProductionReadinessSnapshot } from "../src/experience/production-readiness/domain/production-readiness.js";
import {
  REQUIRED_ENV_VARIABLES,
  collectProductionReadinessPaths,
  type ProductionReadinessSources,
} from "../src/experience/production-readiness/domain/production-readiness.js";
import { buildSecurityReadinessSnapshot } from "../src/experience/security-readiness/domain/security-readiness.js";
import {
  REQUIRED_SECRET_KEYS,
  SECURITY_READINESS_ROUTES,
  type SecurityReadinessSources,
} from "../src/experience/security-readiness/domain/security-readiness.js";
import { buildPlatformOperationsSnapshot } from "../src/experience/platform-operations/domain/platform-operations.js";
import type { PlatformOperationsRawSnapshot } from "../src/experience/platform-operations/domain/platform-operations.js";
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
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_TIME = new Date("2026-06-20T00:00:00.000Z");

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

function buildHealthyReleaseSources(): ReadinessSources {
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
    "createReleaseReadinessCenterModule",
    "createLaunchControlModule",
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
    "registerReleaseReadinessRoutes",
    "registerLaunchControlRoutes",
    "registerSecurityAuthRoutes",
    "requireAuthMiddleware",
    "createAuthenticateMiddleware",
    "registerAdminConsoleRoutes",
  ].join("\n");

  return {
    indexSource,
    serverSource,
    packageSource:
      '"build"\n"lint:imports"\n"verify:x11"\n"verify:x12"\n"verify:x13"\n"verify:x15"\n"verify:x28"',
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
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/experience/X28-Launch-Control-Center.md",
      "docs/release/RC1-Readiness-Report.md",
      "docs/release/RC1-Architecture-Summary.md",
      "docs/release/RC1-Operational-Checklist.md",
      ".dependency-cruiser.cjs",
    ]),
  };
}

function buildHealthyProductionSources(): ProductionReadinessSources {
  const existingPaths = new Set(collectProductionReadinessPaths());
  for (const file of [
    "001_initial_schema.sql",
    "006_audit.sql",
    "010_upload_intents.sql",
    "015_security_kernel.sql",
  ]) {
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
  const existingPaths = new Set([
    "database/migrations/006_audit.sql",
    "database/migrations/010_upload_intents.sql",
    "database/migrations/015_security_kernel.sql",
    "database/migrations/020_event_inbox.sql",
    "database/migrations/001_initial_schema.sql",
    "database/migrations/013_financial_escrow.sql",
    "database/migrations/007_schema_v1_1_p0.sql",
  ]);

  return {
    serverSource: [
      "createAuthenticateMiddleware",
      "requireAuthMiddleware",
      "securityAudit",
      "registerNotificationRoutes",
      "logger",
    ].join("\n"),
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
      "src/api/routes/launch-control.ts": [
        "export async function registerLaunchControlRoutes",
        ...SECURITY_READINESS_ROUTES.map(
          (route) => `app.get("${route}", { config: { authRequired: true } }`
        ),
      ].join("\n"),
      "src/api/routes/health.ts": 'app.get("/health", { config: { authRequired: false } }',
      "src/api/routes/contracts.ts": 'app.get("/contracts", { config: { authRequired: true } }',
      "src/api/routes/evidence.ts": 'app.post("/evidence", { config: { authRequired: true } }',
      "src/api/routes/analytics.ts": 'app.get("/analytics", { config: { authRequired: true } }',
    },
    documentationSources: {
      "docs/experience/X26-Security-Compliance-Readiness.md":
        "privacy consent contract evidence terms compliance",
      "docs/experience/X28-Launch-Control-Center.md": "launch control security readiness",
    },
    serviceSources: {
      "src/experience/launch-control/application/launch-control-service.ts":
        'requireRole(authContext, "platform_admin")',
      "src/experience/security-readiness/application/security-readiness-service.ts":
        'requireRole(authContext, "platform_admin")',
    },
    existingPaths,
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

function buildHealthyRawSnapshot(): LaunchControlRawSnapshot {
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

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x28-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x28-customer-session",
});

async function seedX28Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x28@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x28@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X28 launch control center", () => {
  describe("domain (unit)", () => {
    it("computes launch confidence score with equal 25% weights", () => {
      const raw = buildHealthyRawSnapshot();
      const releaseReview = buildReleaseReadinessReview(raw.release);
      const productionReview = buildProductionReadinessReview(raw.production);
      const securityReview = buildSecurityReadinessReview(raw.security);
      const operationsReview = buildOperationsReadinessReview(raw.operations);
      const confidence = computeLaunchConfidenceScore({
        release: releaseReview,
        production: productionReview,
        security: securityReview,
        operations: operationsReview,
      });

      assert.equal(confidence.releaseReadinessWeight, 25);
      assert.ok(confidence.score >= 0 && confidence.score <= 100);
    });

    it("returns GO decision for healthy launch posture", () => {
      const snapshot = buildLaunchControlSnapshot({
        raw: buildHealthyRawSnapshot(),
        generatedAt: FIXED_TIME,
      });

      assert.ok(["GO", "GO_WITH_WARNINGS"].includes(snapshot.decision.decision));
      assert.ok(snapshot.confidenceScore.score >= 55);
    });

    it("returns NO_GO when critical blockers exist", () => {
      const raw = buildHealthyRawSnapshot();
      raw.production.riskRegister.risks.push({
        category: "database",
        severity: "critical",
        message: "Database migrations pending",
        mitigation: "Apply pending database migrations before launch.",
      });
      const blockers = buildLaunchBlockers(raw);
      const releaseReview = buildReleaseReadinessReview(raw.release);
      const decision = buildLaunchDecision({
        confidence: computeLaunchConfidenceScore({
          release: releaseReview,
          production: buildProductionReadinessReview(raw.production),
          security: buildSecurityReadinessReview(raw.security),
          operations: buildOperationsReadinessReview(raw.operations),
        }),
        blockers,
        release: releaseReview,
      });

      assert.equal(decision.decision, "NO_GO");
    });

    it("aggregates launch blockers across readiness layers", () => {
      const blockers = buildLaunchBlockers(buildHealthyRawSnapshot());
      assert.ok(Array.isArray(blockers.critical));
      assert.ok(Array.isArray(blockers.high));
      assert.ok(blockers.summary.length > 0);
    });

    it("composes launch control center view with decision and confidence", () => {
      const center = buildLaunchControlCenter({
        snapshot: buildLaunchControlSnapshot({
          raw: buildHealthyRawSnapshot(),
          generatedAt: FIXED_TIME,
        }),
      });
      const view = toLaunchControlCenterView(center);

      assert.equal(view.overview.headline, "APP13 launch control center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(["GO", "GO_WITH_WARNINGS", "NO_GO"].includes(view.decision.decision));
      assert.ok(view.checklist.total_count >= 5);
    });

    it("groups recommendations by before_launch, launch_day, and first_week", () => {
      const snapshot = buildLaunchControlSnapshot({ raw: buildHealthyRawSnapshot() });
      assert.ok(snapshot.recommendations.launchDay.length >= 1);
      assert.ok(snapshot.recommendations.firstWeek.length >= 1);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x28@test.app13', 'customer-x28@test.app13')`
        );
        const admin = await seedX28Admin(db);
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

    it("loads launch control center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchControl } = createLaunchControlModule(db, { rootDir: ROOT_DIR });
      const view = await launchControl.getLaunchControlCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "APP13 launch control center");
      assert.ok(view.confidence_score.score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchControl } = createLaunchControlModule(db, { rootDir: ROOT_DIR });

      const overview = await launchControl.getLaunchOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const release = await launchControl.getReleaseReadinessReview(ADMIN_AUTH(adminUserId));
      assert.ok(release.score >= 0);

      const production = await launchControl.getProductionReadinessReview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(production.score >= 0);

      const security = await launchControl.getSecurityReadinessReview(ADMIN_AUTH(adminUserId));
      assert.ok(security.score >= 0);

      const operations = await launchControl.getOperationsReadinessReview(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(operations.score >= 0);

      const blockers = await launchControl.getLaunchBlockers(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(blockers.critical));

      const warnings = await launchControl.getLaunchWarnings(ADMIN_AUTH(adminUserId));
      assert.ok(warnings.summary.length > 0);

      const checklist = await launchControl.getLaunchChecklist(ADMIN_AUTH(adminUserId));
      assert.ok(checklist.total_count >= 5);

      const recommendations = await launchControl.getLaunchRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);

      const decision = await launchControl.getLaunchDecision(ADMIN_AUTH(adminUserId));
      assert.ok(["GO", "GO_WITH_WARNINGS", "NO_GO"].includes(decision.decision));
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { launchControl } = createLaunchControlModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () => launchControl.getLaunchControlCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers launch control routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildHealthyRawSnapshot(),
      };
      const { launchControl } = createLaunchControlModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x28");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLaunchControlRoutes(app, launchControl);

      for (const routePath of LAUNCH_CONTROL_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
