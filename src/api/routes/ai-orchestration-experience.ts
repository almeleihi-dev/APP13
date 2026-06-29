import type { FastifyInstance } from "fastify";
import type {
  AiOrchestrationExperienceService,
  AiOrchestrationExperienceQuery,
} from "../../ai-orchestration-experience/application/ai-orchestration-experience-service.js";
import type { OrchestrationScenarioId } from "../../ai-orchestration-experience/domain/ai-orchestration-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiOrchestrationExperienceQuery {
  return {
    scenario_id: query.scenario_id as OrchestrationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiOrchestrationExperienceRoutes(
  app: FastifyInstance,
  aiOrchestrationExperience: AiOrchestrationExperienceService
): Promise<void> {
  app.get(
    "/ai-orchestration-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiOrchestrationExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiOrchestrationExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-orchestration-experience/pipeline", (a, q) =>
    aiOrchestrationExperience.getIntelligencePipeline(a, q)
  );
  registerView("/ai-orchestration-experience/coordination", (a, q) =>
    aiOrchestrationExperience.getModuleCoordination(a, q)
  );
  registerView("/ai-orchestration-experience/dependencies", (a, q) =>
    aiOrchestrationExperience.getDependencyGraph(a, q)
  );
  registerView("/ai-orchestration-experience/execution-flow", (a, q) =>
    aiOrchestrationExperience.getExecutionFlow(a, q)
  );
  registerView("/ai-orchestration-experience/synchronization", (a, q) =>
    aiOrchestrationExperience.getSynchronizationStatus(a, q)
  );
  registerView("/ai-orchestration-experience/health", (a, q) =>
    aiOrchestrationExperience.getSystemHealth(a, q)
  );
  registerView("/ai-orchestration-experience/readiness", (a, q) =>
    aiOrchestrationExperience.getOrchestrationReadiness(a, q)
  );
  registerView("/ai-orchestration-experience/confidence", (a, q) =>
    aiOrchestrationExperience.getOrchestrationConfidence(a, q)
  );
  registerView("/ai-orchestration-experience/delegation", (a, q) =>
    aiOrchestrationExperience.getDelegation(a, q)
  );
  registerView("/ai-orchestration-experience/explanation", (a, q) =>
    aiOrchestrationExperience.getExplanation(a, q)
  );
  registerView("/ai-orchestration-experience/summary", (a, q) =>
    aiOrchestrationExperience.getSummary(a, q)
  );
  registerView("/ai-orchestration-experience/validate", (a, q) =>
    aiOrchestrationExperience.validate(a, q)
  );
}
