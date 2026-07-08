import type { FastifyInstance } from "fastify";
import type {
  StrategyIntelligenceEngineService,
  StrategyIntelligenceQuery,
} from "../../strategy-intelligence/application/strategy-intelligence-service.js";
import type { StrategyScenarioId } from "../../strategy-intelligence/domain/strategy-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): StrategyIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as StrategyScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerStrategyIntelligenceRoutes(
  app: FastifyInstance,
  strategyIntelligenceEngine: StrategyIntelligenceEngineService
): Promise<void> {
  app.get(
    "/strategy-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(strategyIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/strategy-intelligence/strategy",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getStrategy(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/roadmap",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getRoadmap(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/scenarios",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getScenarios(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getOpportunities(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/strategy-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        strategyIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
