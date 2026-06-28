import type { FastifyInstance } from "fastify";
import type {
  AiGuidanceExperienceService,
  AiGuidanceExperienceQuery,
} from "../../ai-guidance-experience/application/ai-guidance-experience-service.js";
import type { GuidanceScenarioId } from "../../ai-guidance-experience/domain/ai-guidance-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiGuidanceExperienceQuery {
  return {
    scenario_id: query.scenario_id as GuidanceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiGuidanceExperienceRoutes(
  app: FastifyInstance,
  aiGuidanceExperience: AiGuidanceExperienceService
): Promise<void> {
  app.get("/ai-guidance-experience", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(aiGuidanceExperience.getHome(request.authContext!));
  });

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiGuidanceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-guidance-experience/context", (a, q) => aiGuidanceExperience.getContext(a, q));
  registerView("/ai-guidance-experience/plan", (a, q) => aiGuidanceExperience.getPlan(a, q));
  registerView("/ai-guidance-experience/steps", (a, q) => aiGuidanceExperience.getSteps(a, q));
  registerView("/ai-guidance-experience/recommendations", (a, q) =>
    aiGuidanceExperience.getRecommendations(a, q)
  );
  registerView("/ai-guidance-experience/status", (a, q) => aiGuidanceExperience.getStatus(a, q));
  registerView("/ai-guidance-experience/readiness", (a, q) =>
    aiGuidanceExperience.getReadiness(a, q)
  );
  registerView("/ai-guidance-experience/delegation", (a, q) =>
    aiGuidanceExperience.getDelegation(a, q)
  );
  registerView("/ai-guidance-experience/explanation", (a, q) =>
    aiGuidanceExperience.getExplanation(a, q)
  );
  registerView("/ai-guidance-experience/summary", (a, q) => aiGuidanceExperience.getSummary(a, q));
  registerView("/ai-guidance-experience/validate", (a, q) => aiGuidanceExperience.validate(a, q));
}
