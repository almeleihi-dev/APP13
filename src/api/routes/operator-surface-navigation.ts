import type { FastifyInstance } from "fastify";
import type { OperatorSurfaceNavigationService } from "../../experience/operator-surface-navigation/application/operator-surface-navigation-service.js";

export async function registerOperatorSurfaceNavigationRoutes(
  app: FastifyInstance,
  operatorSurfaceNavigation: OperatorSurfaceNavigationService
): Promise<void> {
  app.get(
    "/operator-surface-navigation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorSurfaceNavigation.getOperatorSurfaceNavigationCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/operator-surface-navigation/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getNavigationOverview(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/surface-map",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getSurfaceMap(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/cross-links",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getCrossLinkAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/journeys",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getOperatorJourneyAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/orphan-centers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getOrphanCenterAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/x-stack-alignment",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getXStackAlignment(request.authContext!));
    }
  );

  app.get(
    "/operator-surface-navigation/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorSurfaceNavigation.getNavigationRecommendations(request.authContext!)
      );
    }
  );

  app.get(
    "/operator-surface-navigation/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorSurfaceNavigation.getNavigationScore(request.authContext!));
    }
  );
}
