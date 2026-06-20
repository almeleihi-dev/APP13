import type { FastifyInstance } from "fastify";
import type { PricingIntelligenceService } from "../../pricing/intelligence/pricing-intelligence-service.js";
import type { PricingCalculateInput } from "../../pricing/intelligence/types.js";

export async function registerAiPricingRoutes(
  app: FastifyInstance,
  intelligence: PricingIntelligenceService
): Promise<void> {
  app.post(
    "/ai/pricing/calculate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as Partial<PricingCalculateInput>;

      const result = intelligence.calculate({
        profession: body.profession ?? "",
        action_codes: body.action_codes ?? [],
        trust_score: body.trust_score ?? Number.NaN,
        complexity: body.complexity ?? "medium",
        estimated_days: body.estimated_days ?? 0,
        urgent: body.urgent ?? false,
        location_tier: body.location_tier ?? "standard",
      });

      return reply.send(result);
    }
  );
}
