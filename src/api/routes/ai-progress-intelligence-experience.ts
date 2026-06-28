import type { FastifyInstance } from "fastify";
import type {
  AiProgressIntelligenceExperienceService,
  AiProgressIntelligenceExperienceQuery,
} from "../../ai-progress-intelligence-experience/application/ai-progress-intelligence-experience-service.js";
import type { ProgressIntelligenceScenarioId } from "../../ai-progress-intelligence-experience/domain/ai-progress-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiProgressIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as ProgressIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiProgressIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiProgressIntelligenceExperience: AiProgressIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-progress-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiProgressIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiProgressIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-progress-intelligence-experience/context", (a, q) =>
    aiProgressIntelligenceExperience.getContext(a, q)
  );
  registerView("/ai-progress-intelligence-experience/overview", (a, q) =>
    aiProgressIntelligenceExperience.getOverview(a, q)
  );
  registerView("/ai-progress-intelligence-experience/completed", (a, q) =>
    aiProgressIntelligenceExperience.getCompleted(a, q)
  );
  registerView("/ai-progress-intelligence-experience/remaining", (a, q) =>
    aiProgressIntelligenceExperience.getRemaining(a, q)
  );
  registerView("/ai-progress-intelligence-experience/metrics", (a, q) =>
    aiProgressIntelligenceExperience.getMetrics(a, q)
  );
  registerView("/ai-progress-intelligence-experience/timeline", (a, q) =>
    aiProgressIntelligenceExperience.getTimeline(a, q)
  );
  registerView("/ai-progress-intelligence-experience/risks", (a, q) =>
    aiProgressIntelligenceExperience.getRisks(a, q)
  );
  registerView("/ai-progress-intelligence-experience/next-actions", (a, q) =>
    aiProgressIntelligenceExperience.getNextActions(a, q)
  );
  registerView("/ai-progress-intelligence-experience/readiness", (a, q) =>
    aiProgressIntelligenceExperience.getReadiness(a, q)
  );
  registerView("/ai-progress-intelligence-experience/delegation", (a, q) =>
    aiProgressIntelligenceExperience.getDelegation(a, q)
  );
  registerView("/ai-progress-intelligence-experience/explanation", (a, q) =>
    aiProgressIntelligenceExperience.getExplanation(a, q)
  );
  registerView("/ai-progress-intelligence-experience/summary", (a, q) =>
    aiProgressIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-progress-intelligence-experience/validate", (a, q) =>
    aiProgressIntelligenceExperience.validate(a, q)
  );
}
