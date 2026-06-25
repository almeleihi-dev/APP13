import type { FastifyInstance } from "fastify";
import type { LearnByActionService } from "../../learn-by-action/application/learn-by-action-service.js";

export async function registerLearnByActionRoutes(
  app: FastifyInstance,
  learnByAction: LearnByActionService
): Promise<void> {
  app.get(
    "/learn-by-action",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getOverview(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getOpportunities(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/experts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getExperts(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/nearby",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getNearby(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/impact",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getImpact(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/roadmap",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getRoadmap(request.authContext!));
    }
  );

  app.get(
    "/learn-by-action/history",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getHistory(request.authContext!));
    }
  );

  app.post(
    "/learn-by-action/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(learnByAction.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/learn-by-action/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learnByAction.getStatistics(request.authContext!));
    }
  );
}
