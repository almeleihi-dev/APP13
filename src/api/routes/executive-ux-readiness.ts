import type { FastifyInstance } from "fastify";
import type { ExecutiveUxReadinessService } from "../../experience/executive-ux-readiness/application/executive-ux-readiness-service.js";

export async function registerExecutiveUxReadinessRoutes(
  app: FastifyInstance,
  executiveUxReadiness: ExecutiveUxReadinessService
): Promise<void> {
  app.get(
    "/executive-ux-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveUxReadiness.getExecutiveUxReadinessCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-ux-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getUxReadinessOverview(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/surface",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getSurfaceDetection(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/routes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getRouteBrowserAudit(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/entry-points",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getEntryPointAudit(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/classification",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getReadinessClassification(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getUxRecommendations(request.authContext!));
    }
  );

  app.get(
    "/executive-ux-readiness/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveUxReadiness.getUxReadinessScore(request.authContext!));
    }
  );
}
