import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerBrowserExperienceCompletenessRoutes } from "../src/api/routes/browser-experience-completeness.js";
import { createBrowserExperienceCompletenessModule } from "../src/experience/browser-experience-completeness/module.js";
import { BROWSER_SURFACE_ROUTES } from "../src/browser-surface/domain/browser-surface.js";
import {
  BROWSER_EXPERIENCE_COMPLETENESS_ROUTES,
  BROWSER_LAYER_SPECS,
  buildBrowserExperienceCompletenessCenter,
  buildBrowserExperienceCompletenessSnapshot,
  buildBrowserLayerAudit,
  buildBrowserRouteCompleteness,
  buildBrowserVerificationChainAudit,
  buildStaticAssetAudit,
  buildUiPageWiringAudit,
  collectBrowserExperienceCompletenessPaths,
  computeBrowserCompletenessScore,
  toBrowserExperienceCompletenessCenterView,
  type BrowserCompletenessSources,
  type BrowserExperienceCompletenessRawSnapshot,
} from "../src/experience/browser-experience-completeness/domain/browser-experience-completeness.js";
import {
  buildExecutiveUxReadinessSnapshot,
  type ExecutiveUxReadinessRawSnapshot,
  type ExecutiveUxReadinessSources,
} from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
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
const FIXED_TIME = new Date("2026-06-20T16:00:00.000Z");

function buildMinimalUxReadinessRaw(): ExecutiveUxReadinessRawSnapshot {
  const sources: ExecutiveUxReadinessSources = {
    serverSource: [
      "await registerBrowserSurfaceRoutes(app, deps.browserSurface);",
      "await registerBrowserStaticRoutes(app, deps.browserStatic);",
      "await registerExecutiveUxReadinessRoutes(app, deps.executiveUxReadiness);",
      ...Array.from({ length: 20 }, (_, index) => `await registerGenerated${index}Routes(app);`),
    ].join("\n"),
    packageSource: '"verify:x31"\n"@fastify/static"',
    routeSources: {
      "src/api/routes/browser-surface.ts": BROWSER_SURFACE_ROUTES.map(
        (route) => `app.get("${route}", { config: { authenticate: false } }`
      ).join("\n"),
    },
    browserSurfaceSources: {
      "src/browser-surface/application/browser-surface-service.ts":
        "import { renderPlatformHomePage } from '../../ui/pages/platform-home.js'",
    },
    uiPageSources: {
      "src/ui/pages/platform-home.ts": "export function renderPlatformHomePage() {}",
    },
    existingPaths: new Set(["public/browser/app.css"]),
  };

  return { sources };
}

function buildIncompleteBrowserSources(): BrowserCompletenessSources {
  return {
    indexSource: "",
    serverSource: "",
    packageSource: "",
    existingPaths: new Set<string>(),
    browserSurfaceRouteSource: 'app.get("/", { config: { authenticate: false } }',
    browserStaticRouteSource: "",
    browserSurfaceSources: {},
    uiPageSources: {
      "src/ui/pages/platform-home.ts": "export function renderPlatformHomePage() {}",
      "src/ui/pages/marketplace-search.ts": "export function renderMarketplaceSearchPage() {}",
    },
    verifyScriptSources: {},
  };
}

function buildUnitRawSnapshot(
  browserSources: BrowserCompletenessSources = buildIncompleteBrowserSources()
): BrowserExperienceCompletenessRawSnapshot {
  return {
    uxReadinessRaw: buildMinimalUxReadinessRaw(),
    sources: browserSources,
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x36-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x36-customer-session",
});

async function seedX36Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x36@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x36@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X36 browser experience completeness center", () => {
  describe("domain (unit)", () => {
    it("audits incomplete browser layers when artifacts are missing", () => {
      const raw = buildUnitRawSnapshot();
      const layerAudit = buildBrowserLayerAudit(raw.sources);

      assert.equal(layerAudit.layers.length, BROWSER_LAYER_SPECS.length);
      assert.ok(layerAudit.layers.every((layer) => layer.status !== "complete"));
      assert.ok(layerAudit.summary.includes("X32"));
    });

    it("detects missing browser HTML routes", () => {
      const raw = buildUnitRawSnapshot();
      const routeCompleteness = buildBrowserRouteCompleteness(raw.sources);

      assert.ok(routeCompleteness.missingRoutes.length > 0);
      assert.ok(routeCompleteness.completenessScore < 100);
      assert.equal(routeCompleteness.registeredRouteCount, 1);
    });

    it("audits UI page wiring against browser surface adapters", () => {
      const raw = buildUnitRawSnapshot();
      const uiPageWiring = buildUiPageWiringAudit(raw.sources);

      assert.equal(uiPageWiring.totalPageModules, 2);
      assert.equal(uiPageWiring.wiredPageModules, 0);
      assert.ok(uiPageWiring.unwiredPageModules.includes("marketplace-search.ts"));
    });

    it("computes completeness score and center view", () => {
      const raw = buildUnitRawSnapshot();
      const snapshot = buildBrowserExperienceCompletenessSnapshot({
        raw,
        generatedAt: FIXED_TIME,
      });
      const center = buildBrowserExperienceCompletenessCenter({ snapshot });
      const view = toBrowserExperienceCompletenessCenterView(center);
      const score = computeBrowserCompletenessScore({
        layerAudit: snapshot.layerAudit,
        routeCompleteness: snapshot.routeCompleteness,
        staticAssets: snapshot.staticAssets,
        uiPageWiring: snapshot.uiPageWiring,
        x31Alignment: snapshot.x31Alignment,
        verificationChain: snapshot.verificationChain,
      });

      assert.equal(view.overview.headline, "APP13 browser experience completeness center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.equal(score.score, snapshot.completenessScore.score);
      assert.ok(view.recommendations.immediate.length >= 1);
    });

    it("builds static asset audit with shell link detection", () => {
      const sources = buildIncompleteBrowserSources();
      sources.existingPaths = new Set([
        "public/browser/app.css",
        "public/browser/favicon.svg",
        "public/browser/manifest.webmanifest",
      ]);
      sources.browserStaticRouteSource = "registerBrowserStaticRoutes";
      sources.serverSource = "registerBrowserStaticRoutes";
      sources.browserSurfaceSources = {
        "src/browser-surface/domain/browser-surface.ts":
          '<link rel="stylesheet" href="/browser/app.css">',
      };

      const staticAssets = buildStaticAssetAudit(sources);
      assert.equal(staticAssets.assets.length, 3);
      assert.ok(staticAssets.completenessScore >= 0);
    });

    it("audits verification chain readiness", () => {
      const sources = buildIncompleteBrowserSources();
      sources.packageSource = [
        ...BROWSER_LAYER_SPECS.map((spec) => `"${spec.packageScript}"`),
        '"verify:x36"',
      ].join("\n");
      sources.existingPaths = new Set([
        ...BROWSER_LAYER_SPECS.map((spec) => spec.verifyScript),
        "scripts/verify-x36.sh",
      ]);
      sources.verifyScriptSources = Object.fromEntries(
        BROWSER_LAYER_SPECS.map((spec) => [spec.verifyScript, `npm run ${spec.verifyChainPrevious}`])
      );
      sources.verifyScriptSources["scripts/verify-x36.sh"] = "npm run verify:x35";

      const verificationChain = buildBrowserVerificationChainAudit(sources);
      assert.equal(verificationChain.chains.length, 5);
      assert.ok(verificationChain.chains.every((chain) => chain.exists));
    });
  });

  describe("wiring (repository sources)", () => {
    it("loads real repository sources from the workspace", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createBrowserExperienceCompletenessModule/);
      assert.match(serverSource, /registerBrowserExperienceCompletenessRoutes/);
      assert.match(packageSource, /verify:x36/);
      assert.ok(collectBrowserExperienceCompletenessPaths().length >= 5);
    });

    it("registers all expected browser HTML routes in browser-surface.ts", async () => {
      const browserSurfaceSource = await readFile(
        path.join(ROOT_DIR, "src/api/routes/browser-surface.ts"),
        "utf8"
      );

      for (const route of BROWSER_SURFACE_ROUTES) {
        assert.match(browserSurfaceSource, new RegExp(`app\\.get\\("${route.replace(/\//g, "\\/")}"`));
      }
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
          `DELETE FROM identity.users WHERE email IN ('admin-x36@test.app13', 'customer-x36@test.app13')`
        );
        const admin = await seedX36Admin(db);
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

    it("loads browser experience completeness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { browserExperienceCompleteness } = createBrowserExperienceCompletenessModule(db, {
        rootDir: ROOT_DIR,
      });
      const view = await browserExperienceCompleteness.getBrowserExperienceCompletenessCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.ok(view.completeness_score.score >= 0);
      assert.equal(view.route_completeness.registered_route_count, BROWSER_SURFACE_ROUTES.length);
      assert.equal(view.route_completeness.missing_routes.length, 0);
      assert.equal(view.completeness_score.status, "browser_complete");
      assert.equal(view.x31_alignment.browser_ready, true);
      assert.equal(view.x31_alignment.aligned_with_browser_stack, true);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { browserExperienceCompleteness } = createBrowserExperienceCompletenessModule(db, {
        rootDir: ROOT_DIR,
      });

      const layers = await browserExperienceCompleteness.getBrowserLayerAudit(ADMIN_AUTH(adminUserId));
      assert.equal(layers.layers.length, 4);
      assert.ok(layers.layers.every((layer) => layer.status === "complete"));

      const routes = await browserExperienceCompleteness.getBrowserRouteCompleteness(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(routes.completeness_score, 100);

      const staticAssets = await browserExperienceCompleteness.getStaticAssetAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(staticAssets.assets.length, 3);
      assert.equal(staticAssets.completeness_score, 100);

      const uiPages = await browserExperienceCompleteness.getUiPageWiringAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(uiPages.wired_page_modules >= 20);
      assert.equal(uiPages.unwired_page_modules.length, 0);

      const x31Alignment = await browserExperienceCompleteness.getX31Alignment(
        ADMIN_AUTH(adminUserId)
      );
      assert.equal(x31Alignment.browser_ready, true);

      const score = await browserExperienceCompleteness.getBrowserCompletenessScore(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(score.score >= 90 && score.score <= 100);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { browserExperienceCompleteness } = createBrowserExperienceCompletenessModule(db, {
        rootDir: ROOT_DIR,
      });

      await assert.rejects(
        () =>
          browserExperienceCompleteness.getBrowserExperienceCompletenessCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers browser experience completeness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { browserExperienceCompleteness } = createBrowserExperienceCompletenessModule(
        {} as DbPool,
        {
          repository: repository as never,
        }
      );

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x36");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerBrowserExperienceCompletenessRoutes(app, browserExperienceCompleteness);

      for (const route of BROWSER_EXPERIENCE_COMPLETENESS_ROUTES) {
        const response = await app.inject({ method: "GET", url: route });
        assert.equal(response.statusCode, 200, `expected 200 for ${route}`);
      }

      await app.close();
    });
  });
});
