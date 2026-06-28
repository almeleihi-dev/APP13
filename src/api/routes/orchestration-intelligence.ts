import type { FastifyInstance } from "fastify";
import type {
  OrchestrationIntelligenceEngineService,
  OrchestrationIntelligenceQuery,
} from "../../orchestration-intelligence/application/orchestration-intelligence-service.js";
import type { OrchestrationScenarioId } from "../../orchestration-intelligence/domain/orchestration-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): OrchestrationIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as OrchestrationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerOrchestrationIntelligenceRoutes(
  app: FastifyInstance,
  orchestrationIntelligenceEngine: OrchestrationIntelligenceEngineService
): Promise<void> {
  app.get(
    "/orchestration-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(orchestrationIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/orchestration-intelligence/chain",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getChain(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/coordination",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getCoordination(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/unified",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getUnified(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getReadiness(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/orchestration-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        orchestrationIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
