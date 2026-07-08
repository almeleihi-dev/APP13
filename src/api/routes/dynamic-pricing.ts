import type { FastifyInstance } from "fastify";
import type {
  DynamicPricingService,
  DynamicPricingQuery,
} from "../../dynamic-pricing/application/dynamic-pricing-service.js";
import type {
  DistanceBand,
  PricingScenarioId,
  UrgencyLevel,
} from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): DynamicPricingQuery {
  return {
    scenario_id: query.scenario_id as PricingScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerDynamicPricingRoutes(
  app: FastifyInstance,
  dynamicPricing: DynamicPricingService
): Promise<void> {
  app.get(
    "/dynamic-pricing",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(dynamicPricing.getHome(request.authContext!));
    }
  );

  app.get(
    "/dynamic-pricing/range",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        dynamicPricing.getRange(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/dynamic-pricing/breakdown",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        dynamicPricing.getBreakdown(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/dynamic-pricing/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        dynamicPricing.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/dynamic-pricing/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        dynamicPricing.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/dynamic-pricing/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        dynamicPricing.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
