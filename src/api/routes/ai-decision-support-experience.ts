import type { FastifyInstance } from "fastify";
import type {
  AiDecisionSupportExperienceService,
  AiDecisionSupportExperienceQuery,
} from "../../ai-decision-support-experience/application/ai-decision-support-experience-service.js";
import type { DecisionSupportScenarioId } from "../../ai-decision-support-experience/domain/ai-decision-support-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiDecisionSupportExperienceQuery {
  return {
    scenario_id: query.scenario_id as DecisionSupportScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiDecisionSupportExperienceRoutes(
  app: FastifyInstance,
  aiDecisionSupportExperience: AiDecisionSupportExperienceService
): Promise<void> {
  app.get(
    "/ai-decision-support-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiDecisionSupportExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiDecisionSupportExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-decision-support-experience/context", (a, q) =>
    aiDecisionSupportExperience.getContext(a, q)
  );
  registerView("/ai-decision-support-experience/options", (a, q) =>
    aiDecisionSupportExperience.getOptions(a, q)
  );
  registerView("/ai-decision-support-experience/analysis", (a, q) =>
    aiDecisionSupportExperience.getAnalysis(a, q)
  );
  registerView("/ai-decision-support-experience/recommendation", (a, q) =>
    aiDecisionSupportExperience.getRecommendation(a, q)
  );
  registerView("/ai-decision-support-experience/status", (a, q) =>
    aiDecisionSupportExperience.getStatus(a, q)
  );
  registerView("/ai-decision-support-experience/readiness", (a, q) =>
    aiDecisionSupportExperience.getReadiness(a, q)
  );
  registerView("/ai-decision-support-experience/delegation", (a, q) =>
    aiDecisionSupportExperience.getDelegation(a, q)
  );
  registerView("/ai-decision-support-experience/explanation", (a, q) =>
    aiDecisionSupportExperience.getExplanation(a, q)
  );
  registerView("/ai-decision-support-experience/summary", (a, q) =>
    aiDecisionSupportExperience.getSummary(a, q)
  );
  registerView("/ai-decision-support-experience/validate", (a, q) =>
    aiDecisionSupportExperience.validate(a, q)
  );
}
