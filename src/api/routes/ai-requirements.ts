import type { FastifyInstance } from "fastify";
import type { RequirementIntelligenceService } from "../../action/intelligence/requirement/requirement-intelligence-service.js";

export async function registerAiRequirementRoutes(
  app: FastifyInstance,
  intelligence: RequirementIntelligenceService
): Promise<void> {
  app.post(
    "/ai/requirements/extract",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        requirement_text?: string;
        profession_hint?: string;
        language?: "en" | "ar" | "auto";
      };

      const result = intelligence.extract({
        requirement_text: body.requirement_text ?? "",
        profession_hint: body.profession_hint,
        language: body.language ?? "auto",
      });

      return reply.send(result);
    }
  );
}
