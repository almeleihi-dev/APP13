import type { FastifyInstance } from "fastify";
import type { PlatformControlTowerService } from "../../experience/platform-control-tower/application/platform-control-tower-service.js";

export async function registerPlatformControlTowerRoutes(
  app: FastifyInstance,
  platformControlTower: PlatformControlTowerService
): Promise<void> {
  app.get(
    "/platform-control-tower",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getPlatformControlTower(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getOverviewMetrics(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getContractsMetrics(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/financial",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getFinancialMetrics(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getTrustMetrics(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/live-frame",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getLiveFrameDistribution(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/marketplace",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getMarketplaceMetrics(request.authContext!));
    }
  );

  app.get(
    "/platform-control-tower/system-health",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformControlTower.getSystemHealthMetrics(request.authContext!));
    }
  );
}
