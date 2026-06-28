import type { FastifyInstance } from "fastify";
import type {
  DecisionIntelligenceEngineService,
  DecisionIntelligenceQuery,
} from "../../decision-intelligence/application/decision-intelligence-service.js";
import type { DecisionScenarioId } from "../../decision-intelligence/domain/decision-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): DecisionIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as DecisionScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerDecisionIntelligenceRoutes(
  app: FastifyInstance,
  decisionIntelligenceEngine: DecisionIntelligenceEngineService
): Promise<void> {
  app.get(
    "/decision-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(decisionIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/decision-intelligence/recommendation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getRecommendation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getReadiness(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/factors",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getFactors(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/alternatives",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getAlternatives(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/decision-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        decisionIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
