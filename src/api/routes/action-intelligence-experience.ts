import type { FastifyInstance } from "fastify";
import type {
  ActionIntelligenceExperienceService,
  ActionIntelligenceExperienceQuery,
} from "../../action-intelligence-experience/application/action-intelligence-experience-service.js";
import type { ActionIntelligenceExperienceScenarioId } from "../../action-intelligence-experience/domain/action-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): ActionIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as ActionIntelligenceExperienceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerActionIntelligenceExperienceRoutes(
  app: FastifyInstance,
  actionIntelligenceExperience: ActionIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/action-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerLayer = (
    path: string,
    handler: (auth: AuthContext, query: ActionIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerLayer("/action-intelligence-experience/intent", (a, q) =>
    actionIntelligenceExperience.getIntent(a, q)
  );
  registerLayer("/action-intelligence-experience/planning", (a, q) =>
    actionIntelligenceExperience.getPlanning(a, q)
  );
  registerLayer("/action-intelligence-experience/pricing", (a, q) =>
    actionIntelligenceExperience.getPricing(a, q)
  );
  registerLayer("/action-intelligence-experience/contract", (a, q) =>
    actionIntelligenceExperience.getContract(a, q)
  );
  registerLayer("/action-intelligence-experience/execution", (a, q) =>
    actionIntelligenceExperience.getExecution(a, q)
  );
  registerLayer("/action-intelligence-experience/outcome", (a, q) =>
    actionIntelligenceExperience.getOutcome(a, q)
  );
  registerLayer("/action-intelligence-experience/trust", (a, q) =>
    actionIntelligenceExperience.getTrust(a, q)
  );
  registerLayer("/action-intelligence-experience/decision", (a, q) =>
    actionIntelligenceExperience.getDecision(a, q)
  );
  registerLayer("/action-intelligence-experience/recommendation", (a, q) =>
    actionIntelligenceExperience.getRecommendation(a, q)
  );
  registerLayer("/action-intelligence-experience/insights", (a, q) =>
    actionIntelligenceExperience.getInsights(a, q)
  );
  registerLayer("/action-intelligence-experience/predictions", (a, q) =>
    actionIntelligenceExperience.getPredictions(a, q)
  );
  registerLayer("/action-intelligence-experience/strategy", (a, q) =>
    actionIntelligenceExperience.getStrategy(a, q)
  );
  registerLayer("/action-intelligence-experience/learning", (a, q) =>
    actionIntelligenceExperience.getLearning(a, q)
  );
  registerLayer("/action-intelligence-experience/optimization", (a, q) =>
    actionIntelligenceExperience.getOptimization(a, q)
  );
  registerLayer("/action-intelligence-experience/evolution", (a, q) =>
    actionIntelligenceExperience.getEvolution(a, q)
  );

  app.get(
    "/action-intelligence-experience/orchestration",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionIntelligenceExperience.getOrchestration(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence-experience/journey",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionIntelligenceExperience.getJourney(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence-experience/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionIntelligenceExperience.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence-experience/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionIntelligenceExperience.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence-experience/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionIntelligenceExperience.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
