import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOperatorSurfaceNavigationRoutes } from "../src/api/routes/operator-surface-navigation.js";
import { createOperatorSurfaceNavigationModule } from "../src/experience/operator-surface-navigation/module.js";
import { BROWSER_SURFACE_ROUTES } from "../src/browser-surface/domain/browser-surface.js";
import {
  OPERATOR_JOURNEY_SPECS,
  OPERATOR_JSON_CENTER_SPECS,
  OPERATOR_SURFACE_NAVIGATION_ROUTES,
  buildCrossLinkAudit,
  buildOperatorJourneyAudit,
  buildOperatorSurfaceNavigationCenter,
  buildOperatorSurfaceNavigationSnapshot,
  buildOrphanCenterAudit,
  buildSurfaceMap,
  collectOperatorSurfaceNavigationPaths,
  computeNavigationScore,
  toOperatorSurfaceNavigationCenterView,
  type OperatorSurfaceNavigationRawSnapshot,
  type OperatorSurfaceNavigationSources,
} from "../src/experience/operator-surface-navigation/domain/operator-surface-navigation.js";
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
const FIXED_TIME = new Date("2026-06-20T18:00:00.000Z");

function buildIncompleteNavigationSources(): OperatorSurfaceNavigationSources {
  return {
    serverSource: "",
    packageSource: "",
    browserSurfaceRouteSource: 'app.get("/operator/dashboard"',
    browserSurfaceSources: {},
    experienceRouteSources: {},
    existingPaths: new Set<string>(),
  };
}

function buildPartialNavigationSources(): OperatorSurfaceNavigationSources {
  const experienceRouteSources = Object.fromEntries(
    OPERATOR_JSON_CENTER_SPECS.map((center) => [
      `src/api/routes/${center.baseRoute.slice(1)}.ts`,
      `app.get("${center.baseRoute}"`,
    ])
  );

  const browserSurfaceRouteSource = [
    'app.get("/operator/dashboard"',
    'app.get("/browse"',
    ...BROWSER_SURFACE_ROUTES.map((route) => `app.get("${route}"`),
  ].join("\n");

  return {
    serverSource: OPERATOR_JSON_CENTER_SPECS.map((center) => center.baseRoute).join("\n"),
    packageSource: '"verify:x37"',
    browserSurfaceRouteSource,
    browserSurfaceSources: {
      "src/browser-surface/domain/browser-surface.ts":
        'href="/executive-ux-readiness"\nhref="/business-intelligence"',
    },
    experienceRouteSources,
    existingPaths: new Set(collectOperatorSurfaceNavigationPaths()),
  };
}

function buildUnitRawSnapshot(
  sources: OperatorSurfaceNavigationSources = buildIncompleteNavigationSources()
): OperatorSurfaceNavigationRawSnapshot {
  return {
    browserCompletenessRaw: {
      uxReadinessRaw: { sources: { serverSource: "", packageSource: "", routeSources: {}, browserSurfaceSources: {}, uiPageSources: {}, existingPaths: new Set() } },
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
    sources,
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x37-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x37-customer-session",
});

async function seedX37Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x37@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x37@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X37 operator surface navigation center", () => {
  describe("domain (unit)", () => {
    it("maps operator JSON centers and browser anchors", () => {
      const sources = buildPartialNavigationSources();
      const surfaceMap = buildSurfaceMap(sources);

      assert.equal(surfaceMap.jsonCenterCount, OPERATOR_JSON_CENTER_SPECS.length);
      assert.ok(surfaceMap.browserRouteCount >= 1);
      assert.ok(surfaceMap.entries.every((entry) => entry.reachable));
    });

    it("detects orphan JSON centers without browser cross-links", () => {
      const sources = buildPartialNavigationSources();
      const crossLinks = buildCrossLinkAudit(sources);
      const orphanCenters = buildOrphanCenterAudit(crossLinks);

      assert.ok(crossLinks.entries.filter((entry) => entry.status !== "linked").length > 0);
      assert.ok(orphanCenters.orphans.some((center) => center.code === "X36"));
      assert.ok(crossLinks.entries.some((entry) => entry.status === "linked"));
    });

    it("audits operator journey reachability", () => {
      const sources = buildPartialNavigationSources();
      const journeys = buildOperatorJourneyAudit(sources);

      assert.equal(journeys.journeys.length, OPERATOR_JOURNEY_SPECS.length);
      assert.ok(journeys.readyCount >= 1);
      assert.ok(journeys.journeyCompletenessScore > 0);
    });

    it("computes navigation score and center view for incomplete sources", () => {
      const raw = buildUnitRawSnapshot();
      const snapshot = buildOperatorSurfaceNavigationSnapshot({
        raw,
        generatedAt: FIXED_TIME,
      });
      const center = buildOperatorSurfaceNavigationCenter({ snapshot });
      const view = toOperatorSurfaceNavigationCenterView(center);

      assert.equal(view.overview.headline, "APP13 operator surface navigation center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(view.recommendations.immediate.length >= 1);
      assert.ok(view.navigation_score.score >= 0 && view.navigation_score.score <= 100);
    });

    it("scores higher when journeys and cross-links improve", () => {
      const partial = buildPartialNavigationSources();
      const partialSnapshot = buildOperatorSurfaceNavigationSnapshot({
        raw: buildUnitRawSnapshot(partial),
      });
      const incompleteSnapshot = buildOperatorSurfaceNavigationSnapshot({
        raw: buildUnitRawSnapshot(buildIncompleteNavigationSources()),
      });

      assert.ok(
        partialSnapshot.navigationScore.score >= incompleteSnapshot.navigationScore.score
      );
    });
  });

  describe("wiring (repository sources)", () => {
    it("loads real repository sources from the workspace", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createOperatorSurfaceNavigationModule/);
      assert.match(serverSource, /registerOperatorSurfaceNavigationRoutes/);
      assert.match(packageSource, /verify:x37/);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x37@test.app13', 'customer-x37@test.app13')`
        );
        const admin = await seedX37Admin(db);
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

    it("loads operator surface navigation center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorSurfaceNavigation } = createOperatorSurfaceNavigationModule(db, {
        rootDir: ROOT_DIR,
      });
      const view = await operatorSurfaceNavigation.getOperatorSurfaceNavigationCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.navigation_score.score >= 0);
      assert.equal(view.journeys.ready_count, OPERATOR_JOURNEY_SPECS.length);
      assert.ok(view.orphan_centers.orphans.length >= 1);
      assert.equal(view.x_stack_alignment.x31_browser_ready, true);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorSurfaceNavigation } = createOperatorSurfaceNavigationModule(db, {
        rootDir: ROOT_DIR,
      });

      const crossLinks = await operatorSurfaceNavigation.getCrossLinkAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(crossLinks.linked_count >= 1);
      assert.ok(crossLinks.orphan_count >= 1);

      const journeys = await operatorSurfaceNavigation.getOperatorJourneyAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(journeys.journey_completeness_score, 100);

      const alignment = await operatorSurfaceNavigation.getXStackAlignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(alignment.x36_status, "browser_complete");

      const score = await operatorSurfaceNavigation.getNavigationScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 40 && score.score <= 100);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { operatorSurfaceNavigation } = createOperatorSurfaceNavigationModule(db, {
        rootDir: ROOT_DIR,
      });

      await assert.rejects(
        () =>
          operatorSurfaceNavigation.getOperatorSurfaceNavigationCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers operator surface navigation routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { operatorSurfaceNavigation } = createOperatorSurfaceNavigationModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x37");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOperatorSurfaceNavigationRoutes(app, operatorSurfaceNavigation);

      for (const route of OPERATOR_SURFACE_NAVIGATION_ROUTES) {
        const response = await app.inject({ method: "GET", url: route });
        assert.equal(response.statusCode, 200, `expected 200 for ${route}`);
      }

      await app.close();
    });
  });
});
