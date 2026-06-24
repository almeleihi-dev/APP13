import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { registerBrowserSurfaceRoutes } from "../src/api/routes/browser-surface.js";
import { createAuthenticateMiddleware } from "../src/api/middleware/authenticate.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { createRevalidationMiddleware } from "../src/api/middleware/revalidate.js";
import { createServiceAuthMiddleware } from "../src/api/middleware/service-auth.js";
import {
  createIdempotencyPreHandler,
  createIdempotencyOnSend,
} from "../src/api/middleware/idempotency.js";
import { requestIdMiddleware } from "../src/api/middleware/request.js";
import {
  BROWSER_SURFACE_ROUTE_CONFIG,
  BROWSER_SURFACE_ROUTES,
  OPERATOR_EXPERIENCE_LINKS,
  buildBrowserDocumentHtml,
  collectBrowserSurfacePaths,
  renderOperatorExperienceLinks,
} from "../src/browser-surface/domain/browser-surface.js";
import {
  BrowserSurfaceService,
  createBrowserSurfaceModule,
} from "../src/browser-surface/module.js";
import { MVP_PLATFORM_HOME_SOURCE } from "../src/ui/platform/platform-payload.js";
import { buildExecutiveUxReadinessSnapshot } from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
import { createExecutiveUxReadinessRepository } from "../src/experience/executive-ux-readiness/infrastructure/executive-ux-readiness-repository.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("X32 browser surface wiring", () => {
  describe("domain (unit)", () => {
    it("builds browser document shell with navigation", () => {
      const html = buildBrowserDocumentHtml({
        title: "APP13 Platform Home",
        body: '<section data-page="platform-home"></section>',
        activePath: "/",
      });

      assert.match(html, /<!DOCTYPE html>/);
      assert.match(html, /<title>APP13 Platform Home<\/title>/);
      assert.match(html, /data-browser-surface="app13"/);
      assert.match(html, /href="\/"/);
      assert.match(html, /href="\/operator\/dashboard"/);
      assert.match(html, /aria-current="page"/);
      assert.match(html, /data-page="platform-home"/);
    });

    it("renders operator experience links for X28 through X31", () => {
      const html = renderOperatorExperienceLinks();

      for (const link of OPERATOR_EXPERIENCE_LINKS) {
        assert.match(html, new RegExp(`href="${link.href}"`));
        assert.match(html, new RegExp(`data-layer="${link.layer}"`));
      }

      assert.match(html, /data-region="operator-experience-links"/);
    });

    it("collects browser surface verification paths", () => {
      const paths = collectBrowserSurfacePaths();

      assert.ok(paths.includes("src/api/routes/browser-surface.ts"));
      assert.ok(paths.includes("docs/experience/X32-Browser-Surface-Wiring.md"));
    });

    it("marks browser routes as public and auth-skipped", () => {
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authRequired, false);
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authenticate, false);
    });
  });

  describe("service (unit)", () => {
    it("renders browser home HTML from platform home page renderer", () => {
      const service = new BrowserSurfaceService(MVP_PLATFORM_HOME_SOURCE);
      const html = service.getBrowserHomeHtml();

      assert.match(html, /<!DOCTYPE html>/);
      assert.match(html, /<\/html>/);
      assert.match(html, /data-page="platform-home"/);
      assert.match(html, /data-card="platform-summary"/);
      assert.match(html, /Platform Home/);
    });

    it("renders operator dashboard with overview and experience center links", () => {
      const service = new BrowserSurfaceService(MVP_PLATFORM_HOME_SOURCE);
      const html = service.getOperatorDashboardHtml();

      assert.match(html, /<!DOCTYPE html>/);
      assert.match(html, /<\/html>/);
      assert.match(html, /data-page="platform-overview"/);
      assert.match(html, /data-region="operator-experience-links"/);
      assert.match(html, /href="\/executive-ux-readiness"/);
      assert.match(html, /href="\/business-intelligence"/);
      assert.match(html, /href="\/post-launch-monitoring"/);
      assert.match(html, /href="\/launch-control"/);
      assert.match(html, /aria-current="page"/);
    });
  });

  describe("wiring (repository sources)", () => {
    it("registers browser surface module and routes in app bootstrap", async () => {
      const [indexSource, serverSource, packageSource, routeSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/routes/browser-surface.ts"), "utf8"),
      ]);

      assert.match(indexSource, /createBrowserSurfaceModule/);
      assert.match(serverSource, /registerBrowserSurfaceRoutes/);
      assert.match(packageSource, /verify:x32/);
      assert.match(routeSource, /text\/html/);
      assert.match(routeSource, /getBrowserHomeHtml/);
      assert.match(routeSource, /BROWSER_SURFACE_ROUTE_CONFIG/);
      assert.match(routeSource, /PUBLIC_HTML_ROUTE_CONFIG/);
    });
  });

  describe("x31 integration (readiness)", () => {
    it("detects browser_ready after HTML surface wiring", async () => {
      const repository = createExecutiveUxReadinessRepository({ rootDir: ROOT_DIR });
      const raw = await repository.loadRawSnapshot({} as never);
      const snapshot = buildExecutiveUxReadinessSnapshot({ raw });

      assert.equal(snapshot.surfaceDetection.hasHtmlRoutes, true);
      assert.equal(snapshot.surfaceDetection.uiPagesWiredToRoutes, true);
      assert.equal(snapshot.classification.browserReady.ready, true);
      assert.equal(snapshot.classification.highestAchievedTier, "browser_ready");
      assert.ok(snapshot.entryPoints.presentEntryPoints.some((entry) => entry.path === "/"));
    });
  });

  describe("route layer (smoke)", () => {
    it("serves public HTML routes without auth", async () => {
      const { browserSurface } = createBrowserSurfaceModule({
        platformSource: MVP_PLATFORM_HOME_SOURCE,
      });

      const app = Fastify();
      await registerBrowserSurfaceRoutes(app, browserSurface);

      for (const routePath of BROWSER_SURFACE_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
        assert.match(response.headers["content-type"] ?? "", /text\/html/);
      }

      const home = await app.inject({ method: "GET", url: "/" });
      assert.match(home.body, /<!DOCTYPE html>/);
      assert.match(home.body, /data-page="platform-home"/);

      const dashboard = await app.inject({ method: "GET", url: "/operator/dashboard" });
      assert.match(dashboard.body, /data-page="platform-overview"/);
      assert.match(dashboard.body, /href="\/launch-control"/);

      await app.close();
    });

    it("returns a complete HTML document for GET /", async () => {
      const { browserSurface } = createBrowserSurfaceModule();
      const app = Fastify();
      await registerBrowserSurfaceRoutes(app, browserSurface);

      const response = await app.inject({ method: "GET", url: "/" });
      assert.equal(response.statusCode, 200);
      assert.match(response.body, /^<!DOCTYPE html>/);
      assert.match(response.body, /<\/html>\s*$/);
      assert.ok(response.body.length > 500);

      await app.close();
    });

    it("skips session lookup for browser routes even when cookies are present", async () => {
      const { browserSurface } = createBrowserSurfaceModule();
      const app = Fastify();
      await app.register(cookie);

      const hangingSessions = {
        getSession: async () => new Promise<null>(() => undefined),
      };

      app.addHook(
        "preHandler",
        createAuthenticateMiddleware({
          jwt: { verifyAccessToken: async () => ({ sub: "x", session_id: "y" }) } as never,
          sessions: hangingSessions as never,
          config: { session: { cookieName: "app13_session" } } as never,
        })
      );
      app.addHook("preHandler", requireAuthMiddleware);
      await registerBrowserSurfaceRoutes(app, browserSurface);

      const response = await app.inject({
        method: "GET",
        url: "/",
        headers: {
          cookie: "app13_session=stale-session-id",
        },
      });

      assert.equal(response.statusCode, 200);
      assert.match(response.body, /<!DOCTYPE html>/);

      await app.close();
    });
  });

  describe("route layer (http regression)", () => {
    it("completes real GET / with HTML within 2 seconds", async () => {
      const { browserSurface } = createBrowserSurfaceModule();
      const app = Fastify({
        logger: false,
        requestIdHeader: "x-request-id",
        genReqId: () => randomUUID(),
      });
      await app.register(cookie);

      const hangingSessions = {
        getSession: async () => new Promise<null>(() => undefined),
      };
      const idempotency = {
        validateKey: (key: string | undefined) => key ?? "unused",
        begin: async () => null,
        complete: async () => undefined,
      };

      app.addHook("onRequest", requestIdMiddleware);
      app.addHook("preHandler", createIdempotencyPreHandler(idempotency as never));
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
      app.addHook(
        "preHandler",
        createRevalidationMiddleware({
          revalidate: async (context) => context,
        } as never)
      );
      app.addHook("preHandler", createServiceAuthMiddleware("app13-api"));
      app.addHook("onSend", createIdempotencyOnSend(idempotency as never));
      await registerBrowserSurfaceRoutes(app, browserSurface);

      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address();
      assert.ok(address && typeof address === "object");
      const url = `http://127.0.0.1:${address.port}/`;

      const startedAt = Date.now();
      const response = await fetch(url, {
        headers: { cookie: "app13_session=stale-session-id" },
        signal: AbortSignal.timeout(2_000),
      });
      const elapsedMs = Date.now() - startedAt;

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type") ?? "", /text\/html/);
      assert.ok(elapsedMs < 2_000, `expected response within 2s, took ${elapsedMs}ms`);

      const body = await response.text();
      assert.match(body, /<!DOCTYPE html>/);

      await app.close();
    });
  });
});
