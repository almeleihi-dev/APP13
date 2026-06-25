import type { FastifyInstance } from "fastify";
import type { ExecutionBlueprintService } from "../../execution-blueprint/application/execution-blueprint-service.js";
import type { ActionBlueprintView } from "../../action-blueprint/domain/action-blueprint.js";
import type { ExecutionBlueprintView } from "../../execution-blueprint/domain/execution-blueprint.js";
import type { ProjectContextHint } from "../../tekrr-intelligence/domain/tekrr-profile.js";

export async function registerExecutionBlueprintRoutes(
  app: FastifyInstance,
  executionBlueprint: ExecutionBlueprintService
): Promise<void> {
  app.get(
    "/execution-blueprint",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executionBlueprint.getCenter(request.authContext!));
    }
  );

  app.get(
    "/execution-blueprint/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executionBlueprint.getOverview(request.authContext!));
    }
  );

  app.post(
    "/execution-blueprint/compile",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
        project_id?: string;
        project_context?: ProjectContextHint;
      };
      return reply.send(executionBlueprint.compile(request.authContext!, body));
    }
  );

  app.post(
    "/execution-blueprint/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as
        | { execution_blueprint: ExecutionBlueprintView }
        | { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string };
      return reply.send(executionBlueprint.validate(request.authContext!, body));
    }
  );

  app.post(
    "/execution-blueprint/preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
        project_id?: string;
        project_context?: ProjectContextHint;
      };
      return reply.send(executionBlueprint.preview(request.authContext!, body));
    }
  );

  app.get(
    "/execution-blueprint/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executionBlueprint.getSchema(request.authContext!));
    }
  );

  app.get(
    "/execution-blueprint/patterns",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executionBlueprint.getPatterns(request.authContext!));
    }
  );

  app.get(
    "/execution-blueprint/milestones",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string; version?: string };
      if (!query.blueprint_id) {
        return reply.status(400).send({ error: "blueprint_id is required" });
      }
      return reply.send(
        executionBlueprint.getMilestones(
          request.authContext!,
          query.blueprint_id,
          query.version
        )
      );
    }
  );

  app.get(
    "/execution-blueprint/evidence",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string; version?: string };
      if (!query.blueprint_id) {
        return reply.status(400).send({ error: "blueprint_id is required" });
      }
      return reply.send(
        executionBlueprint.getEvidence(request.authContext!, query.blueprint_id, query.version)
      );
    }
  );

  app.get(
    "/execution-blueprint/quality-gates",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string; version?: string };
      if (!query.blueprint_id) {
        return reply.status(400).send({ error: "blueprint_id is required" });
      }
      return reply.send(
        executionBlueprint.getQualityGates(
          request.authContext!,
          query.blueprint_id,
          query.version
        )
      );
    }
  );

  app.get(
    "/execution-blueprint/payment-gates",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string; version?: string };
      if (!query.blueprint_id) {
        return reply.status(400).send({ error: "blueprint_id is required" });
      }
      return reply.send(
        executionBlueprint.getPaymentGates(
          request.authContext!,
          query.blueprint_id,
          query.version
        )
      );
    }
  );

  app.post(
    "/execution-blueprint/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        label: string;
        project_context?: ProjectContextHint;
      };
      return reply.send(executionBlueprint.publish(request.authContext!, body));
    }
  );

  app.post(
    "/execution-blueprint/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        primary_taxonomy_code: string;
        blueprint_id: string;
        successor_taxonomy_code?: string;
      };
      return reply.send(executionBlueprint.deprecate(request.authContext!, body));
    }
  );
}
