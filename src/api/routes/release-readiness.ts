import type { FastifyInstance } from "fastify";
import type { ReleaseReadinessCenterService } from "../../experience/release-readiness/application/release-readiness-service.js";

export async function registerReleaseReadinessRoutes(
  app: FastifyInstance,
  releaseReadinessCenter: ReleaseReadinessCenterService
): Promise<void> {
  app.get("/release-readiness", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await releaseReadinessCenter.getReleaseReadinessCenter(request.authContext!));
  });

  app.get("/release-readiness/score", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await releaseReadinessCenter.getLaunchReadinessScore(request.authContext!));
  });

  app.get("/release-readiness/areas", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await releaseReadinessCenter.getReadinessAreas(request.authContext!));
  });

  app.get(
    "/release-readiness/blockers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await releaseReadinessCenter.getLaunchBlockers(request.authContext!));
    }
  );

  app.get(
    "/release-readiness/warnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await releaseReadinessCenter.getLaunchWarnings(request.authContext!));
    }
  );

  app.get(
    "/release-readiness/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await releaseReadinessCenter.getRecommendedActions(request.authContext!));
    }
  );
}
