import type { FastifyInstance } from "fastify";
import type { RuntimeReadinessConsoleService } from "../../runtime-experience/runtime-readiness/application/runtime-readiness-console-service.js";

export async function registerRuntimeReadinessRoutes(
  app: FastifyInstance,
  runtimeReadiness: RuntimeReadinessConsoleService
): Promise<void> {
  app.get(
    "/runtime-readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getReadiness(request.authContext!))
  );

  app.get(
    "/runtime-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getOverview(request.authContext!))
  );

  app.get(
    "/runtime-readiness/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-readiness/gates",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getGates(request.authContext!))
  );

  app.get(
    "/runtime-readiness/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-readiness/command-board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.getCommandBoard(request.authContext!))
  );

  app.get(
    "/runtime-readiness/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeReadiness.validateRuntime())
  );

  app.post(
    "/runtime-readiness/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeReadiness.refresh(request.authContext!))
  );
}
