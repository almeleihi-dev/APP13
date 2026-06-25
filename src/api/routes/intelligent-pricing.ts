import type { FastifyInstance } from "fastify";
import type { IntelligentPricingService } from "../../intelligent-pricing/application/intelligent-pricing-service.js";
import type { PricingPolicy } from "../../intelligent-pricing/domain/pricing-policy.js";

export async function registerIntelligentPricingRoutes(
  app: FastifyInstance,
  intelligentPricing: IntelligentPricingService
): Promise<void> {
  app.get(
    "/intelligent-pricing",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentPricing.getCenter(request.authContext!));
    }
  );

  app.post(
    "/intelligent-pricing/calculate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        policy_id?: string;
        region?: string;
      };
      return reply.send(intelligentPricing.calculate(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-pricing/preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        policy_id?: string;
        region?: string;
      };
      return reply.send(intelligentPricing.preview(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-pricing/explain",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        region?: string;
      };
      return reply.send(intelligentPricing.explain(request.authContext!, body));
    }
  );

  app.get(
    "/intelligent-pricing/policies",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentPricing.getPolicies(request.authContext!));
    }
  );

  app.get(
    "/intelligent-pricing/breakdown",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      if (!query.listing_id) {
        return reply.status(400).send({ error: "listing_id is required" });
      }
      return reply.send(
        intelligentPricing.getBreakdown(request.authContext!, query.listing_id)
      );
    }
  );

  app.get(
    "/intelligent-pricing/version",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentPricing.getVersion(request.authContext!));
    }
  );

  app.post(
    "/intelligent-pricing/publish-policy",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as PricingPolicy;
      return reply.send(intelligentPricing.publishPolicy(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-pricing/deprecate-policy",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { policy_id: string };
      return reply.send(intelligentPricing.deprecatePolicy(request.authContext!, body));
    }
  );
}
