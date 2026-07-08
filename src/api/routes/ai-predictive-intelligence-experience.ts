import type { FastifyInstance } from "fastify";
import type {
  AiPredictiveIntelligenceExperienceService,
  AiPredictiveIntelligenceExperienceQuery,
} from "../../ai-predictive-intelligence-experience/application/ai-predictive-intelligence-experience-service.js";
import type { PredictiveIntelligenceScenarioId } from "../../ai-predictive-intelligence-experience/domain/ai-predictive-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiPredictiveIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as PredictiveIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiPredictiveIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiPredictiveIntelligenceExperience: AiPredictiveIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-predictive-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiPredictiveIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiPredictiveIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-predictive-intelligence-experience/context", (a, q) =>
    aiPredictiveIntelligenceExperience.getContext(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/outcomes", (a, q) =>
    aiPredictiveIntelligenceExperience.getOutcomes(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/probability", (a, q) =>
    aiPredictiveIntelligenceExperience.getProbability(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/scenarios", (a, q) =>
    aiPredictiveIntelligenceExperience.getScenarios(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/warnings", (a, q) =>
    aiPredictiveIntelligenceExperience.getWarnings(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/opportunities", (a, q) =>
    aiPredictiveIntelligenceExperience.getOpportunities(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/risks", (a, q) =>
    aiPredictiveIntelligenceExperience.getRisks(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/confidence", (a, q) =>
    aiPredictiveIntelligenceExperience.getConfidence(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/readiness", (a, q) =>
    aiPredictiveIntelligenceExperience.getReadiness(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/delegation", (a, q) =>
    aiPredictiveIntelligenceExperience.getDelegation(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/explanation", (a, q) =>
    aiPredictiveIntelligenceExperience.getExplanation(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/summary", (a, q) =>
    aiPredictiveIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-predictive-intelligence-experience/validate", (a, q) =>
    aiPredictiveIntelligenceExperience.validate(a, q)
  );
}
