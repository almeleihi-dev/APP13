import type { FastifyInstance } from "fastify";
import type {
  EvolutionIntelligenceEngineService,
  EvolutionIntelligenceQuery,
} from "../../evolution-intelligence/application/evolution-intelligence-service.js";
import type { EvolutionScenarioId } from "../../evolution-intelligence/domain/evolution-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): EvolutionIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as EvolutionScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerEvolutionIntelligenceRoutes(
  app: FastifyInstance,
  evolutionIntelligenceEngine: EvolutionIntelligenceEngineService
): Promise<void> {
  app.get(
    "/evolution-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(evolutionIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/evolution-intelligence/capability",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getCapability(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/transformation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getTransformation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/resilience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getResilience(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/planning",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getPlanning(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/evolution-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        evolutionIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
