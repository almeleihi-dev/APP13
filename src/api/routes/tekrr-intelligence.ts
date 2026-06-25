import type { FastifyInstance } from "fastify";
import type { TekrrIntelligenceService } from "../../tekrr-intelligence/application/tekrr-intelligence-service.js";
import type { ActionBlueprintView } from "../../action-blueprint/domain/action-blueprint.js";
import type {
  ProjectContextHint,
  TekrrExecutionProfileView,
} from "../../tekrr-intelligence/domain/tekrr-profile.js";

export async function registerTekrrIntelligenceRoutes(
  app: FastifyInstance,
  tekrrIntelligence: TekrrIntelligenceService
): Promise<void> {
  app.get(
    "/tekrr-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(tekrrIntelligence.getCenter(request.authContext!));
    }
  );

  app.get(
    "/tekrr-intelligence/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(tekrrIntelligence.getOverview(request.authContext!));
    }
  );

  app.post(
    "/tekrr-intelligence/synthesize",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
        project_id?: string;
        project_context?: ProjectContextHint;
      };
      return reply.send(tekrrIntelligence.synthesize(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as
        | { profile: TekrrExecutionProfileView }
        | { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.validate(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profile?: TekrrExecutionProfileView;
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
      };
      return reply.send(tekrrIntelligence.score(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/time",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.synthesizeTime(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/effort",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.synthesizeEffort(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/knowledge",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.synthesizeKnowledge(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/risk",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.synthesizeRisk(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/resources",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(tekrrIntelligence.synthesizeResources(request.authContext!, body));
    }
  );

  app.get(
    "/tekrr-intelligence/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(tekrrIntelligence.getSchema(request.authContext!));
    }
  );

  app.post(
    "/tekrr-intelligence/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        label: string;
        project_context?: ProjectContextHint;
      };
      return reply.send(tekrrIntelligence.publish(request.authContext!, body));
    }
  );

  app.post(
    "/tekrr-intelligence/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        primary_taxonomy_code: string;
        blueprint_id: string;
        successor_taxonomy_code?: string;
      };
      return reply.send(tekrrIntelligence.deprecate(request.authContext!, body));
    }
  );
}
