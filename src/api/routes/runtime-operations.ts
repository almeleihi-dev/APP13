import type { FastifyInstance } from "fastify";
import type { RuntimeOperationsService } from "../../runtime-experience/runtime-operations/application/runtime-operations-service.js";

export async function registerRuntimeOperationsRoutes(
  app: FastifyInstance,
  runtimeOperations: RuntimeOperationsService
): Promise<void> {
  app.get(
    "/runtime-operations",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getOperations(request.authContext!))
  );

  app.get(
    "/runtime-operations/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-operations/health",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getHealth(request.authContext!))
  );

  app.get(
    "/runtime-operations/alerts",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getAlerts(request.authContext!))
  );

  app.get(
    "/runtime-operations/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-operations/status",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.getStatus(request.authContext!))
  );

  app.get(
    "/runtime-operations/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeOperations.validateRuntime())
  );

  app.post(
    "/runtime-operations/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperations.refresh(request.authContext!))
  );
}
