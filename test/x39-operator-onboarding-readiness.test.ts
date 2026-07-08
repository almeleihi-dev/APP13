import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOperatorOnboardingReadinessRoutes } from "../src/api/routes/operator-onboarding-readiness.js";
import { createOperatorOnboardingReadinessModule } from "../src/experience/operator-onboarding-readiness/module.js";
import { BROWSER_SURFACE_ROUTES } from "../src/browser-surface/domain/browser-surface.js";
import {
  ONBOARDING_CHECKLIST_SPECS,
  ONBOARDING_VERIFICATION_CHAIN_SPECS,
  OPERATOR_ONBOARDING_READINESS_ROUTES,
  buildOnboardingVerificationChainAudit,
  buildOperatorOnboardingReadinessCenter,
  buildOperatorOnboardingReadinessSnapshot,
  collectOperatorOnboardingReadinessPaths,
  computeOnboardingReadinessScore,
  toOperatorOnboardingReadinessCenterView,
  type OperatorOnboardingReadinessRawSnapshot,
  type OperatorOnboardingReadinessSources,
} from "../src/experience/operator-onboarding-readiness/domain/operator-onboarding-readiness.js";
import {
  WORKFLOW_PARITY_SPECS,
  type OperatorExperienceIntegritySources,
} from "../src/experience/operator-experience-integrity/domain/operator-experience-integrity.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_TIME = new Date("2026-06-20T21:00:00.000Z");

function buildIncompleteOnboardingSources(): OperatorOnboardingReadinessSources {
  return {
    packageSource: "",
    existingPaths: new Set<string>(),
    verifyScriptSources: {},
  };
}

function buildPartialIntegritySources(): OperatorExperienceIntegritySources {
  const browserSurfaceRouteSource = BROWSER_SURFACE_ROUTES.map(
    (route) =>
      `app.get("${route}", { config: { ...PUBLIC_HTML_ROUTE_CONFIG, authenticate: false, authRequired: false } }`
  ).join("\n");

  const experienceRouteSources = Object.fromEntries(
    WORKFLOW_PARITY_SPECS.map((spec) => [
      `src/api/routes/${spec.jsonCounterpart.slice(1).split("/")[0]}.ts`,
      `app.get("${spec.jsonCounterpart}", { config: { authRequired: true } }`,
    ])
  );
  experienceRouteSources["src/api/routes/home.ts"] =
    'app.get("/home", { config: { authRequired: true } }';

  return {
    serverSource: WORKFLOW_PARITY_SPECS.map((spec) => spec.jsonCounterpart).join("\n"),
    packageSource: '"verify:x39"',
    browserSurfaceRouteSource,
    browserSurfaceSources: {
      "src/browser-surface/application/browser-surface-service.ts":
        "buildBrowserDemo\nMVP_PLATFORM_HOME_SOURCE",
      "src/browser-surface/domain/browser-hub-pages.ts":
        'data-mode="fixture"\nfixture disclosure',
    },
    experienceRouteSources,
    existingPaths: new Set(collectOperatorOnboardingReadinessPaths()),
  };
}

function buildPartialOnboardingSources(): OperatorOnboardingReadinessSources {
  const verifyScriptSources = Object.fromEntries(
    ONBOARDING_VERIFICATION_CHAIN_SPECS.map((spec) => [
      spec.script,
      `npm run ${spec.previous}`,
    ])
  );

  const packageSource = ONBOARDING_VERIFICATION_CHAIN_SPECS.map(
    (spec) => `"${spec.packageScript}": "bash ${spec.script}"`
  ).join("\n");

  return {
    packageSource,
    existingPaths: new Set([
      ...collectOperatorOnboardingReadinessPaths(),
      ...ONBOARDING_VERIFICATION_CHAIN_SPECS.map((spec) => spec.script),
    ]),
    verifyScriptSources,
  };
}

function buildUnitRawSnapshot(
  integritySources: OperatorExperienceIntegritySources = buildPartialIntegritySources(),
  onboardingSources: OperatorOnboardingReadinessSources = buildPartialOnboardingSources()
): OperatorOnboardingReadinessRawSnapshot {
  return {
    integrityRaw: {
      navigationRaw: {
        browserCompletenessRaw: {
          uxReadinessRaw: {
            sources: {
              serverSource: integritySources.serverSource,
              packageSource: integritySources.packageSource,
              routeSources: {},
              browserSurfaceSources: integritySources.browserSurfaceSources,
              uiPageSources: {},
              existingPaths: integritySources.existingPaths,
            },
          },
          sources: {
            indexSource: "",
            serverSource: integritySources.serverSource,
            packageSource: integritySources.packageSource,
            existingPaths: integritySources.existingPaths,
            browserSurfaceRouteSource: integritySources.browserSurfaceRouteSource,
            browserStaticRouteSource: "",
            browserSurfaceSources: integritySources.browserSurfaceSources,
            uiPageSources: {},
            verifyScriptSources: onboardingSources.verifyScriptSources,
          },
        },
        sources: {
          serverSource: integritySources.serverSource,
          packageSource: integritySources.packageSource,
          browserSurfaceRouteSource: integritySources.browserSurfaceRouteSource,
          browserSurfaceSources: integritySources.browserSurfaceSources,
          experienceRouteSources: integritySources.experienceRouteSources,
          existingPaths: integritySources.existingPaths,
        },
      },
      sources: integritySources,
    },
    sources: onboardingSources,
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x39-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x39-customer-session",
});

async function seedX39Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x39@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x39@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X39 operator onboarding readiness center", () => {
  describe("domain (unit)", () => {
    it("audits verify:x31 through verify:x39 chain", () => {
      const audit = buildOnboardingVerificationChainAudit(buildPartialOnboardingSources());

      assert.equal(audit.chains.length, ONBOARDING_VERIFICATION_CHAIN_SPECS.length);
      assert.ok(audit.chains.every((chain) => chain.executionStatus === "ready"));
    });

    it("flags broken verification chain for incomplete sources", () => {
      const audit = buildOnboardingVerificationChainAudit(buildIncompleteOnboardingSources());

      assert.ok(audit.chains.some((chain) => chain.executionStatus === "attention_required"));
    });

    it("builds blocker register from integrity signals", () => {
      const snapshot = buildOperatorOnboardingReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });

      assert.ok(snapshot.blockers.blockers.length >= 1);
      assert.ok(snapshot.blockers.blockers.some((blocker) => blocker.code.includes("hybrid")));
    });

    it("computes onboarding score and center view", () => {
      const raw = buildUnitRawSnapshot();
      const snapshot = buildOperatorOnboardingReadinessSnapshot({
        raw,
        generatedAt: FIXED_TIME,
      });
      const center = buildOperatorOnboardingReadinessCenter({ snapshot });
      const view = toOperatorOnboardingReadinessCenterView(center);
      const score = computeOnboardingReadinessScore({
        blockers: snapshot.blockers,
        warnings: snapshot.warnings,
        checklist: snapshot.checklist,
        xStackReadiness: snapshot.xStackReadiness,
        remediationQueue: snapshot.remediationQueue,
        verificationChain: snapshot.verificationChain,
      });

      assert.equal(view.overview.headline, "APP13 operator onboarding readiness center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.equal(score.score, snapshot.onboardingScore.score);
      assert.equal(view.checklist.total_count, ONBOARDING_CHECKLIST_SPECS.length);
      assert.ok(view.remediation_queue.entries.length >= 1);
    });

    it("scores lower for incomplete onboarding sources", () => {
      const partial = buildOperatorOnboardingReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
      });
      const incomplete = buildOperatorOnboardingReadinessSnapshot({
        raw: buildUnitRawSnapshot(buildPartialIntegritySources(), buildIncompleteOnboardingSources()),
      });

      assert.ok(partial.onboardingScore.score >= incomplete.onboardingScore.score);
    });
  });

  describe("wiring (repository sources)", () => {
    it("loads real repository sources from the workspace", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createOperatorOnboardingReadinessModule/);
      assert.match(serverSource, /registerOperatorOnboardingReadinessRoutes/);
      assert.match(packageSource, /verify:x39/);
      assert.equal(OPERATOR_ONBOARDING_READINESS_ROUTES.length, 10);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x39@test.app13', 'customer-x39@test.app13')`
        );
        const admin = await seedX39Admin(db);
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

    it("loads operator onboarding readiness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorOnboardingReadiness } = createOperatorOnboardingReadinessModule(db, {
        rootDir: ROOT_DIR,
      });
      const view = await operatorOnboardingReadiness.getOperatorOnboardingReadinessCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.onboarding_score.score >= 0);
      assert.equal(view.checklist.total_count, ONBOARDING_CHECKLIST_SPECS.length);
      assert.equal(view.verification_chain.chains.length, ONBOARDING_VERIFICATION_CHAIN_SPECS.length);
      assert.ok(view.x_stack_readiness.entries.length === 4);
      assert.ok(view.remediation_queue.entries.length >= 1);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorOnboardingReadiness } = createOperatorOnboardingReadinessModule(db, {
        rootDir: ROOT_DIR,
      });

      const blockers = await operatorOnboardingReadiness.getBlockerRegister(ADMIN_AUTH(adminUserId));
      assert.ok(blockers.blockers.length >= 0);

      const checklist = await operatorOnboardingReadiness.getOnboardingChecklist(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(checklist.total_count, ONBOARDING_CHECKLIST_SPECS.length);

      const verification = await operatorOnboardingReadiness.getVerificationChain(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(verification.chains.every((chain) => chain.exists));

      const score = await operatorOnboardingReadiness.getOnboardingScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 0 && score.score <= 100);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorOnboardingReadiness } = createOperatorOnboardingReadinessModule(db, {
        rootDir: ROOT_DIR,
      });

      await assert.rejects(
        () =>
          operatorOnboardingReadiness.getOperatorOnboardingReadinessCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers operator onboarding readiness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { operatorOnboardingReadiness } = createOperatorOnboardingReadinessModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x39");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOperatorOnboardingReadinessRoutes(app, operatorOnboardingReadiness);

      for (const route of OPERATOR_ONBOARDING_READINESS_ROUTES) {
        const response = await app.inject({ method: "GET", url: route });
        assert.equal(response.statusCode, 200, `expected 200 for ${route}`);
      }

      await app.close();
    });
  });
});
