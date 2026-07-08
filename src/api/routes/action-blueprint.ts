import type { FastifyInstance } from "fastify";
import type { ActionBlueprintService } from "../../action-blueprint/application/action-blueprint-service.js";
import type { ActionBlueprintView } from "../../action-blueprint/domain/action-blueprint.js";

export async function registerActionBlueprintRoutes(
  app: FastifyInstance,
  actionBlueprint: ActionBlueprintService
): Promise<void> {
  app.get(
    "/action-blueprint",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionBlueprint.getFoundationCenter(request.authContext!));
    }
  );

  app.get(
    "/action-blueprint/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionBlueprint.getOverview(request.authContext!));
    }
  );

  app.post(
    "/action-blueprint/transform/service",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { description?: string; language?: string };
      return reply.send(
        actionBlueprint.transformService(request.authContext!, {
          description: body.description ?? "",
          language: body.language,
        })
      );
    }
  );

  app.post(
    "/action-blueprint/transform/profession",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profession?: string;
        credentials?: string[];
        experience_text?: string;
      };
      return reply.send(
        actionBlueprint.transformProfession(request.authContext!, {
          profession: body.profession ?? "",
          credentials: body.credentials,
          experience_text: body.experience_text,
        })
      );
    }
  );

  app.post(
    "/action-blueprint/transform/project",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { project_name?: string; goal_text?: string };
      return reply.send(
        actionBlueprint.transformProject(request.authContext!, {
          project_name: body.project_name ?? "",
          goal_text: body.goal_text ?? "",
        })
      );
    }
  );

  app.post(
    "/action-blueprint/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint: ActionBlueprintView };
      return reply.send(
        actionBlueprint.validateBlueprint(request.authContext!, body.blueprint)
      );
    }
  );

  app.post(
    "/action-blueprint/compile-preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
      };
      return reply.send(actionBlueprint.compilePreview(request.authContext!, body));
    }
  );

  app.get(
    "/action-blueprint/registry",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionBlueprint.listRegistry(request.authContext!));
    }
  );

  app.get(
    "/action-blueprint/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionBlueprint.getSchema(request.authContext!));
    }
  );

  app.get(
    "/action-blueprint/taxonomy-bridge",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionBlueprint.getTaxonomyBridge(request.authContext!));
    }
  );

  app.post(
    "/action-blueprint/registry/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint: ActionBlueprintView };
      return reply.send(actionBlueprint.publishBlueprint(request.authContext!, body.blueprint));
    }
  );

  app.post(
    "/action-blueprint/registry/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint_id: string;
        version: string;
        successor_blueprint_id?: string;
        successor_version?: string;
      };
      return reply.send(actionBlueprint.deprecateBlueprint(request.authContext!, body));
    }
  );

  app.get(
    "/action-blueprint/registry/:blueprintId/versions/:version",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { blueprintId: string; version: string };
      return reply.send(
        actionBlueprint.getRegistryVersion(
          request.authContext!,
          decodeURIComponent(params.blueprintId),
          params.version
        )
      );
    }
  );

  app.get(
    "/action-blueprint/registry/:blueprintId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { blueprintId: string };
      return reply.send(
        actionBlueprint.getRegistryLatest(
          request.authContext!,
          decodeURIComponent(params.blueprintId)
        )
      );
    }
  );
}
