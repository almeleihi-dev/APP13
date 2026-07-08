import type { FastifyInstance } from "fastify";
import type {
  OptimizationIntelligenceEngineService,
  OptimizationIntelligenceQuery,
} from "../../optimization-intelligence/application/optimization-intelligence-service.js";
import type { OptimizationScenarioId } from "../../optimization-intelligence/domain/optimization-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): OptimizationIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as OptimizationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerOptimizationIntelligenceRoutes(
  app: FastifyInstance,
  optimizationIntelligenceEngine: OptimizationIntelligenceEngineService
): Promise<void> {
  app.get(
    "/optimization-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(optimizationIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/optimization-intelligence/efficiency",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getEfficiency(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/bottlenecks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getBottlenecks(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/performance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getPerformance(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/refinement",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getRefinement(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/optimization-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        optimizationIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
