import type { FastifyInstance } from "fastify";
import type { PlatformAnalyticsService } from "../../analytics/application/platform-analytics-service.js";

export async function registerAnalyticsRoutes(
  app: FastifyInstance,
  platformAnalytics: PlatformAnalyticsService
): Promise<void> {
  app.get(
    "/analytics/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getOverview(request.authContext!));
    }
  );

  app.get(
    "/analytics/growth",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getGrowth(request.authContext!));
    }
  );

  app.get(
    "/analytics/conversions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getConversions(request.authContext!));
    }
  );

  app.get(
    "/analytics/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getContracts(request.authContext!));
    }
  );

  app.get(
    "/analytics/escrow",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getEscrow(request.authContext!));
    }
  );

  app.get(
    "/analytics/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getTrust(request.authContext!));
    }
  );

  app.get(
    "/analytics/discovery",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getDiscovery(request.authContext!));
    }
  );

  app.get(
    "/analytics/revenue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformAnalytics.getRevenue(request.authContext!));
    }
  );
}
