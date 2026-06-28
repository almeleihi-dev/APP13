import type { FastifyInstance } from "fastify";
import type {
  ActionPlanningService,
  ActionPlanningQuery,
} from "../../action-planning/application/action-planning-service.js";
import type { PlanningScenarioId } from "../../action-planning/domain/action-planning-schema.js";

function parseQuery(query: Record<string, unknown>): ActionPlanningQuery {
  return {
    scenario_id: query.scenario_id as PlanningScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerActionPlanningRoutes(
  app: FastifyInstance,
  actionPlanning: ActionPlanningService
): Promise<void> {
  app.get(
    "/action-planning",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionPlanning.getHome(request.authContext!));
    }
  );

  app.get(
    "/action-planning/plan",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.getPlan(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    }
  );

  app.get(
    "/action-planning/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.getTimeline(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-planning/dependencies",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.getDependencies(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-planning/completion",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.getCompletion(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-planning/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-planning/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionPlanning.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
