import type { FastifyInstance } from "fastify";
import type {
  AiActionPlanningExperienceService,
  AiActionPlanningExperienceQuery,
} from "../../ai-action-planning-experience/application/ai-action-planning-experience-service.js";
import type { ActionPlanningScenarioId } from "../../ai-action-planning-experience/domain/ai-action-planning-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiActionPlanningExperienceQuery {
  return {
    scenario_id: query.scenario_id as ActionPlanningScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiActionPlanningExperienceRoutes(
  app: FastifyInstance,
  aiActionPlanningExperience: AiActionPlanningExperienceService
): Promise<void> {
  app.get(
    "/ai-action-planning-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiActionPlanningExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiActionPlanningExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-action-planning-experience/context", (a, q) =>
    aiActionPlanningExperience.getContext(a, q)
  );
  registerView("/ai-action-planning-experience/plan", (a, q) =>
    aiActionPlanningExperience.getPlan(a, q)
  );
  registerView("/ai-action-planning-experience/tasks", (a, q) =>
    aiActionPlanningExperience.getTasks(a, q)
  );
  registerView("/ai-action-planning-experience/milestones", (a, q) =>
    aiActionPlanningExperience.getMilestones(a, q)
  );
  registerView("/ai-action-planning-experience/timeline", (a, q) =>
    aiActionPlanningExperience.getTimeline(a, q)
  );
  registerView("/ai-action-planning-experience/dependencies", (a, q) =>
    aiActionPlanningExperience.getDependencies(a, q)
  );
  registerView("/ai-action-planning-experience/checklist", (a, q) =>
    aiActionPlanningExperience.getChecklist(a, q)
  );
  registerView("/ai-action-planning-experience/readiness", (a, q) =>
    aiActionPlanningExperience.getReadiness(a, q)
  );
  registerView("/ai-action-planning-experience/delegation", (a, q) =>
    aiActionPlanningExperience.getDelegation(a, q)
  );
  registerView("/ai-action-planning-experience/explanation", (a, q) =>
    aiActionPlanningExperience.getExplanation(a, q)
  );
  registerView("/ai-action-planning-experience/summary", (a, q) =>
    aiActionPlanningExperience.getSummary(a, q)
  );
  registerView("/ai-action-planning-experience/validate", (a, q) =>
    aiActionPlanningExperience.validate(a, q)
  );
}
