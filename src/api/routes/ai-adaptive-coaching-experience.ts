import type { FastifyInstance } from "fastify";
import type {
  AiAdaptiveCoachingExperienceService,
  AiAdaptiveCoachingExperienceQuery,
} from "../../ai-adaptive-coaching-experience/application/ai-adaptive-coaching-experience-service.js";
import type { AdaptiveCoachingScenarioId } from "../../ai-adaptive-coaching-experience/domain/ai-adaptive-coaching-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiAdaptiveCoachingExperienceQuery {
  return {
    scenario_id: query.scenario_id as AdaptiveCoachingScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiAdaptiveCoachingExperienceRoutes(
  app: FastifyInstance,
  aiAdaptiveCoachingExperience: AiAdaptiveCoachingExperienceService
): Promise<void> {
  app.get(
    "/ai-adaptive-coaching-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiAdaptiveCoachingExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiAdaptiveCoachingExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-adaptive-coaching-experience/context", (a, q) =>
    aiAdaptiveCoachingExperience.getContext(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/guidance", (a, q) =>
    aiAdaptiveCoachingExperience.getGuidance(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/insights", (a, q) =>
    aiAdaptiveCoachingExperience.getInsights(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/improvements", (a, q) =>
    aiAdaptiveCoachingExperience.getImprovements(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/motivation", (a, q) =>
    aiAdaptiveCoachingExperience.getMotivation(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/behavior", (a, q) =>
    aiAdaptiveCoachingExperience.getBehavior(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/readiness", (a, q) =>
    aiAdaptiveCoachingExperience.getReadiness(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/delegation", (a, q) =>
    aiAdaptiveCoachingExperience.getDelegation(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/explanation", (a, q) =>
    aiAdaptiveCoachingExperience.getExplanation(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/summary", (a, q) =>
    aiAdaptiveCoachingExperience.getSummary(a, q)
  );
  registerView("/ai-adaptive-coaching-experience/validate", (a, q) =>
    aiAdaptiveCoachingExperience.validate(a, q)
  );
}
