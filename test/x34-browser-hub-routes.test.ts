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
  BROWSER_HUB_ROUTES,
  BROWSER_SURFACE_ROUTE_CONFIG,
  BROWSER_SURFACE_ROUTES,
  collectBrowserHubPaths,
} from "../src/browser-surface/domain/browser-surface.js";
import {
  renderCustomerHubPage,
  renderMarketplaceResultsLink,
} from "../src/browser-surface/domain/browser-hub-pages.js";
import {
  buildBrowserDemoContractWorkflow,
  buildBrowserDemoProviderProfile,
} from "../src/browser-surface/domain/browser-hub-fixtures.js";
import {
  createBrowserSurfaceModule,
  BrowserSurfaceService,
} from "../src/browser-surface/module.js";
import { createBrowserStaticModule } from "../src/browser-static/module.js";
import { buildExecutiveUxReadinessSnapshot } from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
import { createExecutiveUxReadinessRepository } from "../src/experience/executive-ux-readiness/infrastructure/executive-ux-readiness-repository.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function buildBrowserHubTestServer() {
  const { browserSurface } = createBrowserSurfaceModule();
  const { browserStatic } = createBrowserStaticModule({
    publicRootDir: path.join(ROOT_DIR, "public/browser"),
  });
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

  return { app, browserSurface };
}

describe("X34 browser hub and journey routes", () => {
  describe("domain (unit)", () => {
    it("defines hub and journey browser routes", () => {
      assert.deepEqual(BROWSER_HUB_ROUTES, [
        "/home",
        "/contracts",
        "/marketplace/results",
        "/provider",
        "/customer",
        "/execution/dashboard",
        "/trust/center",
        "/disputes/dashboard",
      ]);

      for (const routePath of BROWSER_HUB_ROUTES) {
        assert.ok(BROWSER_SURFACE_ROUTES.includes(routePath));
      }
    });

    it("builds sync browser hub fixtures without outbound calls", () => {
      const workflow = buildBrowserDemoContractWorkflow();
      const profile = buildBrowserDemoProviderProfile();

      assert.equal(workflow.workflow_status, "ready");
      assert.ok(workflow.contract);
      assert.equal(profile.identity_profile.profession, "software_developer");
    });

    it("renders customer hub and marketplace results link shells", () => {
      const customer = renderCustomerHubPage();
      const resultsLink = renderMarketplaceResultsLink();

      assert.match(customer, /data-page="customer-hub"/);
      assert.match(customer, /href="\/contracts"/);
      assert.match(resultsLink, /href="\/marketplace\/results"/);
    });

    it("collects browser hub verification paths", () => {
      const paths = collectBrowserHubPaths();

      assert.ok(paths.includes("docs/experience/X34-Browser-Hub-And-Journey-Routes.md"));
      assert.ok(paths.includes("src/browser-surface/domain/browser-hub-fixtures.ts"));
      assert.ok(paths.includes("test/x34-browser-hub-routes.test.ts"));
    });
  });

  describe("service (unit)", () => {
    it("renders hub and journey HTML from browser surface service", () => {
      const service = new BrowserSurfaceService();

      const home = service.getHomeHubHtml();
      const contracts = service.getContractsHtml();
      const results = service.getMarketplaceResultsHtml();
      const provider = service.getProviderHubHtml();
      const customer = service.getCustomerHubHtml();
      const execution = service.getExecutionDashboardHtml();
      const trust = service.getTrustCenterHtml();
      const disputes = service.getDisputeDashboardHtml();

      assert.match(home, /data-page="platform-home"/);
      assert.match(contracts, /data-page="contract-summary"/);
      assert.match(results, /data-page="marketplace-results"/);
      assert.match(provider, /data-page="provider-dashboard"/);
      assert.match(customer, /data-page="customer-hub"/);
      assert.match(execution, /data-page="execution-dashboard"/);
      assert.match(trust, /data-page="trust-center"/);
      assert.match(disputes, /data-page="dispute-dashboard"/);
      assert.match(contracts, /href="\/browser\/app.css"/);
    });
  });

  describe("wiring (repository sources)", () => {
    it("registers hub and journey routes in app bootstrap", async () => {
      const [serverSource, packageSource, routeSource] = await Promise.all([
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/routes/browser-surface.ts"), "utf8"),
      ]);

      assert.match(serverSource, /registerBrowserSurfaceRoutes/);
      assert.match(packageSource, /verify:x34/);
      assert.match(routeSource, /getHomeHubHtml/);
      assert.match(routeSource, /getContractsHtml/);
      assert.match(routeSource, /getMarketplaceResultsHtml/);
      assert.match(routeSource, /getProviderHubHtml/);
      assert.match(routeSource, /getCustomerHubHtml/);
      assert.match(routeSource, /getExecutionDashboardHtml/);
      assert.match(routeSource, /getTrustCenterHtml/);
      assert.match(routeSource, /getDisputeDashboardHtml/);
    });
  });

  describe("x31 integration (readiness)", () => {
    it("detects HTML entry routes and wired UI pages after X34 hub wiring", async () => {
      const repository = createExecutiveUxReadinessRepository({ rootDir: ROOT_DIR });
      const raw = await repository.loadRawSnapshot({} as never);
      const snapshot = buildExecutiveUxReadinessSnapshot({ raw });

      for (const path of ["/home", "/contracts", "/provider", "/customer"]) {
        assert.ok(
          snapshot.entryPoints.presentEntryPoints.some((entry) => entry.path === path),
          `expected present entry point for ${path}`
        );
      }

      const wiredRenderers = [
        "renderMarketplaceResultsPage",
        "renderProviderDashboardPage",
        "renderExecutionDashboardPage",
        "renderTrustCenterPage",
        "renderContractSummaryPage",
        "renderDisputeDashboardPage",
      ];

      for (const renderFunction of wiredRenderers) {
        assert.ok(
          snapshot.entryPoints.wiredUiPages.some(
            (page) => page.renderFunction === renderFunction && page.wiredToRoute
          ),
          `expected wired UI page for ${renderFunction}`
        );
      }

      assert.equal(snapshot.entryPoints.unwiredUiPages.length, 0);
    });
  });

  describe("route layer (http regression)", () => {
    it("serves hub and journey HTML routes within 2 seconds", async () => {
      const { app } = await buildBrowserHubTestServer();
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address();
      assert.ok(address && typeof address === "object");
      const baseUrl = `http://127.0.0.1:${address.port}`;

      for (const routePath of BROWSER_HUB_ROUTES) {
        const startedAt = Date.now();
        const response = await fetch(`${baseUrl}${routePath}`, {
          headers: { cookie: "app13_session=stale-session-id" },
          signal: AbortSignal.timeout(2_000),
        });
        const elapsedMs = Date.now() - startedAt;

        assert.equal(response.status, 200, `expected 200 for ${routePath}`);
        assert.match(response.headers.get("content-type") ?? "", /text\/html/);
        assert.ok(elapsedMs < 2_000, `expected ${routePath} within 2s, took ${elapsedMs}ms`);

        const body = await response.text();
        assert.match(body, /<!DOCTYPE html>/);
      }

      await app.close();
    });

    it("marks hub routes as public and auth-skipped", () => {
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authRequired, false);
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authenticate, false);
    });
  });
});
