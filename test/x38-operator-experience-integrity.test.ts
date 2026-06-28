import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOperatorExperienceIntegrityRoutes } from "../src/api/routes/operator-experience-integrity.js";
import { createOperatorExperienceIntegrityModule } from "../src/experience/operator-experience-integrity/module.js";
import { BROWSER_SURFACE_ROUTES } from "../src/browser-surface/domain/browser-surface.js";
import {
  OPERATOR_EXPERIENCE_INTEGRITY_ROUTES,
  WORKFLOW_PARITY_SPECS,
  buildAuthBoundaryAudit,
  buildDataModeAudit,
  buildOperatorExperienceIntegrityCenter,
  buildOperatorExperienceIntegritySnapshot,
  buildWorkflowParityAudit,
  collectOperatorExperienceIntegrityPaths,
  computeIntegrityScore,
  toOperatorExperienceIntegrityCenterView,
  type OperatorExperienceIntegrityRawSnapshot,
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
const FIXED_TIME = new Date("2026-06-20T20:00:00.000Z");

function buildIncompleteIntegritySources(): OperatorExperienceIntegritySources {
  return {
    serverSource: "",
    packageSource: "",
    browserSurfaceRouteSource: "",
    browserSurfaceSources: {},
    experienceRouteSources: {},
    existingPaths: new Set<string>(),
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
    packageSource: '"verify:x38"',
    browserSurfaceRouteSource,
    browserSurfaceSources: {
      "src/browser-surface/application/browser-surface-service.ts":
        "buildBrowserDemo\nMVP_PLATFORM_HOME_SOURCE",
      "src/browser-surface/domain/browser-hub-pages.ts":
        'data-mode="fixture"\nfixture disclosure',
    },
    experienceRouteSources,
    existingPaths: new Set(collectOperatorExperienceIntegrityPaths()),
  };
}

function buildUnitRawSnapshot(
  sources: OperatorExperienceIntegritySources = buildIncompleteIntegritySources()
): OperatorExperienceIntegrityRawSnapshot {
  return {
    navigationRaw: {
      browserCompletenessRaw: {
        uxReadinessRaw: {
          sources: {
            serverSource: sources.serverSource,
            packageSource: sources.packageSource,
            routeSources: {},
            browserSurfaceSources: sources.browserSurfaceSources,
            uiPageSources: {},
            existingPaths: sources.existingPaths,
          },
        },
        sources: {
          indexSource: "",
          serverSource: sources.serverSource,
          packageSource: sources.packageSource,
          existingPaths: sources.existingPaths,
          browserSurfaceRouteSource: sources.browserSurfaceRouteSource,
          browserStaticRouteSource: "",
          browserSurfaceSources: sources.browserSurfaceSources,
          uiPageSources: {},
          verifyScriptSources: {},
        },
      },
      sources: {
        serverSource: sources.serverSource,
        packageSource: sources.packageSource,
        browserSurfaceRouteSource: sources.browserSurfaceRouteSource,
        browserSurfaceSources: sources.browserSurfaceSources,
        experienceRouteSources: sources.experienceRouteSources,
        existingPaths: sources.existingPaths,
      },
    },
    sources,
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x38-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x38-customer-session",
});

async function seedX38Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x38@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x38@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X38 operator experience integrity center", () => {
  describe("domain (unit)", () => {
    it("audits public browser auth boundaries", () => {
      const sources = buildPartialIntegritySources();
      const authBoundaries = buildAuthBoundaryAudit(sources);

      assert.equal(authBoundaries.publicBrowserRoutes, BROWSER_SURFACE_ROUTES.length);
      assert.ok(authBoundaries.hybridConflicts.includes("/home"));
      assert.ok(authBoundaries.clarityScore >= 0);
    });

    it("detects fixture usage and disclosure signals", () => {
      const sources = buildPartialIntegritySources();
      const dataModes = buildDataModeAudit(sources);

      assert.ok(dataModes.fixtureRouteCount > 0);
      assert.ok(dataModes.disclosedRouteCount > 0);
      assert.ok(dataModes.disclosureScore > 0);
    });

    it("maps workflow parity between browser and JSON surfaces", () => {
      const sources = buildPartialIntegritySources();
      const workflowParity = buildWorkflowParityAudit(sources);

      assert.equal(workflowParity.entries.length, WORKFLOW_PARITY_SPECS.length);
      assert.ok(workflowParity.pairedCount >= 1);
      assert.ok(workflowParity.parityScore > 0);
    });

    it("computes integrity score and center view", () => {
      const raw = buildUnitRawSnapshot(buildPartialIntegritySources());
      const snapshot = buildOperatorExperienceIntegritySnapshot({
        raw,
        generatedAt: FIXED_TIME,
      });
      const center = buildOperatorExperienceIntegrityCenter({ snapshot });
      const view = toOperatorExperienceIntegrityCenterView(center);
      const score = computeIntegrityScore({
        authBoundaries: snapshot.authBoundaries,
        dataModes: snapshot.dataModes,
        workflowParity: snapshot.workflowParity,
        journeyIntegrity: snapshot.journeyIntegrity,
        xStackAlignment: snapshot.xStackAlignment,
      });

      assert.equal(view.overview.headline, "APP13 operator experience integrity center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.equal(score.score, snapshot.integrityScore.score);
      assert.ok(view.recommendations.immediate.length >= 1);
    });

    it("scores lower for incomplete integrity sources", () => {
      const partial = buildOperatorExperienceIntegritySnapshot({
        raw: buildUnitRawSnapshot(buildPartialIntegritySources()),
      });
      const incomplete = buildOperatorExperienceIntegritySnapshot({
        raw: buildUnitRawSnapshot(buildIncompleteIntegritySources()),
      });

      assert.ok(partial.integrityScore.score >= incomplete.integrityScore.score);
    });
  });

  describe("wiring (repository sources)", () => {
    it("loads real repository sources from the workspace", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createOperatorExperienceIntegrityModule/);
      assert.match(serverSource, /registerOperatorExperienceIntegrityRoutes/);
      assert.match(packageSource, /verify:x38/);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x38@test.app13', 'customer-x38@test.app13')`
        );
        const admin = await seedX38Admin(db);
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

    it("loads operator experience integrity center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorExperienceIntegrity } = createOperatorExperienceIntegrityModule(db, {
        rootDir: ROOT_DIR,
      });
      const view = await operatorExperienceIntegrity.getOperatorExperienceIntegrityCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.integrity_score.score >= 0);
      assert.equal(view.auth_boundaries.public_browser_routes, BROWSER_SURFACE_ROUTES.length);
      assert.ok(view.auth_boundaries.hybrid_conflicts.includes("/home"));
      assert.ok(view.workflow_parity.paired_count >= 7);
      assert.equal(view.x_stack_alignment.x31_browser_ready, true);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorExperienceIntegrity } = createOperatorExperienceIntegrityModule(db, {
        rootDir: ROOT_DIR,
      });

      const authBoundaries = await operatorExperienceIntegrity.getAuthBoundaryAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(authBoundaries.clarity_score >= 0);

      const dataModes = await operatorExperienceIntegrity.getDataModeAudit(ADMIN_AUTH(adminUserId));
      assert.ok(dataModes.fixture_route_count > 0);

      const workflowParity = await operatorExperienceIntegrity.getWorkflowParityAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(workflowParity.parity_score >= 70);

      const alignment = await operatorExperienceIntegrity.getXStackAlignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(alignment.x36_completeness_status, "browser_complete");

      const score = await operatorExperienceIntegrity.getIntegrityScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 0 && score.score <= 100);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorExperienceIntegrity } = createOperatorExperienceIntegrityModule(db, {
        rootDir: ROOT_DIR,
      });

      await assert.rejects(
        () =>
          operatorExperienceIntegrity.getOperatorExperienceIntegrityCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers operator experience integrity routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { operatorExperienceIntegrity } = createOperatorExperienceIntegrityModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x38");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOperatorExperienceIntegrityRoutes(app, operatorExperienceIntegrity);

      for (const route of OPERATOR_EXPERIENCE_INTEGRITY_ROUTES) {
        const response = await app.inject({ method: "GET", url: route });
        assert.equal(response.statusCode, 200, `expected 200 for ${route}`);
      }

      await app.close();
    });
  });
});
