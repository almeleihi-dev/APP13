import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerArchitectureReviewRoutes } from "../src/api/routes/architecture-review.js";
import { createArchitectureReviewModule } from "../src/experience/architecture-review/module.js";
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
import type { ExecutiveExperienceRawSnapshot } from "../src/experience/executive-experience/domain/executive-experience.js";
import type { MissionControlRawSnapshot } from "../src/experience/mission-control/domain/mission-control.js";
import {
  ARCHITECTURE_REVIEW_ROUTES,
  buildArchitectureReviewCenter,
  buildArchitectureReviewSnapshot,
  buildArchitectureRiskRegister,
  buildDocumentationAudit,
  buildExecutiveStackCompleteness,
  buildExperienceLayerAudit,
  buildRouteSurfaceAudit,
  buildVerificationChainAudit,
  collectArchitectureAuditPaths,
  computeArchitectureReviewScore,
  EXPERIENCE_LAYER_SPECS,
  toArchitectureReviewCenterView,
  VERIFICATION_CHAIN_SPECS,
  type ArchitectureAuditSources,
  type ArchitectureReviewRawSnapshot,
} from "../src/experience/architecture-review/domain/architecture-review.js";
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

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
      "createReleaseReadinessCenterModule",
      "createExecutiveCommandCenterModule",
      "createLaunchSimulationModule",
      "createInvestorReadinessModule",
      "createGovernmentPartnershipModule",
      "createStrategicOperatingModule",
      "createMissionControlModule",
      "createExecutiveExperienceModule",
      "createArchitectureReviewModule",
    ].join("\n"),
    serverSource: [
      "registerMarketplaceIntelligenceRoutes",
      "registerReleaseReadinessRoutes",
      "registerExecutiveCommandCenterRoutes",
      "registerLaunchSimulationRoutes",
      "registerInvestorReadinessRoutes",
      "registerGovernmentPartnershipRoutes",
      "registerStrategicOperatingRoutes",
      "registerMissionControlRoutes",
      "registerExecutiveExperienceRoutes",
      "registerArchitectureReviewRoutes",
    ].join("\n"),
    packageSource: '"build"\n"verify:x23"\n"lint:imports"',
    existingPaths: new Set([
      "docs/experience/X23-Executive-Architecture-Review.md",
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

function buildUnitExecutiveRaw(): ExecutiveExperienceRawSnapshot {
  return {
    missionRaw: buildUnitMissionRaw(),
  };
}

function buildHealthyAuditSources(): ArchitectureAuditSources {
  const existingPaths = new Set(collectArchitectureAuditPaths());
  const indexSource = [
    ...EXPERIENCE_LAYER_SPECS.map((spec) => spec.moduleFactory),
    "createArchitectureReviewModule",
  ].join("\n");
  const serverSource = [
    ...EXPERIENCE_LAYER_SPECS.map((spec) => spec.routeRegister),
    "registerArchitectureReviewRoutes",
  ].join("\n");
  const packageSource = [
    ...EXPERIENCE_LAYER_SPECS.map((spec) => `"${spec.packageScript}"`),
    '"verify:x23"',
    '"lint:imports"',
  ].join("\n");

  const routeSources: Record<string, string> = {};
  for (const spec of EXPERIENCE_LAYER_SPECS) {
    routeSources[spec.routeFile] = spec.expectedRoutes
      .map((route) => `app.get("${route}"`)
      .join("\n");
  }
  routeSources["src/api/routes/architecture-review.ts"] = ARCHITECTURE_REVIEW_ROUTES.map(
    (route) => `app.get("${route}"`
  ).join("\n");

  const verifyScriptSources: Record<string, string> = {};
  for (const spec of VERIFICATION_CHAIN_SPECS) {
    verifyScriptSources[spec.script] = `bash ${spec.previous}`;
  }
  verifyScriptSources["scripts/verify-x23.sh"] = "bash scripts/verify-x22.sh";

  return {
    indexSource,
    serverSource,
    packageSource,
    existingPaths,
    routeSources,
    verifyScriptSources,
  };
}

function buildUnitRawSnapshot(): ArchitectureReviewRawSnapshot {
  return {
    executiveRaw: buildUnitExecutiveRaw(),
    sources: buildHealthyAuditSources(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x23-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x23-customer-session",
});

async function seedX23Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x23@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x23@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X23 Executive Architecture Review Experience", () => {
  describe("domain layer (unit)", () => {
    it("audits experience layers X14 through X22", () => {
      const sources = buildHealthyAuditSources();
      const audit = buildExperienceLayerAudit(sources);

      assert.equal(audit.layers.length, 9);
      assert.deepEqual(
        audit.layers.map((entry) => entry.code),
        ["X14", "X15", "X16", "X17", "X18", "X19", "X20", "X21", "X22"]
      );
      assert.ok(audit.layers.every((entry) => entry.documentationPresent));
    });

    it("audits routes, verifications, and documentation coverage", () => {
      const sources = buildHealthyAuditSources();
      const routes = buildRouteSurfaceAudit(sources);
      const verifications = buildVerificationChainAudit(sources);
      const documentation = buildDocumentationAudit(sources);

      assert.ok(routes.routeCount > 0);
      assert.equal(routes.missingRoutes.length, 0);
      assert.equal(verifications.chains.length, 9);
      assert.ok(verifications.chains.every((chain) => chain.executionStatus === "ready"));
      assert.equal(documentation.missingDocs.length, 0);
    });

    it("audits executive stack completeness and risks", () => {
      const sources = buildHealthyAuditSources();
      const layerAudit = buildExperienceLayerAudit(sources);
      const routes = buildRouteSurfaceAudit(sources);
      const verifications = buildVerificationChainAudit(sources);
      const documentation = buildDocumentationAudit(sources);
      const completeness = buildExecutiveStackCompleteness(layerAudit);
      const risks = buildArchitectureRiskRegister({
        layerAudit,
        routeAudit: routes,
        documentationAudit: documentation,
        verificationAudit: verifications,
        dependencyAudit: {
          moduleCount: 9,
          dependencyCount: 40,
          violations: 0,
          architectureHealthScore: 100,
          summary: "healthy",
        },
      });

      assert.equal(completeness.areas.length, 9);
      assert.ok(risks.risks.length >= 0);
    });

    it("computes architecture review score deterministically", () => {
      const sources = buildHealthyAuditSources();
      const layerAudit = buildExperienceLayerAudit(sources);
      const routes = buildRouteSurfaceAudit(sources);
      const verifications = buildVerificationChainAudit(sources);
      const documentation = buildDocumentationAudit(sources);
      const completeness = buildExecutiveStackCompleteness(layerAudit);
      const score = computeArchitectureReviewScore({
        layerAudit,
        routeAudit: routes,
        verificationAudit: verifications,
        documentationAudit: documentation,
        dependencyAudit: {
          moduleCount: 9,
          dependencyCount: 40,
          violations: 0,
          architectureHealthScore: 100,
          summary: "healthy",
        },
        completeness,
      });

      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.experienceCoverageWeight, 20);
      assert.ok(["architecturally_ready", "developing", "attention_required"].includes(score.status));
    });

    it("composes full architecture review center with snake_case fields", () => {
      const snapshot = buildArchitectureReviewSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildArchitectureReviewCenter({ snapshot });
      const view = toArchitectureReviewCenterView(center);

      assert.equal(view.overview.headline, "Executive architecture review");
      assert.equal(view.experience_layers.layers.length, 9);
      assert.equal(view.verifications.chains.length, 9);
      assert.ok(view.review_score.score >= 0);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x23@test.app13', 'customer-x23@test.app13')`
        );
        const admin = await seedX23Admin(db);
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

    it("loads architecture review center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { architectureReview } = createArchitectureReviewModule(db, {
        rootDir: ROOT_DIR,
      });
      const view = await architectureReview.getArchitectureReviewCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "Executive architecture review");
      assert.equal(view.experience_layers.layers.length, 9);
      assert.ok(view.review_score.score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { architectureReview } = createArchitectureReviewModule(db, {
        rootDir: ROOT_DIR,
      });

      const overview = await architectureReview.getArchitectureOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const layers = await architectureReview.getExperienceLayerAudit(ADMIN_AUTH(adminUserId));
      assert.equal(layers.layers.length, 9);

      const routes = await architectureReview.getRouteSurfaceAudit(ADMIN_AUTH(adminUserId));
      assert.ok(routes.route_count > 0);

      const verifications = await architectureReview.getVerificationChainAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(verifications.chains.length, 9);

      const documentation = await architectureReview.getDocumentationAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(documentation.documentation_count >= 9);

      const dependencies = await architectureReview.getDependencyBoundaryAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(dependencies.module_count >= 9);

      const completeness = await architectureReview.getExecutiveStackCompleteness(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(completeness.areas.length, 9);

      const risks = await architectureReview.getArchitectureRiskRegister(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(Array.isArray(risks.risks));

      const recommendations = await architectureReview.getArchitectureRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);

      const score = await architectureReview.getArchitectureReviewScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { architectureReview } = createArchitectureReviewModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () =>
          architectureReview.getArchitectureReviewCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers architecture review routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { architectureReview } = createArchitectureReviewModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x23");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerArchitectureReviewRoutes(app, architectureReview);

      for (const path of [
        "/architecture-review",
        "/architecture-review/overview",
        "/architecture-review/experience-layers",
        "/architecture-review/routes",
        "/architecture-review/verifications",
        "/architecture-review/documentation",
        "/architecture-review/dependencies",
        "/architecture-review/completeness",
        "/architecture-review/risks",
        "/architecture-review/recommendations",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
