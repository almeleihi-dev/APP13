import type { FastifyInstance } from "fastify";
import type {
  AiOperationalOversightExperienceService,
  AiOperationalOversightExperienceQuery,
} from "../../ai-operational-oversight-experience/application/ai-operational-oversight-experience-service.js";
import type { OperationalOversightScenarioId } from "../../ai-operational-oversight-experience/domain/ai-operational-oversight-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiOperationalOversightExperienceQuery {
  return {
    scenario_id: query.scenario_id as OperationalOversightScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiOperationalOversightExperienceRoutes(
  app: FastifyInstance,
  aiOperationalOversightExperience: AiOperationalOversightExperienceService
): Promise<void> {
  app.get(
    "/ai-operational-oversight-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiOperationalOversightExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiOperationalOversightExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-operational-oversight-experience/oversight-dashboard", (a, q) =>
    aiOperationalOversightExperience.getOversightDashboard(a, q)
  );
  registerView("/ai-operational-oversight-experience/operational-health", (a, q) =>
    aiOperationalOversightExperience.getOperationalHealth(a, q)
  );
  registerView("/ai-operational-oversight-experience/oversight-matrix", (a, q) =>
    aiOperationalOversightExperience.getOversightMatrix(a, q)
  );
  registerView("/ai-operational-oversight-experience/compliance-monitor", (a, q) =>
    aiOperationalOversightExperience.getComplianceMonitor(a, q)
  );
  registerView("/ai-operational-oversight-experience/exception-monitor", (a, q) =>
    aiOperationalOversightExperience.getExceptionMonitor(a, q)
  );
  registerView("/ai-operational-oversight-experience/intervention-plan", (a, q) =>
    aiOperationalOversightExperience.getInterventionPlan(a, q)
  );
  registerView("/ai-operational-oversight-experience/oversight-report", (a, q) =>
    aiOperationalOversightExperience.getOversightReport(a, q)
  );
  registerView("/ai-operational-oversight-experience/confidence", (a, q) =>
    aiOperationalOversightExperience.getConfidence(a, q)
  );
  registerView("/ai-operational-oversight-experience/explanation", (a, q) =>
    aiOperationalOversightExperience.getExplanation(a, q)
  );
  registerView("/ai-operational-oversight-experience/summary", (a, q) =>
    aiOperationalOversightExperience.getSummary(a, q)
  );
  registerView("/ai-operational-oversight-experience/validate", (a, q) =>
    aiOperationalOversightExperience.validate(a, q)
  );
}
