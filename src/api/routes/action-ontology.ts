import type { FastifyInstance } from "fastify";
import type {
  ActionOntologyService,
  ActionOntologyQuery,
} from "../../action-ontology/application/action-ontology-service.js";
import type { ActionFamilyId } from "../../action-ontology/domain/action-ontology-schema.js";
import type { ScenarioId } from "../../unified-action-intelligence/domain/action-intelligence-schema.js";

function parseQuery(query: Record<string, unknown>): ActionOntologyQuery {
  return {
    family: query.family as ActionFamilyId | undefined,
    action_id: typeof query.action_id === "string" ? query.action_id : undefined,
    scenario_id: query.scenario_id as ScenarioId | undefined,
  };
}

export async function registerActionOntologyRoutes(
  app: FastifyInstance,
  actionOntology: ActionOntologyService
): Promise<void> {
  app.get(
    "/action-ontology",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionOntology.getHome(request.authContext!));
    }
  );

  app.get(
    "/action-ontology/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionOntology.getActions(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-ontology/relationships",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionOntology.getRelationships(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-ontology/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        actionOntology.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/action-ontology/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionOntology.getSummary(request.authContext!));
    }
  );
}
