import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutiveUxReadinessRoutes } from "../src/api/routes/executive-ux-readiness.js";
import { createExecutiveUxReadinessModule } from "../src/experience/executive-ux-readiness/module.js";
import {
  EXECUTIVE_UX_READINESS_ROUTES,
  UI_PAGE_ENTRY_CANDIDATES,
  buildEntryPointAudit,
  buildExecutiveUxReadinessCenter,
  buildExecutiveUxReadinessSnapshot,
  buildReadinessClassification,
  buildRouteBrowserAudit,
  buildSurfaceDetection,
  buildUxRecommendations,
  collectExecutiveUxReadinessPaths,
  computeUxReadinessScore,
  toExecutiveUxReadinessCenterView,
  type ExecutiveUxReadinessRawSnapshot,
  type ExecutiveUxReadinessSources,
} from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
import { buildParsedRouteRegistry } from "../src/experience/api-audit/domain/api-audit.js";
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
const FIXED_TIME = new Date("2026-06-19T22:00:00.000Z");

function buildApiOnlyRouteSources(): Record<string, string> {
  const operatorRoutes = [
    "/executive-ux-readiness",
    "/executive-ux-readiness/overview",
    "/api-audit",
    "/business-intelligence",
    "/mission-control",
    "/launch-control",
    "/post-launch-monitoring",
  ];

  return {
    "src/api/routes/health.ts": [
      "export async function registerHealthRoutes",
      'app.get("/health", { config: { authRequired: false } }',
    ].join("\n"),
    "src/api/routes/home.ts": [
      "export async function registerHomeRoutes",
      'app.get("/home", { config: { authRequired: true } }',
      'app.get("/home/customer", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/executive-ux-readiness.ts": [
      "export async function registerExecutiveUxReadinessRoutes",
      ...EXECUTIVE_UX_READINESS_ROUTES.map(
        (route) => `app.get("${route}", { config: { authRequired: true } }`
      ),
    ].join("\n"),
    "src/api/routes/business-intelligence.ts": [
      "export async function registerBusinessIntelligenceRoutes",
      'app.get("/business-intelligence", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/api-audit.ts": [
      "export async function registerApiAuditRoutes",
      'app.get("/api-audit", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/mission-control.ts": [
      "export async function registerMissionControlRoutes",
      'app.get("/mission-control", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/launch-control.ts": [
      "export async function registerLaunchControlRoutes",
      'app.get("/launch-control", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/post-launch-monitoring.ts": [
      "export async function registerPostLaunchMonitoringRoutes",
      'app.get("/post-launch-monitoring", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/contracts.ts": [
      "export async function registerContractRoutes",
      'app.get("/contracts", { config: { authRequired: true } }',
      'app.post("/contracts", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/discovery.ts": [
      "export async function registerDiscoveryRoutes",
      'app.get("/discovery", { config: { authRequired: true } }',
    ].join("\n"),
    ...Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => [
        `src/api/routes/generated-${index}.ts`,
        `export async function registerGenerated${index}Routes\napp.get("/generated/${index}", { config: { authRequired: true } }`,
      ])
    ),
    ...Object.fromEntries(
      operatorRoutes.map((route, index) => [
        `src/api/routes/operator-${index}.ts`,
        `export async function registerOperator${index}Routes\napp.get("${route}", { config: { authRequired: true } }`,
      ])
    ),
  };
}

function buildApiOnlyUiPageSources(): Record<string, string> {
  return Object.fromEntries(
    UI_PAGE_ENTRY_CANDIDATES.map((candidate) => [
      `src/ui/pages/${candidate.pageModule}`,
      `export function ${candidate.renderFunction}(model: unknown): string { return "<html></html>"; }`,
    ])
  );
}

function buildApiOnlySources(): ExecutiveUxReadinessSources {
  return {
    serverSource: [
      "await registerHealthRoutes(app, deps.db);",
      "await registerHomeRoutes(app, deps.homeExperience);",
      "await registerExecutiveUxReadinessRoutes(app, deps.executiveUxReadiness);",
      "await registerBusinessIntelligenceRoutes(app, deps.businessIntelligence);",
      "await registerApiAuditRoutes(app, deps.apiAudit);",
      "await registerMissionControlRoutes(app, deps.missionControl);",
      "await registerLaunchControlRoutes(app, deps.launchControl);",
      "await registerPostLaunchMonitoringRoutes(app, deps.postLaunchMonitoring);",
      ...Array.from(
        { length: 12 },
        (_, index) => `await registerGenerated${index}Routes(app);`
      ),
    ].join("\n"),
    packageSource: '"fastify"\n"build"\n"verify:x31"',
    routeSources: buildApiOnlyRouteSources(),
    browserSurfaceSources: {},
    uiPageSources: buildApiOnlyUiPageSources(),
    existingPaths: new Set(collectExecutiveUxReadinessPaths()),
  };
}

function buildBrowserReadySources(): ExecutiveUxReadinessSources {
  const sources = buildApiOnlySources();
  sources.routeSources["src/api/routes/browser-shell.ts"] = [
    "import { renderPlatformHomePage } from '../../ui/pages/platform-home.js'",
    "export async function registerBrowserShellRoutes",
    'app.get("/", { config: { authRequired: false } }',
    'reply.type("text/html")',
    "renderPlatformHomePage(model)",
  ].join("\n");
  sources.serverSource += "\nawait registerBrowserShellRoutes(app);";
  sources.existingPaths.add("public/index.html");
  return sources;
}

function buildUnitRawSnapshot(
  sources: ExecutiveUxReadinessSources = buildApiOnlySources()
): ExecutiveUxReadinessRawSnapshot {
  return { sources };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x31-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x31-customer-session",
});

async function seedX31Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x31@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x31@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X31 executive UX readiness center", () => {
  describe("domain (unit)", () => {
    it("detects api-only surface when UI pages are unwired", () => {
      const raw = buildUnitRawSnapshot();
      const surface = buildSurfaceDetection({ sources: raw.sources });

      assert.equal(surface.surfaceKind, "hybrid_json");
      assert.ok(surface.uiPageModuleCount >= UI_PAGE_ENTRY_CANDIDATES.length);
      assert.equal(surface.uiPagesWiredToRoutes, false);
      assert.equal(surface.hasHtmlRoutes, false);
    });

    it("audits routes for browser usability with JSON-heavy registry", () => {
      const raw = buildUnitRawSnapshot();
      const routes = buildParsedRouteRegistry({
        serverSource: raw.sources.serverSource,
        packageSource: raw.sources.packageSource,
        routeSources: raw.sources.routeSources,
        documentationSources: {},
        existingPaths: raw.sources.existingPaths,
      });
      const routeAudit = buildRouteBrowserAudit({
        routes,
        routeSources: raw.sources.routeSources,
      });

      assert.ok(routeAudit.totalRegisteredRoutes >= 20);
      assert.equal(routeAudit.browserServingRoutes.length, 0);
      assert.ok(routeAudit.potentialEntryRoutes.some((entry) => entry.includes("/home")));
      assert.ok(routeAudit.jsonApiRoutes.length >= 1);
    });

    it("identifies missing and partial browser entry points", () => {
      const raw = buildUnitRawSnapshot();
      const routes = buildParsedRouteRegistry({
        serverSource: raw.sources.serverSource,
        packageSource: raw.sources.packageSource,
        routeSources: raw.sources.routeSources,
        documentationSources: {},
        existingPaths: raw.sources.existingPaths,
      });
      const entryPoints = buildEntryPointAudit({
        routes,
        routeSources: raw.sources.routeSources,
        browserSurfaceSources: raw.sources.browserSurfaceSources,
        uiPageSources: raw.sources.uiPageSources,
      });

      assert.ok(entryPoints.missingEntryPoints.some((entry) => entry.path === "/"));
      assert.ok(entryPoints.partialEntryPoints.some((entry) => entry.path === "/home"));
      assert.ok(entryPoints.unwiredUiPages.length >= UI_PAGE_ENTRY_CANDIDATES.length);
      assert.equal(entryPoints.wiredUiPages.length, 0);
    });

    it("classifies api_ready and operator_ready but not browser_ready for api-only posture", () => {
      const raw = buildUnitRawSnapshot();
      const routes = buildParsedRouteRegistry({
        serverSource: raw.sources.serverSource,
        packageSource: raw.sources.packageSource,
        routeSources: raw.sources.routeSources,
        documentationSources: {},
        existingPaths: raw.sources.existingPaths,
      });
      const surfaceDetection = buildSurfaceDetection({ sources: raw.sources });
      const routeAudit = buildRouteBrowserAudit({
        routes,
        routeSources: raw.sources.routeSources,
      });
      const entryPoints = buildEntryPointAudit({
        routes,
        routeSources: raw.sources.routeSources,
        browserSurfaceSources: raw.sources.browserSurfaceSources,
        uiPageSources: raw.sources.uiPageSources,
      });
      const classification = buildReadinessClassification({
        routes,
        surfaceDetection,
        routeAudit,
        entryPoints,
      });

      assert.equal(classification.apiReady.ready, true);
      assert.equal(classification.operatorReady.ready, true);
      assert.equal(classification.browserReady.ready, false);
      assert.equal(classification.highestAchievedTier, "operator_ready");
      assert.ok(classification.browserReady.blockers.length >= 1);
    });

    it("promotes browser_ready when HTML routes and UI wiring are present", () => {
      const raw = buildUnitRawSnapshot(buildBrowserReadySources());
      const routes = buildParsedRouteRegistry({
        serverSource: raw.sources.serverSource,
        packageSource: raw.sources.packageSource,
        routeSources: raw.sources.routeSources,
        documentationSources: {},
        existingPaths: raw.sources.existingPaths,
      });
      const surfaceDetection = buildSurfaceDetection({ sources: raw.sources });
      const routeAudit = buildRouteBrowserAudit({
        routes,
        routeSources: raw.sources.routeSources,
      });
      const entryPoints = buildEntryPointAudit({
        routes,
        routeSources: raw.sources.routeSources,
        browserSurfaceSources: raw.sources.browserSurfaceSources,
        uiPageSources: raw.sources.uiPageSources,
      });
      const classification = buildReadinessClassification({
        routes,
        surfaceDetection,
        routeAudit,
        entryPoints,
      });

      assert.equal(surfaceDetection.hasHtmlRoutes, true);
      assert.equal(surfaceDetection.uiPagesWiredToRoutes, true);
      assert.equal(classification.browserReady.ready, true);
      assert.equal(classification.highestAchievedTier, "browser_ready");
    });

    it("produces next-layer recommendations when frontend is missing", () => {
      const raw = buildUnitRawSnapshot();
      const routes = buildParsedRouteRegistry({
        serverSource: raw.sources.serverSource,
        packageSource: raw.sources.packageSource,
        routeSources: raw.sources.routeSources,
        documentationSources: {},
        existingPaths: raw.sources.existingPaths,
      });
      const surfaceDetection = buildSurfaceDetection({ sources: raw.sources });
      const routeAudit = buildRouteBrowserAudit({
        routes,
        routeSources: raw.sources.routeSources,
      });
      const entryPoints = buildEntryPointAudit({
        routes,
        routeSources: raw.sources.routeSources,
        browserSurfaceSources: raw.sources.browserSurfaceSources,
        uiPageSources: raw.sources.uiPageSources,
      });
      const classification = buildReadinessClassification({
        routes,
        surfaceDetection,
        routeAudit,
        entryPoints,
      });
      const recommendations = buildUxRecommendations({
        classification,
        surfaceDetection,
        entryPoints,
      });

      assert.ok(recommendations.nextLayer.length >= 1);
      assert.ok(recommendations.nextLayer.some((item) => item.title.includes("Wire UI page renderers")));
      assert.ok(recommendations.immediate.length >= 1);
    });

    it("computes weighted readiness score and center view", () => {
      const snapshot = buildExecutiveUxReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildExecutiveUxReadinessCenter({ snapshot });
      const view = toExecutiveUxReadinessCenterView(center);
      const score = computeUxReadinessScore({
        classification: snapshot.classification,
        routeAudit: snapshot.routeAudit,
        entryPoints: snapshot.entryPoints,
        surfaceDetection: snapshot.surfaceDetection,
      });

      assert.equal(view.overview.headline, "APP13 executive UX readiness center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.equal(score.score, snapshot.readinessScore.score);
      assert.equal(view.classification.highest_achieved_tier, "operator_ready");
      assert.ok(view.recommendations.summary.length > 0);
    });
  });

  describe("wiring (repository sources)", () => {
    it("loads real repository sources from the workspace", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createExecutiveUxReadinessModule/);
      assert.match(serverSource, /registerExecutiveUxReadinessRoutes/);
      assert.match(packageSource, /verify:x31/);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x31@test.app13', 'customer-x31@test.app13')`
        );
        const admin = await seedX31Admin(db);
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

    it("loads executive UX readiness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveUxReadiness } = createExecutiveUxReadinessModule(db, { rootDir: ROOT_DIR });
      const view = await executiveUxReadiness.getExecutiveUxReadinessCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.readiness_score.score >= 0);
      assert.equal(view.classification.api_ready.ready, true);
      assert.equal(view.classification.browser_ready.ready, true);
      assert.equal(view.classification.highest_achieved_tier, "browser_ready");
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveUxReadiness } = createExecutiveUxReadinessModule(db, { rootDir: ROOT_DIR });

      const surface = await executiveUxReadiness.getSurfaceDetection(ADMIN_AUTH(adminUserId));
      assert.ok(surface.ui_page_module_count >= 1);
      assert.equal(surface.ui_pages_wired_to_routes, true);
      assert.equal(surface.has_html_routes, true);

      const recommendations = await executiveUxReadiness.getUxRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);

      const score = await executiveUxReadiness.getUxReadinessScore(ADMIN_AUTH(adminUserId));
      assert.ok(score.score >= 0 && score.score <= 100);
      assert.ok(score.score >= 70);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { executiveUxReadiness } = createExecutiveUxReadinessModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () =>
          executiveUxReadiness.getExecutiveUxReadinessCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers executive UX readiness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { executiveUxReadiness } = createExecutiveUxReadinessModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x31");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutiveUxReadinessRoutes(app, executiveUxReadiness);

      for (const routePath of EXECUTIVE_UX_READINESS_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
