import type { FastifyInstance } from "fastify";
import type { ProviderIntelligenceService } from "../../provider/intelligence/provider-intelligence-service.js";
import type { ProviderProfileInput } from "../../provider/intelligence/types.js";

export async function registerAiProviderRoutes(
  app: FastifyInstance,
  intelligence: ProviderIntelligenceService
): Promise<void> {
  app.post(
    "/ai/providers/profile",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as Partial<ProviderProfileInput>;

      const result = intelligence.profile({
        provider_id: body.provider_id ?? "",
        profession: body.profession,
        profile_text: body.profile_text,
        years_experience: body.years_experience,
        certifications: body.certifications,
        licenses: body.licenses,
        completed_contracts: body.completed_contracts,
        completion_rate: body.completion_rate,
        issue_rate: body.issue_rate,
        refund_rate: body.refund_rate,
        rating: body.rating,
        availability_hours_per_week: body.availability_hours_per_week,
        active_contracts: body.active_contracts,
        average_price: body.average_price,
        location_tier: body.location_tier,
      });

      return reply.send(result);
    }
  );
}
