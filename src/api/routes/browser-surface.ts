import type { FastifyInstance } from "fastify";
import type { BrowserSurfaceService } from "../../browser-surface/application/browser-surface-service.js";
import { BROWSER_SURFACE_ROUTE_CONFIG } from "../../browser-surface/domain/browser-surface.js";

const PUBLIC_HTML_ROUTE_CONFIG = { ...BROWSER_SURFACE_ROUTE_CONFIG };

export async function registerBrowserSurfaceRoutes(
  app: FastifyInstance,
  browserSurface: BrowserSurfaceService
): Promise<void> {
  app.get("/", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getBrowserHomeHtml());
  });

  app.get("/operator/dashboard", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getOperatorDashboardHtml());
  });

  app.get("/marketplace", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getMarketplaceSearchHtml());
  });

  app.get("/login", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getLoginHtml());
  });

  app.get("/home", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getHomeHubHtml());
  });

  app.get("/contracts", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getContractsHtml());
  });

  app.get("/marketplace/results", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getMarketplaceResultsHtml());
  });

  app.get("/provider", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getProviderHubHtml());
  });

  app.get("/customer", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getCustomerHubHtml());
  });

  app.get("/execution/dashboard", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getExecutionDashboardHtml());
  });

  app.get("/trust/center", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getTrustCenterHtml());
  });

  app.get("/disputes/dashboard", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getDisputeDashboardHtml());
  });

  app.get("/browse", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getBrowserCatalogHtml());
  });

  app.get("/contracts/review", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getContractReviewHtml());
  });

  app.get("/requests/analysis", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getRequestAnalysisHtml());
  });

  app.get("/requests/result", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getRequestResultHtml());
  });

  app.get("/escrow", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getEscrowOverviewHtml());
  });

  app.get("/escrow/history", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getEscrowHistoryHtml());
  });

  app.get("/evidence", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getEvidenceOverviewHtml());
  });

  app.get("/evidence/details", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getEvidenceDetailsHtml());
  });

  app.get("/evidence/attestations", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply
      .type("text/html; charset=utf-8")
      .send(browserSurface.getAttestationTimelineHtml());
  });

  app.get("/execution/milestones", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getMilestoneDetailsHtml());
  });

  app.get("/disputes/details", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getDisputeDetailsHtml());
  });

  app.get("/disputes/resolution", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getResolutionTimelineHtml());
  });

  app.get("/provider/profile", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getProviderProfileHtml());
  });

  app.get("/trust/report", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getProviderTrustReportHtml());
  });

  app.get("/trust/timeline", { config: PUBLIC_HTML_ROUTE_CONFIG }, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(browserSurface.getTrustTimelineHtml());
  });
}
