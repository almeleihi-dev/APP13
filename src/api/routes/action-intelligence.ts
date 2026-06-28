import type { FastifyInstance } from "fastify";
import type {
  UnifiedActionIntelligenceService,
  ActionIntentQuery,
} from "../../unified-action-intelligence/application/unified-action-intelligence-service.js";
import type { ScenarioId } from "../../unified-action-intelligence/domain/action-intelligence-schema.js";

function parseQuery(query: Record<string, unknown>): ActionIntentQuery {
  return {
    scenario_id: query.scenario_id as ScenarioId | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
    raw_text: typeof query.raw_text === "string" ? query.raw_text : undefined,
  };
}

export async function registerActionIntelligenceRoutes(
  app: FastifyInstance,
  unifiedActionIntelligence: UnifiedActionIntelligenceService
): Promise<void> {
  app.get(
    "/action-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(unifiedActionIntelligence.getHome(request.authContext!));
    }
  );

  app.get(
    "/action-intelligence/decomposition",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        unifiedActionIntelligence.getDecomposition(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence/execution-path",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        unifiedActionIntelligence.getExecutionPath(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        unifiedActionIntelligence.getRisks(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        unifiedActionIntelligence.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        unifiedActionIntelligence.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
