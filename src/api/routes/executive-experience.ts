import type { FastifyInstance } from "fastify";
import type { ExecutiveExperienceService } from "../../experience/executive-experience/application/executive-experience-service.js";

export async function registerExecutiveExperienceRoutes(
  app: FastifyInstance,
  executiveExperience: ExecutiveExperienceService
): Promise<void> {
  app.get(
    "/executive-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getExecutiveExperienceLayer(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getExecutiveDashboardExperience(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getExecutiveSummaryExperience(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/investor",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getInvestorPresentationExperience(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/government",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getGovernmentPresentationExperience(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/growth",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveExperience.getGrowthExperience(request.authContext!));
    }
  );

  app.get(
    "/executive-experience/narrative",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await executiveExperience.getStrategicNarrativeExperience(request.authContext!)
      );
    }
  );

  app.get(
    "/executive-experience/snapshot",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await executiveExperience.getExecutiveSnapshot(request.authContext!));
    }
  );
}
