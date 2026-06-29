import type { FastifyInstance } from "fastify";
import type {
  AiPredictiveForecastExperienceService,
  AiPredictiveForecastExperienceQuery,
} from "../../ai-predictive-forecast-experience/application/ai-predictive-forecast-experience-service.js";
import type { PredictiveForecastScenarioId } from "../../ai-predictive-forecast-experience/domain/ai-predictive-forecast-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiPredictiveForecastExperienceQuery {
  return {
    scenario_id: query.scenario_id as PredictiveForecastScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiPredictiveForecastExperienceRoutes(
  app: FastifyInstance,
  aiPredictiveForecastExperience: AiPredictiveForecastExperienceService
): Promise<void> {
  app.get(
    "/ai-predictive-forecast-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiPredictiveForecastExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiPredictiveForecastExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-predictive-forecast-experience/prediction-dashboard", (a, q) =>
    aiPredictiveForecastExperience.getPredictionDashboard(a, q)
  );
  registerView("/ai-predictive-forecast-experience/future-scenarios", (a, q) =>
    aiPredictiveForecastExperience.getFutureScenarios(a, q)
  );
  registerView("/ai-predictive-forecast-experience/trend-analysis", (a, q) =>
    aiPredictiveForecastExperience.getTrendAnalysis(a, q)
  );
  registerView("/ai-predictive-forecast-experience/forecast", (a, q) =>
    aiPredictiveForecastExperience.getForecast(a, q)
  );
  registerView("/ai-predictive-forecast-experience/risk-forecast", (a, q) =>
    aiPredictiveForecastExperience.getRiskForecast(a, q)
  );
  registerView("/ai-predictive-forecast-experience/opportunity-forecast", (a, q) =>
    aiPredictiveForecastExperience.getOpportunityForecast(a, q)
  );
  registerView("/ai-predictive-forecast-experience/probability-model", (a, q) =>
    aiPredictiveForecastExperience.getProbabilityModel(a, q)
  );
  registerView("/ai-predictive-forecast-experience/confidence", (a, q) =>
    aiPredictiveForecastExperience.getConfidence(a, q)
  );
  registerView("/ai-predictive-forecast-experience/explanation", (a, q) =>
    aiPredictiveForecastExperience.getExplanation(a, q)
  );
  registerView("/ai-predictive-forecast-experience/summary", (a, q) =>
    aiPredictiveForecastExperience.getSummary(a, q)
  );
  registerView("/ai-predictive-forecast-experience/validate", (a, q) =>
    aiPredictiveForecastExperience.validate(a, q)
  );
}
