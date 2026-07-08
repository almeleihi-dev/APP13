import type { FastifyInstance } from "fastify";
import type {
  AiExperienceFoundationService,
  AiExperienceFoundationQuery,
} from "../../ai-experience/application/ai-experience-foundation-service.js";
import type { AiExperienceScenarioId } from "../../ai-experience/domain/ai-experience-foundation-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiExperienceFoundationQuery {
  return {
    scenario_id: query.scenario_id as AiExperienceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiExperienceFoundationRoutes(
  app: FastifyInstance,
  aiExperienceFoundation: AiExperienceFoundationService
): Promise<void> {
  app.get("/ai-experience", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(aiExperienceFoundation.getHome(request.authContext!));
  });

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiExperienceFoundationQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-experience/context", (a, q) => aiExperienceFoundation.getContext(a, q));
  registerView("/ai-experience/foundation-status", (a, q) =>
    aiExperienceFoundation.getFoundationStatus(a, q)
  );
  registerView("/ai-experience/handoff", (a, q) => aiExperienceFoundation.getHandoff(a, q));
  registerView("/ai-experience/lineage", (a, q) => aiExperienceFoundation.getLineage(a, q));
  registerView("/ai-experience/readiness", (a, q) => aiExperienceFoundation.getReadiness(a, q));
  registerView("/ai-experience/delegation", (a, q) => aiExperienceFoundation.getDelegation(a, q));
  registerView("/ai-experience/explanation", (a, q) => aiExperienceFoundation.getExplanation(a, q));
  registerView("/ai-experience/summary", (a, q) => aiExperienceFoundation.getSummary(a, q));
  registerView("/ai-experience/validate", (a, q) => aiExperienceFoundation.validate(a, q));
}
