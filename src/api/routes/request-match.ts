import type { FastifyInstance } from "fastify";
import type { RequestMatchExperienceService } from "../../experience/request-match/application/request-match-experience-service.js";

export async function registerRequestMatchRoutes(
  app: FastifyInstance,
  requestMatchExperience: RequestMatchExperienceService
): Promise<void> {
  app.get(
    "/request-match/:requestId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { requestId } = request.params as { requestId: string };
      return reply.send(
        await requestMatchExperience.getRequestMatchExperience(
          request.authContext!,
          requestId
        )
      );
    }
  );

  app.get(
    "/request-match/:requestId/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { requestId } = request.params as { requestId: string };
      return reply.send(
        await requestMatchExperience.getSuggestedActions(request.authContext!, requestId)
      );
    }
  );

  app.get(
    "/request-match/:requestId/providers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { requestId } = request.params as { requestId: string };
      return reply.send(
        await requestMatchExperience.getProviderRecommendations(
          request.authContext!,
          requestId
        )
      );
    }
  );

  app.get(
    "/request-match/:requestId/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { requestId } = request.params as { requestId: string };
      return reply.send(
        await requestMatchExperience.getConversionReadiness(
          request.authContext!,
          requestId
        )
      );
    }
  );
}
