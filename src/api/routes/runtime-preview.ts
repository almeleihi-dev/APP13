import type { FastifyInstance } from "fastify";
import type { RuntimePreviewService } from "../../runtime-experience/runtime-preview/application/runtime-preview-service.js";

export async function registerRuntimePreviewRoutes(
  app: FastifyInstance,
  runtimePreview: RuntimePreviewService
): Promise<void> {
  app.get(
    "/runtime-preview",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimePreview.getPreview(request.authContext!))
  );

  app.get(
    "/runtime-preview/coverage",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimePreview.getCoverage(request.authContext!))
  );

  app.get(
    "/runtime-preview/target/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(runtimePreview.getTarget(request.authContext!, id));
    }
  );

  app.get(
    "/runtime-preview/session",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimePreview.getSession(request.authContext!))
  );

  app.get(
    "/runtime-preview/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimePreview.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-preview/all",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimePreview.getAllPreviews(request.authContext!))
  );

  app.get(
    "/runtime-preview/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimePreview.validateRuntime())
  );
}
