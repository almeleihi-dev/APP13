import type { FastifyInstance } from "fastify";
import type { BusinessIntelligenceService } from "../../experience/business-intelligence/application/business-intelligence-service.js";

export async function registerBusinessIntelligenceRoutes(
  app: FastifyInstance,
  businessIntelligence: BusinessIntelligenceService
): Promise<void> {
  app.get(
    "/business-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await businessIntelligence.getBusinessIntelligenceCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/business-intelligence/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getBusinessOverview(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/marketplace",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await businessIntelligence.getMarketplaceIntelligence(request.authContext!)
      );
    }
  );

  app.get(
    "/business-intelligence/revenue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getRevenueIntelligence(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/users",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getUserIntelligence(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getContractIntelligence(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getTrustIntelligence(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/geography",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await businessIntelligence.getGeographicIntelligence(request.authContext!)
      );
    }
  );

  app.get(
    "/business-intelligence/operations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await businessIntelligence.getOperationalIntelligence(request.authContext!)
      );
    }
  );

  app.get(
    "/business-intelligence/drivers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getGrowthDrivers(request.authContext!));
    }
  );

  app.get(
    "/business-intelligence/insights",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await businessIntelligence.getExecutiveInsights(request.authContext!));
    }
  );
}
