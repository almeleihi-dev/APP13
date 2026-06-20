import type { FastifyInstance } from "fastify";
import type { TrustIntelligenceService } from "../../trust/intelligence/trust-intelligence-service.js";
import type { TrustBehaviorMetrics } from "../../trust/intelligence/types.js";

export async function registerAiTrustRoutes(
  app: FastifyInstance,
  intelligence: TrustIntelligenceService
): Promise<void> {
  app.post(
    "/ai/trust/calculate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        provider_id?: string;
        metrics?: TrustBehaviorMetrics;
      };

      const result = intelligence.calculate({
        provider_id: body.provider_id ?? "",
        metrics: body.metrics as TrustBehaviorMetrics,
      });

      return reply.send(result);
    }
  );
}
