import type { FastifyInstance } from "fastify";
import type { MarketplaceIntelligenceService } from "../../experience/marketplace-intelligence/application/marketplace-intelligence-service.js";

export async function registerMarketplaceIntelligenceRoutes(
  app: FastifyInstance,
  marketplaceIntelligence: MarketplaceIntelligenceService
): Promise<void> {
  app.get(
    "/marketplace-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await marketplaceIntelligence.getMarketplaceIntelligence(request.authContext!)
      );
    }
  );

  app.get(
    "/marketplace-intelligence/demand",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await marketplaceIntelligence.getDemandAnalytics(request.authContext!));
    }
  );

  app.get(
    "/marketplace-intelligence/supply",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await marketplaceIntelligence.getSupplyAnalytics(request.authContext!));
    }
  );

  app.get(
    "/marketplace-intelligence/pricing",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await marketplaceIntelligence.getPricingAnalytics(request.authContext!));
    }
  );

  app.get(
    "/marketplace-intelligence/health",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await marketplaceIntelligence.getMarketplaceHealth(request.authContext!));
    }
  );

  app.get(
    "/marketplace-intelligence/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await marketplaceIntelligence.getOpportunityInsights(request.authContext!)
      );
    }
  );
}
