import type { FastifyInstance } from "fastify";
import type { RequestIntelligenceService } from "../../request-experience/application/request-intelligence-service.js";

export async function registerRequestRoutes(
  app: FastifyInstance,
  requestIntelligence: RequestIntelligenceService
): Promise<void> {
  app.post(
    "/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        request_text?: string;
        budget?: number;
        preferred_days?: number;
      };

      const created = await requestIntelligence.createCustomerRequest(
        request.authContext!.userId,
        {
          request_text: body.request_text ?? "",
          budget: body.budget,
          preferred_days: body.preferred_days,
        }
      );

      return reply.status(201).send(created);
    }
  );

  app.get(
    "/requests/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await requestIntelligence.getCustomerRequest(request.authContext!.userId, id)
      );
    }
  );

  app.get(
    "/requests/:id/suggestions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const suggestions = await requestIntelligence.getRequestSuggestions(
        request.authContext!.userId,
        id
      );
      return reply.send({ request_id: id, suggestions });
    }
  );

  app.get(
    "/requests/:id/matches",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await requestIntelligence.getRequestMatches(request.authContext!.userId, id)
      );
    }
  );
}
