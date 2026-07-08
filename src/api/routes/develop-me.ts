import type { FastifyInstance } from "fastify";
import type { DevelopMeService } from "../../develop-me/application/develop-me-service.js";

export async function registerDevelopMeRoutes(
  app: FastifyInstance,
  developMe: DevelopMeService
): Promise<void> {
  app.get(
    "/develop-me",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getOverview(request.authContext!));
    }
  );

  app.get(
    "/develop-me/profile",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getProfile(request.authContext!));
    }
  );

  app.get(
    "/develop-me/gap-radar",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getGapRadar(request.authContext!));
    }
  );

  app.get(
    "/develop-me/market-radar",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getMarketRadar(request.authContext!));
    }
  );

  app.get(
    "/develop-me/income-radar",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getIncomeRadar(request.authContext!));
    }
  );

  app.get(
    "/develop-me/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getOpportunities(request.authContext!));
    }
  );

  app.get(
    "/develop-me/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getReadiness(request.authContext!));
    }
  );

  app.get(
    "/develop-me/roadmap",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getRoadmap(request.authContext!));
    }
  );

  app.post(
    "/develop-me/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(developMe.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/develop-me/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(developMe.getStatistics(request.authContext!));
    }
  );
}
