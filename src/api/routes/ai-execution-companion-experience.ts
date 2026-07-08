import type { FastifyInstance } from "fastify";
import type {
  AiExecutionCompanionExperienceService,
  AiExecutionCompanionExperienceQuery,
} from "../../ai-execution-companion-experience/application/ai-execution-companion-experience-service.js";
import type { ExecutionCompanionScenarioId } from "../../ai-execution-companion-experience/domain/ai-execution-companion-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiExecutionCompanionExperienceQuery {
  return {
    scenario_id: query.scenario_id as ExecutionCompanionScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiExecutionCompanionExperienceRoutes(
  app: FastifyInstance,
  aiExecutionCompanionExperience: AiExecutionCompanionExperienceService
): Promise<void> {
  app.get(
    "/ai-execution-companion-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiExecutionCompanionExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiExecutionCompanionExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-execution-companion-experience/context", (a, q) =>
    aiExecutionCompanionExperience.getContext(a, q)
  );
  registerView("/ai-execution-companion-experience/current-step", (a, q) =>
    aiExecutionCompanionExperience.getCurrentStep(a, q)
  );
  registerView("/ai-execution-companion-experience/progress", (a, q) =>
    aiExecutionCompanionExperience.getProgress(a, q)
  );
  registerView("/ai-execution-companion-experience/checklist", (a, q) =>
    aiExecutionCompanionExperience.getChecklist(a, q)
  );
  registerView("/ai-execution-companion-experience/next-actions", (a, q) =>
    aiExecutionCompanionExperience.getNextActions(a, q)
  );
  registerView("/ai-execution-companion-experience/timeline", (a, q) =>
    aiExecutionCompanionExperience.getTimeline(a, q)
  );
  registerView("/ai-execution-companion-experience/forecast", (a, q) =>
    aiExecutionCompanionExperience.getForecast(a, q)
  );
  registerView("/ai-execution-companion-experience/guidance", (a, q) =>
    aiExecutionCompanionExperience.getGuidance(a, q)
  );
  registerView("/ai-execution-companion-experience/readiness", (a, q) =>
    aiExecutionCompanionExperience.getReadiness(a, q)
  );
  registerView("/ai-execution-companion-experience/delegation", (a, q) =>
    aiExecutionCompanionExperience.getDelegation(a, q)
  );
  registerView("/ai-execution-companion-experience/explanation", (a, q) =>
    aiExecutionCompanionExperience.getExplanation(a, q)
  );
  registerView("/ai-execution-companion-experience/summary", (a, q) =>
    aiExecutionCompanionExperience.getSummary(a, q)
  );
  registerView("/ai-execution-companion-experience/validate", (a, q) =>
    aiExecutionCompanionExperience.validate(a, q)
  );
}
