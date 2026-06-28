import type { FastifyInstance } from "fastify";
import type {
  PredictionIntelligenceEngineService,
  PredictionIntelligenceQuery,
} from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import type { PredictionScenarioId } from "../../prediction-intelligence/domain/prediction-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): PredictionIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as PredictionScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerPredictionIntelligenceRoutes(
  app: FastifyInstance,
  predictionIntelligenceEngine: PredictionIntelligenceEngineService
): Promise<void> {
  app.get(
    "/prediction-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(predictionIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/prediction-intelligence/predictions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getPredictions(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/scenarios",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getScenarios(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/forecasts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getForecasts(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/what-if",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getWhatIf(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/prediction-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        predictionIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
