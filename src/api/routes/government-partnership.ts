import type { FastifyInstance } from "fastify";
import type { GovernmentPartnershipService } from "../../experience/government-partnership/application/government-partnership-service.js";

export async function registerGovernmentPartnershipRoutes(
  app: FastifyInstance,
  governmentPartnership: GovernmentPartnershipService
): Promise<void> {
  app.get(
    "/government-partnership",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await governmentPartnership.getGovernmentPartnershipCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/government-partnership/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await governmentPartnership.getGovernmentPartnershipOverview(request.authContext!)
      );
    }
  );

  app.get(
    "/government-partnership/economic-impact",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getEconomicImpact(request.authContext!));
    }
  );

  app.get(
    "/government-partnership/workforce",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getWorkforceImpact(request.authContext!));
    }
  );

  app.get(
    "/government-partnership/financial",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getFinancialAlignment(request.authContext!));
    }
  );

  app.get(
    "/government-partnership/insurance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getInsuranceAlignment(request.authContext!));
    }
  );

  app.get(
    "/government-partnership/workforce-development",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await governmentPartnership.getWorkforceDevelopmentAlignment(request.authContext!)
      );
    }
  );

  app.get(
    "/government-partnership/digital-government",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await governmentPartnership.getDigitalGovernmentAlignment(request.authContext!)
      );
    }
  );

  app.get(
    "/government-partnership/regulatory",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getRegulatoryAlignment(request.authContext!));
    }
  );

  app.get(
    "/government-partnership/partnerships",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await governmentPartnership.getPartnershipMatrix(request.authContext!));
    }
  );
}
