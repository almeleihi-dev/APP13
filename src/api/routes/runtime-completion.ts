import type { FastifyInstance } from "fastify";
import type { RuntimeCompletionService } from "../../runtime-experience/runtime-completion/application/runtime-completion-service.js";

export async function registerRuntimeCompletionRoutes(
  app: FastifyInstance,
  runtimeCompletion: RuntimeCompletionService
): Promise<void> {
  app.get(
    "/runtime-completion",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getCompletion(request.authContext!))
  );

  app.get(
    "/runtime-completion/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-completion/certification",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getCertification(request.authContext!))
  );

  app.get(
    "/runtime-completion/statistics",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getStatistics(request.authContext!))
  );

  app.get(
    "/runtime-completion/architecture",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getArchitecture(request.authContext!))
  );

  app.get(
    "/runtime-completion/executive-summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.getExecutiveSummary(request.authContext!))
  );

  app.get(
    "/runtime-completion/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeCompletion.validateRuntime())
  );

  app.post(
    "/runtime-completion/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCompletion.refresh(request.authContext!))
  );
}
