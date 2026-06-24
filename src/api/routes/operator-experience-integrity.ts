import type { FastifyInstance } from "fastify";
import type { OperatorExperienceIntegrityService } from "../../experience/operator-experience-integrity/application/operator-experience-integrity-service.js";

export async function registerOperatorExperienceIntegrityRoutes(
  app: FastifyInstance,
  operatorExperienceIntegrity: OperatorExperienceIntegrityService
): Promise<void> {
  app.get(
    "/operator-experience-integrity",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorExperienceIntegrity.getOperatorExperienceIntegrityCenter(
          request.authContext!
        )
      );
    }
  );

  app.get(
    "/operator-experience-integrity/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getIntegrityOverview(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/auth-boundaries",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getAuthBoundaryAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/data-modes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getDataModeAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/workflow-parity",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getWorkflowParityAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/journey-integrity",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getJourneyIntegrityAudit(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/x-stack-alignment",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getXStackAlignment(request.authContext!));
    }
  );

  app.get(
    "/operator-experience-integrity/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorExperienceIntegrity.getIntegrityRecommendations(request.authContext!)
      );
    }
  );

  app.get(
    "/operator-experience-integrity/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorExperienceIntegrity.getIntegrityScore(request.authContext!));
    }
  );
}
