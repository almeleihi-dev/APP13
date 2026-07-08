import type { FastifyInstance } from "fastify";
import type { EscrowExperienceService } from "../../experience/escrow-experience-service.js";

export async function registerEscrowExperienceRoutes(
  app: FastifyInstance,
  escrowExperience: EscrowExperienceService
): Promise<void> {
  app.get(
    "/escrow/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { contract_id?: string };
      return reply.send(
        await escrowExperience.getOverview(id, request.authContext!.userId, query.contract_id?.trim())
      );
    }
  );

  app.get(
    "/escrow/:id/history",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { contract_id?: string };
      return reply.send(
        await escrowExperience.getHistory(id, request.authContext!.userId, query.contract_id?.trim())
      );
    }
  );
}
