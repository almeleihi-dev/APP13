import type { FastifyInstance } from "fastify";
import type {
  LearningIntelligenceEngineService,
  LearningIntelligenceQuery,
} from "../../learning-intelligence/application/learning-intelligence-service.js";
import type { LearningScenarioId } from "../../learning-intelligence/domain/learning-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): LearningIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as LearningScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerLearningIntelligenceRoutes(
  app: FastifyInstance,
  learningIntelligenceEngine: LearningIntelligenceEngineService
): Promise<void> {
  app.get(
    "/learning-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(learningIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/learning-intelligence/learning",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getLearning(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/adaptation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getAdaptation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/improvement",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getImprovement(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/patterns",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getPatterns(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/learning-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        learningIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
