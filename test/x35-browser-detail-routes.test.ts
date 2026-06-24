import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, readdir } from "node:fs/promises";
import { registerBrowserSurfaceRoutes } from "../src/api/routes/browser-surface.js";
import { registerBrowserStaticRoutes } from "../src/api/routes/browser-static.js";
import { createAuthenticateMiddleware } from "../src/api/middleware/authenticate.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { requestIdMiddleware } from "../src/api/middleware/request.js";
import {
  BROWSER_DETAIL_ROUTES,
  BROWSER_SURFACE_ROUTE_CONFIG,
  BROWSER_SURFACE_ROUTES,
} from "../src/browser-surface/domain/browser-surface.js";
import {
  renderBrowserSurfaceCatalog,
  collectBrowserDetailPaths,
} from "../src/browser-surface/domain/browser-detail-pages.js";
import { buildBrowserDemoContractReview } from "../src/browser-surface/domain/browser-detail-fixtures.js";
import {
  createBrowserSurfaceModule,
  BrowserSurfaceService,
} from "../src/browser-surface/module.js";
import { createBrowserStaticModule } from "../src/browser-static/module.js";
import { buildExecutiveUxReadinessSnapshot } from "../src/experience/executive-ux-readiness/domain/executive-ux-readiness.js";
import { createExecutiveUxReadinessRepository } from "../src/experience/executive-ux-readiness/infrastructure/executive-ux-readiness-repository.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DETAIL_PAGE_MARKERS: Record<string, string> = {
  "/browse": 'data-page="browser-surface-catalog"',
  "/contracts/review": 'data-page="contract-review"',
  "/requests/analysis": 'data-page="request-analysis"',
  "/requests/result": 'data-page="request-result"',
  "/escrow": 'data-page="escrow-overview"',
  "/escrow/history": 'data-page="escrow-history"',
  "/evidence": 'data-page="evidence-overview"',
  "/evidence/details": 'data-page="evidence-details"',
  "/evidence/attestations": 'data-page="attestation-timeline"',
  "/execution/milestones": 'data-page="milestone-details"',
  "/disputes/details": 'data-page="dispute-details"',
  "/disputes/resolution": 'data-page="resolution-timeline"',
  "/provider/profile": 'data-page="provider-profile"',
  "/trust/report": 'data-page="provider-trust-report"',
  "/trust/timeline": 'data-page="trust-timeline"',
};

async function buildBrowserDetailTestServer() {
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

describe("X35 browser detail and workflow routes", () => {
  describe("domain (unit)", () => {
    it("defines detail browser routes included in surface route registry", () => {
      assert.equal(BROWSER_DETAIL_ROUTES.length, 15);
      for (const routePath of BROWSER_DETAIL_ROUTES) {
        assert.ok(BROWSER_SURFACE_ROUTES.includes(routePath));
      }
    });

    it("builds sync contract review fixture without outbound calls", () => {
      const review = buildBrowserDemoContractReview();

      assert.equal(review.workflow.workflow_status, "ready");
      assert.equal(review.view.contract_summary.id, "contract-summary");
    });

    it("renders browser surface catalog shell", () => {
      const html = renderBrowserSurfaceCatalog();

      assert.match(html, /data-page="browser-surface-catalog"/);
      assert.match(html, /href="\/contracts\/review"/);
      assert.match(html, /href="\/trust\/timeline"/);
    });

    it("collects browser detail verification paths", () => {
      const paths = collectBrowserDetailPaths();

      assert.ok(paths.includes("docs/experience/X35-Browser-Detail-And-Workflow-Routes.md"));
      assert.ok(paths.includes("src/browser-surface/domain/browser-detail-fixtures.ts"));
      assert.ok(paths.includes("test/x35-browser-detail-routes.test.ts"));
    });
  });

  describe("service (unit)", () => {
    it("renders all detail and workflow HTML pages from browser surface service", () => {
      const service = new BrowserSurfaceService();

      const pages = [
        [service.getBrowserCatalogHtml(), 'data-page="browser-surface-catalog"'],
        [service.getContractReviewHtml(), 'data-page="contract-review"'],
        [service.getRequestAnalysisHtml(), 'data-page="request-analysis"'],
        [service.getRequestResultHtml(), 'data-page="request-result"'],
        [service.getEscrowOverviewHtml(), 'data-page="escrow-overview"'],
        [service.getEscrowHistoryHtml(), 'data-page="escrow-history"'],
        [service.getEvidenceOverviewHtml(), 'data-page="evidence-overview"'],
        [service.getEvidenceDetailsHtml(), 'data-page="evidence-details"'],
        [service.getAttestationTimelineHtml(), 'data-page="attestation-timeline"'],
        [service.getMilestoneDetailsHtml(), 'data-page="milestone-details"'],
        [service.getDisputeDetailsHtml(), 'data-page="dispute-details"'],
        [service.getResolutionTimelineHtml(), 'data-page="resolution-timeline"'],
        [service.getProviderProfileHtml(), 'data-page="provider-profile"'],
        [service.getProviderTrustReportHtml(), 'data-page="provider-trust-report"'],
        [service.getTrustTimelineHtml(), 'data-page="trust-timeline"'],
      ] as const;

      for (const [html, marker] of pages) {
        assert.match(html, /<!DOCTYPE html>/);
        assert.ok(html.includes(marker), `expected ${marker} in HTML`);
        assert.match(html, /href="\/browser\/app.css"/);
      }
    });
  });

  describe("wiring (repository sources)", () => {
    it("registers detail routes and wires all ui page renderers in browser surface service", async () => {
      const [routeSource, serviceSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/api/routes/browser-surface.ts"), "utf8"),
        readFile(
          path.join(ROOT_DIR, "src/browser-surface/application/browser-surface-service.ts"),
          "utf8"
        ),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(packageSource, /verify:x35/);
      assert.match(routeSource, /getBrowserCatalogHtml/);
      assert.match(routeSource, /getContractReviewHtml/);
      assert.match(routeSource, /getTrustTimelineHtml/);

      const uiPagesDir = path.join(ROOT_DIR, "src/ui/pages");
      const uiPageFiles = (await readdir(uiPagesDir)).filter((file) => file.endsWith(".ts"));
      const renderFunctions: string[] = [];

      for (const file of uiPageFiles) {
        const source = await readFile(path.join(uiPagesDir, file), "utf8");
        for (const match of source.matchAll(/export function (render\w+Page)\(/g)) {
          renderFunctions.push(match[1]!);
        }
      }

      const expectedRenderers = renderFunctions.filter((name) => name !== "renderResponseCard");
      for (const renderFunction of expectedRenderers) {
        assert.match(
          serviceSource,
          new RegExp(renderFunction),
          `expected browser surface service to reference ${renderFunction}`
        );
      }
    });
  });

  describe("x31 integration (readiness)", () => {
    it("reports full ui page wiring and expanded html route coverage after X35", async () => {
      const repository = createExecutiveUxReadinessRepository({ rootDir: ROOT_DIR });
      const raw = await repository.loadRawSnapshot({} as never);
      const snapshot = buildExecutiveUxReadinessSnapshot({ raw });

      assert.equal(snapshot.entryPoints.unwiredUiPages.length, 0);
      assert.ok(snapshot.routeAudit.browserServingRoutes.length >= BROWSER_SURFACE_ROUTES.length);
      assert.ok(snapshot.surfaceDetection.uiPagesWiredToRoutes);
    });
  });

  describe("route layer (http regression)", () => {
    it("serves detail and workflow HTML routes within 2 seconds", async () => {
      const { app } = await buildBrowserDetailTestServer();
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address();
      assert.ok(address && typeof address === "object");
      const baseUrl = `http://127.0.0.1:${address.port}`;

      for (const routePath of BROWSER_DETAIL_ROUTES) {
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
        assert.match(body, new RegExp(DETAIL_PAGE_MARKERS[routePath]!));
      }

      await app.close();
    });

    it("marks detail routes as public and auth-skipped", () => {
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authRequired, false);
      assert.equal(BROWSER_SURFACE_ROUTE_CONFIG.authenticate, false);
    });
  });
});
