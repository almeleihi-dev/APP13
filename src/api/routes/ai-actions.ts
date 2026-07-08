import type { FastifyInstance } from "fastify";
import type { ActionIntelligenceService } from "../../action/intelligence/action-intelligence-service.js";

export async function registerAiActionRoutes(
  app: FastifyInstance,
  intelligence: ActionIntelligenceService
): Promise<void> {
  app.post(
    "/ai/actions/extract",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profession?: string;
        cv_text?: string;
        experience_text?: string;
        language?: "en" | "ar" | "auto";
      };

      const result = intelligence.extract({
        profession: body.profession,
        cv_text: body.cv_text,
        experience_text: body.experience_text,
        language: body.language ?? "auto",
      });

      return reply.send(result);
    }
  );
}
