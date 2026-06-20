import type { FastifyInstance } from "fastify";
import type { NegotiationIntelligenceService } from "../../negotiation/intelligence/negotiation-intelligence-service.js";
import type { NegotiationAnalyzeInput } from "../../negotiation/intelligence/types.js";

export async function registerAiNegotiationRoutes(
  app: FastifyInstance,
  intelligence: NegotiationIntelligenceService
): Promise<void> {
  app.post(
    "/ai/negotiation/analyze",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as Partial<NegotiationAnalyzeInput>;

      const result = intelligence.analyze({
        customer_offer: body.customer_offer ?? Number.NaN,
        provider_offer: body.provider_offer ?? Number.NaN,
        customer_days: body.customer_days,
        provider_days: body.provider_days,
        scope_items: body.scope_items,
        trust_score: body.trust_score,
        risk_profile: body.risk_profile,
        contract_value: body.contract_value,
      });

      return reply.send(result);
    }
  );
}
