import type { FastifyInstance } from "fastify";
import type {
  OutcomeIntelligenceEngineService,
  OutcomeIntelligenceQuery,
} from "../../outcome-intelligence/application/outcome-intelligence-service.js";
import type { OutcomeScenarioId } from "../../outcome-intelligence/domain/outcome-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): OutcomeIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as OutcomeScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerOutcomeIntelligenceRoutes(
  app: FastifyInstance,
  outcomeIntelligenceEngine: OutcomeIntelligenceEngineService
): Promise<void> {
  app.get(
    "/outcome-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(outcomeIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/outcome-intelligence/evaluation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getEvaluation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/expected",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getExpected(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/completion",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getCompletion(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/variance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getVariance(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/outcome-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        outcomeIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
