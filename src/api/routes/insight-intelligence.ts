import type { FastifyInstance } from "fastify";
import type {
  InsightIntelligenceEngineService,
  InsightIntelligenceQuery,
} from "../../insight-intelligence/application/insight-intelligence-service.js";
import type { InsightScenarioId } from "../../insight-intelligence/domain/insight-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): InsightIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as InsightScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerInsightIntelligenceRoutes(
  app: FastifyInstance,
  insightIntelligenceEngine: InsightIntelligenceEngineService
): Promise<void> {
  app.get(
    "/insight-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(insightIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/insight-intelligence/insights",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getInsights(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/patterns",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getPatterns(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getOpportunities(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getRisks(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/insight-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        insightIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
