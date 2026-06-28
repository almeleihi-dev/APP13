import type { FastifyInstance } from "fastify";
import type {
  RecommendationIntelligenceEngineService,
  RecommendationIntelligenceQuery,
} from "../../recommendation-intelligence/application/recommendation-intelligence-service.js";
import type { RecommendationScenarioId } from "../../recommendation-intelligence/domain/recommendation-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): RecommendationIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as RecommendationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerRecommendationIntelligenceRoutes(
  app: FastifyInstance,
  recommendationIntelligenceEngine: RecommendationIntelligenceEngineService
): Promise<void> {
  app.get(
    "/recommendation-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(recommendationIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/recommendation-intelligence/recommendation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getRecommendation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/prioritized",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getPrioritized(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/roadmap",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getRoadmap(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/outcomes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getOutcomes(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/fallbacks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getFallbacks(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/recommendation-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        recommendationIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
