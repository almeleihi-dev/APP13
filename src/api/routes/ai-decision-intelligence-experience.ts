import type { FastifyInstance } from "fastify";
import type {
  AiDecisionIntelligenceExperienceService,
  AiDecisionIntelligenceExperienceQuery,
} from "../../ai-decision-intelligence-experience/application/ai-decision-intelligence-experience-service.js";
import type { DecisionIntelligenceScenarioId } from "../../ai-decision-intelligence-experience/domain/ai-decision-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiDecisionIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as DecisionIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiDecisionIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiDecisionIntelligenceExperience: AiDecisionIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-decision-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiDecisionIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiDecisionIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-decision-intelligence-experience/decision-dashboard", (a, q) =>
    aiDecisionIntelligenceExperience.getDecisionDashboard(a, q)
  );
  registerView("/ai-decision-intelligence-experience/decision-tree", (a, q) =>
    aiDecisionIntelligenceExperience.getDecisionTree(a, q)
  );
  registerView("/ai-decision-intelligence-experience/options", (a, q) =>
    aiDecisionIntelligenceExperience.getOptions(a, q)
  );
  registerView("/ai-decision-intelligence-experience/recommendations", (a, q) =>
    aiDecisionIntelligenceExperience.getRecommendations(a, q)
  );
  registerView("/ai-decision-intelligence-experience/risk-analysis", (a, q) =>
    aiDecisionIntelligenceExperience.getRiskAnalysis(a, q)
  );
  registerView("/ai-decision-intelligence-experience/opportunity-analysis", (a, q) =>
    aiDecisionIntelligenceExperience.getOpportunityAnalysis(a, q)
  );
  registerView("/ai-decision-intelligence-experience/priority-matrix", (a, q) =>
    aiDecisionIntelligenceExperience.getPriorityMatrix(a, q)
  );
  registerView("/ai-decision-intelligence-experience/confidence", (a, q) =>
    aiDecisionIntelligenceExperience.getConfidence(a, q)
  );
  registerView("/ai-decision-intelligence-experience/explanation", (a, q) =>
    aiDecisionIntelligenceExperience.getExplanation(a, q)
  );
  registerView("/ai-decision-intelligence-experience/summary", (a, q) =>
    aiDecisionIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-decision-intelligence-experience/validate", (a, q) =>
    aiDecisionIntelligenceExperience.validate(a, q)
  );
}
