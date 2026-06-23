import type { FastifyInstance } from "fastify";
import type { LaunchControlService } from "../../experience/launch-control/application/launch-control-service.js";

export async function registerLaunchControlRoutes(
  app: FastifyInstance,
  launchControl: LaunchControlService
): Promise<void> {
  app.get(
    "/launch-control",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchControlCenter(request.authContext!));
    }
  );

  app.get(
    "/launch-control/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchOverview(request.authContext!));
    }
  );

  app.get(
    "/launch-control/release",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getReleaseReadinessReview(request.authContext!));
    }
  );

  app.get(
    "/launch-control/production",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getProductionReadinessReview(request.authContext!));
    }
  );

  app.get(
    "/launch-control/security",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getSecurityReadinessReview(request.authContext!));
    }
  );

  app.get(
    "/launch-control/operations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getOperationsReadinessReview(request.authContext!));
    }
  );

  app.get(
    "/launch-control/blockers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchBlockers(request.authContext!));
    }
  );

  app.get(
    "/launch-control/warnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchWarnings(request.authContext!));
    }
  );

  app.get(
    "/launch-control/checklist",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchChecklist(request.authContext!));
    }
  );

  app.get(
    "/launch-control/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchRecommendations(request.authContext!));
    }
  );

  app.get(
    "/launch-control/decision",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchControl.getLaunchDecision(request.authContext!));
    }
  );
}
