import type { FastifyInstance } from "fastify";
import type {
  AiExecutiveAdvisoryExperienceService,
  AiExecutiveAdvisoryExperienceQuery,
} from "../../ai-executive-advisory-experience/application/ai-executive-advisory-experience-service.js";
import type { ExecutiveAdvisoryScenarioId } from "../../ai-executive-advisory-experience/domain/ai-executive-advisory-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiExecutiveAdvisoryExperienceQuery {
  return {
    scenario_id: query.scenario_id as ExecutiveAdvisoryScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiExecutiveAdvisoryExperienceRoutes(
  app: FastifyInstance,
  aiExecutiveAdvisoryExperience: AiExecutiveAdvisoryExperienceService
): Promise<void> {
  app.get(
    "/ai-executive-advisory-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiExecutiveAdvisoryExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiExecutiveAdvisoryExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-executive-advisory-experience/advisory-dashboard", (a, q) =>
    aiExecutiveAdvisoryExperience.getAdvisoryDashboard(a, q)
  );
  registerView("/ai-executive-advisory-experience/executive-briefing", (a, q) =>
    aiExecutiveAdvisoryExperience.getExecutiveBriefing(a, q)
  );
  registerView("/ai-executive-advisory-experience/recommendations", (a, q) =>
    aiExecutiveAdvisoryExperience.getRecommendations(a, q)
  );
  registerView("/ai-executive-advisory-experience/action-plan", (a, q) =>
    aiExecutiveAdvisoryExperience.getActionPlan(a, q)
  );
  registerView("/ai-executive-advisory-experience/priority-actions", (a, q) =>
    aiExecutiveAdvisoryExperience.getPriorityActions(a, q)
  );
  registerView("/ai-executive-advisory-experience/risk-advisory", (a, q) =>
    aiExecutiveAdvisoryExperience.getRiskAdvisory(a, q)
  );
  registerView("/ai-executive-advisory-experience/opportunity-advisory", (a, q) =>
    aiExecutiveAdvisoryExperience.getOpportunityAdvisory(a, q)
  );
  registerView("/ai-executive-advisory-experience/confidence", (a, q) =>
    aiExecutiveAdvisoryExperience.getConfidence(a, q)
  );
  registerView("/ai-executive-advisory-experience/explanation", (a, q) =>
    aiExecutiveAdvisoryExperience.getExplanation(a, q)
  );
  registerView("/ai-executive-advisory-experience/summary", (a, q) =>
    aiExecutiveAdvisoryExperience.getSummary(a, q)
  );
  registerView("/ai-executive-advisory-experience/validate", (a, q) =>
    aiExecutiveAdvisoryExperience.validate(a, q)
  );
}
