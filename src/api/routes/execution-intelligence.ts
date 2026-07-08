import type { FastifyInstance } from "fastify";
import type {
  ExecutionIntelligenceEngineService,
  ExecutionIntelligenceQuery,
} from "../../execution-intelligence/application/execution-intelligence-service.js";
import type { ExecutionScenarioId } from "../../execution-intelligence/domain/execution-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): ExecutionIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as ExecutionScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerExecutionIntelligenceRoutes(
  app: FastifyInstance,
  executionIntelligenceEngine: ExecutionIntelligenceEngineService
): Promise<void> {
  app.get(
    "/execution-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executionIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/execution-intelligence/roadmap",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getRoadmap(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/sequencing",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getSequencing(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/checkpoints",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getCheckpoints(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/acceptance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getAcceptance(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/execution-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        executionIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
