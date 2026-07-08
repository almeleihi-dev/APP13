import type { FastifyInstance } from "fastify";
import type { ProjectDecompositionService } from "../../project-decomposition/application/project-decomposition-service.js";
import type { ProjectBlueprintGraph } from "../../project-decomposition/domain/project-decomposition.js";
import type { ProjectTemplateSpec } from "../../project-decomposition/domain/project-templates.js";

export async function registerProjectDecompositionRoutes(
  app: FastifyInstance,
  projectDecomposition: ProjectDecompositionService
): Promise<void> {
  app.get(
    "/project-decomposition",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(projectDecomposition.getCenter(request.authContext!));
    }
  );

  app.get(
    "/project-decomposition/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(projectDecomposition.getOverview(request.authContext!));
    }
  );

  app.post(
    "/project-decomposition/transform",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        project_name?: string;
        goal_text?: string;
        constraints?: string[];
      };
      return reply.send(
        projectDecomposition.transform(request.authContext!, {
          project_name: body.project_name ?? "",
          goal_text: body.goal_text ?? "",
          constraints: body.constraints,
        })
      );
    }
  );

  app.post(
    "/project-decomposition/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { graph: ProjectBlueprintGraph };
      return reply.send(projectDecomposition.validate(request.authContext!, body.graph));
    }
  );

  app.post(
    "/project-decomposition/compile-preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { project_id?: string; graph?: ProjectBlueprintGraph };
      return reply.send(projectDecomposition.compilePreview(request.authContext!, body));
    }
  );

  app.get(
    "/project-decomposition/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(projectDecomposition.getSchema(request.authContext!));
    }
  );

  app.get(
    "/project-decomposition/templates",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(projectDecomposition.listTemplates(request.authContext!));
    }
  );

  app.get(
    "/project-decomposition/graph",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { project_id?: string };
      if (!query.project_id) {
        return reply.status(400).send({ detail: "project_id query parameter is required" });
      }
      return reply.send(projectDecomposition.getGraph(request.authContext!, query.project_id));
    }
  );

  app.get(
    "/project-decomposition/dependencies",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { project_id?: string };
      if (!query.project_id) {
        return reply.status(400).send({ detail: "project_id query parameter is required" });
      }
      return reply.send(
        projectDecomposition.getDependencies(request.authContext!, query.project_id)
      );
    }
  );

  app.get(
    "/project-decomposition/critical-path",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { project_id?: string };
      if (!query.project_id) {
        return reply.status(400).send({ detail: "project_id query parameter is required" });
      }
      return reply.send(
        projectDecomposition.getCriticalPath(request.authContext!, query.project_id)
      );
    }
  );

  app.get(
    "/project-decomposition/phases",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { project_id?: string };
      if (!query.project_id) {
        return reply.status(400).send({ detail: "project_id query parameter is required" });
      }
      return reply.send(projectDecomposition.getPhases(request.authContext!, query.project_id));
    }
  );

  app.post(
    "/project-decomposition/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { template: ProjectTemplateSpec };
      return reply.send(projectDecomposition.publishTemplate(request.authContext!, body.template));
    }
  );

  app.post(
    "/project-decomposition/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { template_id: string; successor_template_id?: string };
      return reply.send(projectDecomposition.deprecateTemplate(request.authContext!, body));
    }
  );
}
