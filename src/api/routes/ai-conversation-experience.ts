import type { FastifyInstance } from "fastify";
import type {
  AiConversationExperienceService,
  AiConversationExperienceQuery,
} from "../../ai-conversation-experience/application/ai-conversation-experience-service.js";
import type { ConversationScenarioId } from "../../ai-conversation-experience/domain/ai-conversation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiConversationExperienceQuery {
  return {
    scenario_id: query.scenario_id as ConversationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiConversationExperienceRoutes(
  app: FastifyInstance,
  aiConversationExperience: AiConversationExperienceService
): Promise<void> {
  app.get(
    "/ai-conversation-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiConversationExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiConversationExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-conversation-experience/context", (a, q) =>
    aiConversationExperience.getContext(a, q)
  );
  registerView("/ai-conversation-experience/thread", (a, q) =>
    aiConversationExperience.getThread(a, q)
  );
  registerView("/ai-conversation-experience/messages", (a, q) =>
    aiConversationExperience.getMessages(a, q)
  );
  registerView("/ai-conversation-experience/status", (a, q) =>
    aiConversationExperience.getStatus(a, q)
  );
  registerView("/ai-conversation-experience/readiness", (a, q) =>
    aiConversationExperience.getReadiness(a, q)
  );
  registerView("/ai-conversation-experience/delegation", (a, q) =>
    aiConversationExperience.getDelegation(a, q)
  );
  registerView("/ai-conversation-experience/explanation", (a, q) =>
    aiConversationExperience.getExplanation(a, q)
  );
  registerView("/ai-conversation-experience/summary", (a, q) =>
    aiConversationExperience.getSummary(a, q)
  );
  registerView("/ai-conversation-experience/validate", (a, q) =>
    aiConversationExperience.validate(a, q)
  );
}
