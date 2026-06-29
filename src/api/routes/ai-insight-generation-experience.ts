import type { FastifyInstance } from "fastify";
import type {
  AiInsightGenerationExperienceService,
  AiInsightGenerationExperienceQuery,
} from "../../ai-insight-generation-experience/application/ai-insight-generation-experience-service.js";
import type { InsightGenerationScenarioId } from "../../ai-insight-generation-experience/domain/ai-insight-generation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiInsightGenerationExperienceQuery {
  return {
    scenario_id: query.scenario_id as InsightGenerationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiInsightGenerationExperienceRoutes(
  app: FastifyInstance,
  aiInsightGenerationExperience: AiInsightGenerationExperienceService
): Promise<void> {
  app.get(
    "/ai-insight-generation-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiInsightGenerationExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiInsightGenerationExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-insight-generation-experience/context", (a, q) =>
    aiInsightGenerationExperience.getContext(a, q)
  );
  registerView("/ai-insight-generation-experience/insights", (a, q) =>
    aiInsightGenerationExperience.getInsights(a, q)
  );
  registerView("/ai-insight-generation-experience/patterns", (a, q) =>
    aiInsightGenerationExperience.getPatterns(a, q)
  );
  registerView("/ai-insight-generation-experience/findings", (a, q) =>
    aiInsightGenerationExperience.getFindings(a, q)
  );
  registerView("/ai-insight-generation-experience/opportunities", (a, q) =>
    aiInsightGenerationExperience.getOpportunities(a, q)
  );
  registerView("/ai-insight-generation-experience/risks", (a, q) =>
    aiInsightGenerationExperience.getRisks(a, q)
  );
  registerView("/ai-insight-generation-experience/strategic", (a, q) =>
    aiInsightGenerationExperience.getStrategic(a, q)
  );
  registerView("/ai-insight-generation-experience/readiness", (a, q) =>
    aiInsightGenerationExperience.getReadiness(a, q)
  );
  registerView("/ai-insight-generation-experience/delegation", (a, q) =>
    aiInsightGenerationExperience.getDelegation(a, q)
  );
  registerView("/ai-insight-generation-experience/explanation", (a, q) =>
    aiInsightGenerationExperience.getExplanation(a, q)
  );
  registerView("/ai-insight-generation-experience/summary", (a, q) =>
    aiInsightGenerationExperience.getSummary(a, q)
  );
  registerView("/ai-insight-generation-experience/validate", (a, q) =>
    aiInsightGenerationExperience.validate(a, q)
  );
}
