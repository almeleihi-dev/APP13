import type { FastifyInstance } from "fastify";
import type { MatchingIntelligenceService } from "../../matching/intelligence/matching-intelligence-service.js";
import type { MatchingProvider, MatchingRequirement } from "../../matching/intelligence/types.js";

export async function registerAiMatchingRoutes(
  app: FastifyInstance,
  intelligence: MatchingIntelligenceService
): Promise<void> {
  app.post(
    "/ai/matching/rank",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        requirement?: MatchingRequirement;
        providers?: MatchingProvider[];
      };

      const result = intelligence.rank({
        requirement: body.requirement as MatchingRequirement,
        providers: body.providers ?? [],
      });

      return reply.send(result);
    }
  );
}
