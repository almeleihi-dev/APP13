import type { FastifyInstance } from "fastify";
import type {
  AiRecommendationIntelligenceExperienceService,
  AiRecommendationIntelligenceExperienceQuery,
} from "../../ai-recommendation-intelligence-experience/application/ai-recommendation-intelligence-experience-service.js";
import type { RecommendationIntelligenceScenarioId } from "../../ai-recommendation-intelligence-experience/domain/ai-recommendation-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiRecommendationIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as RecommendationIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiRecommendationIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiRecommendationIntelligenceExperience: AiRecommendationIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-recommendation-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiRecommendationIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiRecommendationIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-recommendation-intelligence-experience/context", (a, q) =>
    aiRecommendationIntelligenceExperience.getContext(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/personalized", (a, q) =>
    aiRecommendationIntelligenceExperience.getPersonalized(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/priority", (a, q) =>
    aiRecommendationIntelligenceExperience.getPriority(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/opportunities", (a, q) =>
    aiRecommendationIntelligenceExperience.getOpportunities(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/mitigation", (a, q) =>
    aiRecommendationIntelligenceExperience.getMitigation(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/strategic", (a, q) =>
    aiRecommendationIntelligenceExperience.getStrategic(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/confidence", (a, q) =>
    aiRecommendationIntelligenceExperience.getConfidence(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/readiness", (a, q) =>
    aiRecommendationIntelligenceExperience.getReadiness(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/delegation", (a, q) =>
    aiRecommendationIntelligenceExperience.getDelegation(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/explanation", (a, q) =>
    aiRecommendationIntelligenceExperience.getExplanation(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/summary", (a, q) =>
    aiRecommendationIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-recommendation-intelligence-experience/validate", (a, q) =>
    aiRecommendationIntelligenceExperience.validate(a, q)
  );
}
