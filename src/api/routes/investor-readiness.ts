import type { FastifyInstance } from "fastify";
import type { InvestorReadinessService } from "../../experience/investor-readiness/application/investor-readiness-service.js";

export async function registerInvestorReadinessRoutes(
  app: FastifyInstance,
  investorReadiness: InvestorReadinessService
): Promise<void> {
  app.get("/investor-readiness", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await investorReadiness.getInvestorReadinessCenter(request.authContext!));
  });

  app.get(
    "/investor-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getInvestmentOverview(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/market",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getMarketOpportunity(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/revenue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getRevenuePotential(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/scale",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getScaleReadiness(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getRiskMatrix(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/strengths",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getStrategicStrengths(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/funding",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getFundingReadiness(request.authContext!));
    }
  );

  app.get(
    "/investor-readiness/partnerships",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await investorReadiness.getPartnershipReadiness(request.authContext!));
    }
  );
}
