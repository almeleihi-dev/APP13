import type { FastifyInstance } from "fastify";
import type { ExecutionExperienceService } from "../../experience/execution-experience-service.js";

export async function registerExecutionExperienceRoutes(
  app: FastifyInstance,
  executionExperience: ExecutionExperienceService
): Promise<void> {
  app.get(
    "/execution/:id/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await executionExperience.getDashboard(id, request.authContext!.userId)
      );
    }
  );

  app.get(
    "/execution/milestone/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { contract_id?: string };
      return reply.send(
        await executionExperience.getMilestoneDetails(
          id,
          request.authContext!.userId,
          query.contract_id?.trim()
        )
      );
    }
  );
}
