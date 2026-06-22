import type { FastifyInstance } from "fastify";
import type { ExecutiveCommandCenterService } from "../../experience/executive-command-center/application/executive-command-center-service.js";

export async function registerExecutiveCommandCenterRoutes(
  app: FastifyInstance,
  executiveCommandCenter: ExecutiveCommandCenterService
): Promise<void> {
  app.get(
    "/executive-command-center",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveCommandCenter.getExecutiveCommandCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-command-center/release-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveCommandCenter.getReleaseReadinessOverview(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-command-center/marketplace",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getMarketplaceOverview(request.authContext!));
    }
  );

  app.get(
    "/executive-command-center/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveCommandCenter.getTrustReputationOverview(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-command-center/financial",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getFinancialOverview(request.authContext!));
    }
  );

  app.get(
    "/executive-command-center/blockers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getOperationalBlockers(request.authContext!));
    }
  );

  app.get(
    "/executive-command-center/warnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getOperationalWarnings(request.authContext!));
    }
  );

  app.get(
    "/executive-command-center/strengths",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getOperationalStrengths(request.authContext!));
    }
  );

  app.get(
    "/executive-command-center/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveCommandCenter.getRecommendedActions(request.authContext!));
    }
  );
}
