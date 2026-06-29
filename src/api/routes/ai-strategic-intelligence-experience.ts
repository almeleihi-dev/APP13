import type { FastifyInstance } from "fastify";
import type {
  AiStrategicIntelligenceExperienceService,
  AiStrategicIntelligenceExperienceQuery,
} from "../../ai-strategic-intelligence-experience/application/ai-strategic-intelligence-experience-service.js";
import type { StrategicIntelligenceScenarioId } from "../../ai-strategic-intelligence-experience/domain/ai-strategic-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiStrategicIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as StrategicIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiStrategicIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiStrategicIntelligenceExperience: AiStrategicIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-strategic-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiStrategicIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiStrategicIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-strategic-intelligence-experience/strategy-dashboard", (a, q) =>
    aiStrategicIntelligenceExperience.getStrategyDashboard(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/strategic-goals", (a, q) =>
    aiStrategicIntelligenceExperience.getStrategicGoals(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/strategic-scenarios", (a, q) =>
    aiStrategicIntelligenceExperience.getStrategicScenarios(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/priorities", (a, q) =>
    aiStrategicIntelligenceExperience.getPriorities(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/risk-landscape", (a, q) =>
    aiStrategicIntelligenceExperience.getRiskLandscape(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/opportunity-landscape", (a, q) =>
    aiStrategicIntelligenceExperience.getOpportunityLandscape(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/execution-roadmap", (a, q) =>
    aiStrategicIntelligenceExperience.getExecutionRoadmap(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/confidence", (a, q) =>
    aiStrategicIntelligenceExperience.getConfidence(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/explanation", (a, q) =>
    aiStrategicIntelligenceExperience.getExplanation(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/summary", (a, q) =>
    aiStrategicIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-strategic-intelligence-experience/validate", (a, q) =>
    aiStrategicIntelligenceExperience.validate(a, q)
  );
}
