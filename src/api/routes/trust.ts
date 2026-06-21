import type { FastifyInstance } from "fastify";
import type { TrustExperienceService } from "../../experience/trust-experience-service.js";

export async function registerTrustExperienceRoutes(
  app: FastifyInstance,
  trustExperience: TrustExperienceService
): Promise<void> {
  app.get(
    "/trust/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getTrustCenter(id));
    }
  );

  app.get(
    "/trust/provider/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getProviderReport(id));
    }
  );

  app.get(
    "/trust/:id/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getTimeline(id));
    }
  );
}
