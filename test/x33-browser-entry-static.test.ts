import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { registerBrowserSurfaceRoutes } from "../src/api/routes/browser-surface.js";
import { registerBrowserStaticRoutes } from "../src/api/routes/browser-static.js";
import { createAuthenticateMiddleware } from "../src/api/middleware/authenticate.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { requestIdMiddleware } from "../src/api/middleware/request.js";
import {
  BROWSER_ENTRY_ROUTES,
  BROWSER_SURFACE_ROUTE_CONFIG,
  BROWSER_SURFACE_ROUTES,
  renderLoginSurfacePage,
} from "../src/browser-surface/domain/browser-surface.js";
import {
  createBrowserSurfaceModule,
  BrowserSurfaceService,
} from "../src/browser-surface/module.js";
import {
  BROWSER_STATIC_ASSETS,
  BROWSER_STATIC_PREFIX,
  collectBrowserStaticPaths,
  isBrowserStaticPath,
} from "../src/browser-static/domain/browser-static.js";
import {
  createBrowserStaticModule,
  BrowserStaticService,
} from "../src/browser-static/module.js";
import { buildExecutiveUxReadinessSnapshot } from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
import { createExecutiveUxReadinessRepository } from "../src/experience/executive-ux-readiness/infrastructure/executive-ux-readiness-repository.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function buildBrowserEntryTestServer(): Promise<{
  app: Awaited<ReturnType<typeof Fastify>>;
  browserStatic: BrowserStaticService;
}> {
  const { browserSurface } = createBrowserSurfaceModule();
  const { browserStatic } = createBrowserStaticModule({ publicRootDir: path.join(ROOT_DIR, "public/browser") });
  const app = Fastify({
    logger: false,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  await app.register(cookie);

  const hangingSessions = {
    getSession: async () => new Promise<null>(() => undefined),
  };

  app.addHook("onRequest", requestIdMiddleware);
  app.addHook(
    "preHandler",
    createAuthenticateMiddleware({
      jwt: {
        verifyAccessToken: async () => ({ sub: "x", session_id: "y" }),
      } as never,
      sessions: hangingSessions as never,
      config: { session: { cookieName: "app13_session" } } as never,
    })
  );
  app.addHook("preHandler", requireAuthMiddleware);
  await registerBrowserStaticRoutes(app, browserStatic);
  await registerBrowserSurfaceRoutes(app, browserSurface);

  return { app, browserStatic };
}

describe("X33 browser entry and static delivery", () => {
  describe("domain (unit)", () => {
    it("defines browser entry routes and static asset catalog", () => {
      assert.deepEqual(BROWSER_ENTRY_ROUTES, ["/marketplace", "/login"]);
      assert.ok(BROWSER_SURFACE_ROUTES.includes("/marketplace"));
      assert.ok(BROWSER_SURFACE_ROUTES.includes("/login"));
      assert.equal(BROWSER_STATIC_PREFIX, "/browser/");
      assert.ok(BROWSER_STATIC_ASSETS.some((asset) => asset.routePath === "/browser/app.css"));
      assert.ok(isBrowserStaticPath("/browser/app.css"));
      assert.equal(isBrowserStaticPath("/marketplace"), false);
    });

    it("renders login surface HTML shell", () => {
      const html = renderLoginSurfacePage();

      assert.match(html, /data-page="login-surface"/);
      assert.match(html, /action="\/v1\/auth\/login"/);
      assert.match(html, /type="email"/);
      assert.match(html, /type="password"/);
    });

    it("collects browser static verification paths", () => {
      const paths = collectBrowserStaticPaths();

      assert.ok(paths.includes("docs/experience/X33-Browser-Entry-And-Static-Delivery.md"));
      assert.ok(paths.includes("public/browser/app.css"));
      assert.ok(paths.includes("src/api/routes/browser-static.ts"));
    });
  });

  describe("service (unit)", () => {
    it("renders marketplace and login HTML from browser surface service", () => {
      const service = new BrowserSurfaceService();
      const marketplace = service.getMarketplaceSearchHtml();
      const login = service.getLoginHtml();

      assert.match(marketplace, /data-page="marketplace-search"/);
      assert.match(marketplace, /href="\/browser\/app.css"/);
      assert.match(login, /data-page="login-surface"/);
      assert.match(login, /href="\/browser\/manifest.webmanifest"/);
    });

    it("exposes static asset root and prefix from browser static service", () => {
      const service = new BrowserStaticService(path.join(ROOT_DIR, "public/browser"));

      assert.equal(service.getStaticPrefix(), "/browser/");
      assert.ok(service.listAssets().length >= 3);
      assert.match(service.getPublicRootDir(), /public\/browser$/);
    });
  });

  describe("wiring (repository sources)", () => {
    it("registers browser static module and entry routes in app bootstrap", async () => {
      const [indexSource, serverSource, packageSource, surfaceRouteSource, staticRouteSource] =
        await Promise.all([
          readModuleWiringSource(),
          readRouteWiringSource(),
          readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
          readFile(path.join(ROOT_DIR, "src/api/routes/browser-surface.ts"), "utf8"),
          readFile(path.join(ROOT_DIR, "src/api/routes/browser-static.ts"), "utf8"),
        ]);

      assert.match(indexSource, /createBrowserStaticModule/);
      assert.match(serverSource, /registerBrowserStaticRoutes/);
      assert.match(serverSource, /registerBrowserSurfaceRoutes/);
      assert.match(packageSource, /verify:x33/);
      assert.match(packageSource, /@fastify\/static/);
      assert.match(surfaceRouteSource, /getMarketplaceSearchHtml/);
      assert.match(surfaceRouteSource, /getLoginHtml/);
      assert.match(staticRouteSource, /registerStaticPlugin/);
    });
  });

  describe("x31 integration (readiness)", () => {
    it("detects static hosting and marketplace HTML entry after X33 wiring", async () => {
      const repository = createExecutiveUxReadinessRepository({ rootDir: ROOT_DIR });
      const raw = await repository.loadRawSnapshot({} as never);
      const snapshot = buildExecutiveUxReadinessSnapshot({ raw });

      assert.equal(snapshot.surfaceDetection.hasStaticHosting, true);
      assert.ok(
        snapshot.entryPoints.presentEntryPoints.some((entry) => entry.path === "/marketplace")
      );
      assert.ok(snapshot.entryPoints.presentEntryPoints.some((entry) => entry.path === "/login"));
      assert.ok(
        snapshot.entryPoints.wiredUiPages.some(
          (page) => page.renderFunction === "renderMarketplaceSearchPage" && page.wiredToRoute
        )
      );
    });
  });

  describe("route layer (http regression)", () => {
    it("serves public HTML entry routes and static assets within 2 seconds", async () => {
      const { app } = await buildBrowserEntryTestServer();
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address();
      assert.ok(address && typeof address === "object");
      const baseUrl = `http://127.0.0.1:${address.port}`;

      for (const routePath of BROWSER_ENTRY_ROUTES) {
        const startedAt = Date.now();
        const response = await fetch(`${baseUrl}${routePath}`, {
          headers: { cookie: "app13_session=stale-session-id" },
          signal: AbortSignal.timeout(2_000),
        });
        const elapsedMs = Date.now() - startedAt;

        assert.equal(response.status, 200, `expected 200 for ${routePath}`);
        assert.match(response.headers.get("content-type") ?? "", /text\/html/);
        assert.ok(elapsedMs < 2_000, `expected ${routePath} within 2s, took ${elapsedMs}ms`);
      }

      for (const asset of BROWSER_STATIC_ASSETS) {
        const response = await fetch(`${baseUrl}${asset.routePath}`, {
          headers: { cookie: "app13_session=stale-session-id" },
          signal: AbortSignal.timeout(2_000),
        });

        assert.equal(response.status, 200, `expected 200 for ${asset.routePath}`);
        const contentType = response.headers.get("content-type") ?? "";
        assert.ok(
          contentType.startsWith(asset.contentType.split(";")[0]!),
          `expected ${asset.contentType} for ${asset.routePath}, got ${contentType}`
        );
      }

      const marketplace = await (await fetch(`${baseUrl}/marketplace`)).text();
      assert.match(marketplace, /Analyze & Find Providers/);

      const css = await (await fetch(`${baseUrl}/browser/app.css`)).text();
      assert.match(css, /data-browser-surface="app13"/);

      await app.close();
    });

    it("marks browser entry routes as public and auth-skipped", () => {
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authRequired, false);
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authenticate, false);
    });
  });
});
