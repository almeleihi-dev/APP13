import type { FastifyInstance } from "fastify";
import type { TrustReputationExperienceService } from "../../experience/trust-reputation/application/trust-reputation-experience-service.js";

export async function registerTrustReputationExperienceRoutes(
  app: FastifyInstance,
  trustReputationExperience: TrustReputationExperienceService
): Promise<void> {
  app.get("/trust-experience", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await trustReputationExperience.getTrustExperience(request.authContext!));
  });

  app.get(
    "/trust-experience/drivers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await trustReputationExperience.getDrivers(request.authContext!));
    }
  );

  app.get(
    "/trust-experience/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await trustReputationExperience.getProgress(request.authContext!));
    }
  );

  app.get(
    "/trust-experience/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await trustReputationExperience.getTimeline(request.authContext!));
    }
  );

  app.get(
    "/trust-experience/public",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { user_id?: string };
      const userId = query.user_id?.trim() || request.authContext!.userId;
      return reply.send(await trustReputationExperience.getPublic(userId));
    }
  );
}
