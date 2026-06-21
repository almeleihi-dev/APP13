import type { FastifyInstance } from "fastify";
import type { DisputeExperienceService } from "../../experience/dispute-experience-service.js";

export async function registerDisputesReadRoutes(
  app: FastifyInstance,
  disputeExperience: DisputeExperienceService
): Promise<void> {
  app.get(
    "/disputes/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { contract_id?: string };
      return reply.send(
        await disputeExperience.getDashboard(
          id,
          request.authContext!.userId,
          query.contract_id?.trim()
        )
      );
    }
  );

  app.get(
    "/disputes/:id/details",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await disputeExperience.getDetails(id, request.authContext!.userId));
    }
  );

  app.get(
    "/disputes/:id/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await disputeExperience.getTimeline(id, request.authContext!.userId));
    }
  );
}
