import type { FastifyInstance } from "fastify";
import type { EvidenceExperienceService } from "../../experience/evidence-experience-service.js";

export async function registerEvidenceReadRoutes(
  app: FastifyInstance,
  evidenceExperience: EvidenceExperienceService
): Promise<void> {
  app.get(
    "/evidence/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { milestone_id?: string; issue_id?: string };
      return reply.send(
        await evidenceExperience.getOverview(
          id,
          request.authContext!.userId,
          query.milestone_id?.trim(),
          query.issue_id?.trim()
        )
      );
    }
  );

  app.get(
    "/evidence/item/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { contract_id?: string };
      return reply.send(
        await evidenceExperience.getItemDetails(
          id,
          request.authContext!.userId,
          query.contract_id?.trim()
        )
      );
    }
  );

  app.get(
    "/evidence/:id/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { milestone_id?: string; evidence_id?: string };
      return reply.send(
        await evidenceExperience.getTimeline(
          id,
          request.authContext!.userId,
          query.milestone_id?.trim(),
          query.evidence_id?.trim()
        )
      );
    }
  );
}
