import type { FastifyInstance } from "fastify";
import type {
  TrustIntelligenceEngineService,
  TrustIntelligenceQuery,
} from "../../trust-intelligence/application/trust-intelligence-service.js";
import type { TrustScenarioId } from "../../trust-intelligence/domain/trust-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): TrustIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as TrustScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerTrustIntelligenceRoutes(
  app: FastifyInstance,
  trustIntelligenceEngine: TrustIntelligenceEngineService
): Promise<void> {
  app.get(
    "/trust-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(trustIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/trust-intelligence/recommendation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getRecommendation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getReadiness(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getScore(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/reputation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getReputation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/trust-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        trustIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
