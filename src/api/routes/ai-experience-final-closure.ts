import type { FastifyInstance } from "fastify";
import type {
  AiExperienceFinalClosureService,
  AiExperienceFinalClosureQuery,
} from "../../ai-experience-final-closure/application/ai-experience-final-closure-service.js";
import type { FinalClosureScenarioId } from "../../ai-experience-final-closure/domain/ai-experience-final-closure-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiExperienceFinalClosureQuery {
  return {
    scenario_id: query.scenario_id as FinalClosureScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiExperienceFinalClosureRoutes(
  app: FastifyInstance,
  aiExperienceFinalClosure: AiExperienceFinalClosureService
): Promise<void> {
  app.get(
    "/ai-experience-final-closure",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiExperienceFinalClosure.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiExperienceFinalClosureQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-experience-final-closure/final-dashboard", (a, q) =>
    aiExperienceFinalClosure.getFinalDashboard(a, q)
  );
  registerView("/ai-experience-final-closure/chapter-summary", (a, q) =>
    aiExperienceFinalClosure.getChapterSummary(a, q)
  );
  registerView("/ai-experience-final-closure/experience-registry", (a, q) =>
    aiExperienceFinalClosure.getExperienceRegistry(a, q)
  );
  registerView("/ai-experience-final-closure/architecture-overview", (a, q) =>
    aiExperienceFinalClosure.getArchitectureOverview(a, q)
  );
  registerView("/ai-experience-final-closure/intelligence-chain", (a, q) =>
    aiExperienceFinalClosure.getIntelligenceChain(a, q)
  );
  registerView("/ai-experience-final-closure/final-certification", (a, q) =>
    aiExperienceFinalClosure.getFinalCertification(a, q)
  );
  registerView("/ai-experience-final-closure/final-readiness", (a, q) =>
    aiExperienceFinalClosure.getFinalReadiness(a, q)
  );
  registerView("/ai-experience-final-closure/confidence", (a, q) =>
    aiExperienceFinalClosure.getConfidence(a, q)
  );
  registerView("/ai-experience-final-closure/explanation", (a, q) =>
    aiExperienceFinalClosure.getExplanation(a, q)
  );
  registerView("/ai-experience-final-closure/summary", (a, q) =>
    aiExperienceFinalClosure.getSummary(a, q)
  );
  registerView("/ai-experience-final-closure/validate", (a, q) =>
    aiExperienceFinalClosure.validate(a, q)
  );
}
