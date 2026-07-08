import type { FastifyInstance } from "fastify";
import type {
  AiExecutiveIntelligenceExperienceService,
  AiExecutiveIntelligenceExperienceQuery,
} from "../../ai-executive-intelligence-experience/application/ai-executive-intelligence-experience-service.js";
import type { ExecutiveIntelligenceScenarioId } from "../../ai-executive-intelligence-experience/domain/ai-executive-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiExecutiveIntelligenceExperienceQuery {
  return {
    scenario_id: query.scenario_id as ExecutiveIntelligenceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiExecutiveIntelligenceExperienceRoutes(
  app: FastifyInstance,
  aiExecutiveIntelligenceExperience: AiExecutiveIntelligenceExperienceService
): Promise<void> {
  app.get(
    "/ai-executive-intelligence-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiExecutiveIntelligenceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiExecutiveIntelligenceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-executive-intelligence-experience/context", (a, q) =>
    aiExecutiveIntelligenceExperience.getContext(a, q)
  );
  registerView("/ai-executive-intelligence-experience/executive-summary", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveSummary(a, q)
  );
  registerView("/ai-executive-intelligence-experience/priorities", (a, q) =>
    aiExecutiveIntelligenceExperience.getStrategicPriorities(a, q)
  );
  registerView("/ai-executive-intelligence-experience/decisions", (a, q) =>
    aiExecutiveIntelligenceExperience.getCriticalDecisions(a, q)
  );
  registerView("/ai-executive-intelligence-experience/alerts", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveAlerts(a, q)
  );
  registerView("/ai-executive-intelligence-experience/opportunities", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveOpportunities(a, q)
  );
  registerView("/ai-executive-intelligence-experience/risks", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveRisks(a, q)
  );
  registerView("/ai-executive-intelligence-experience/readiness", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveReadiness(a, q)
  );
  registerView("/ai-executive-intelligence-experience/confidence", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveConfidence(a, q)
  );
  registerView("/ai-executive-intelligence-experience/delegation", (a, q) =>
    aiExecutiveIntelligenceExperience.getDelegation(a, q)
  );
  registerView("/ai-executive-intelligence-experience/explanation", (a, q) =>
    aiExecutiveIntelligenceExperience.getExecutiveExplanation(a, q)
  );
  registerView("/ai-executive-intelligence-experience/summary", (a, q) =>
    aiExecutiveIntelligenceExperience.getSummary(a, q)
  );
  registerView("/ai-executive-intelligence-experience/validate", (a, q) =>
    aiExecutiveIntelligenceExperience.validate(a, q)
  );
}
