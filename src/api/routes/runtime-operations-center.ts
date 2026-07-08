import type { FastifyInstance } from "fastify";
import type { RuntimeOperationsCenterService } from "../../runtime-experience/runtime-operations-center/application/runtime-operations-center-service.js";

export async function registerRuntimeOperationsCenterRoutes(
  app: FastifyInstance,
  runtimeOperationsCenter: RuntimeOperationsCenterService
): Promise<void> {
  app.get(
    "/runtime-operations-center",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getOperationsCenter(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/health",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getHealth(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/alerts",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getAlerts(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/status",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.getStatus(request.authContext!))
  );

  app.get(
    "/runtime-operations-center/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeOperationsCenter.validateRuntime())
  );

  app.post(
    "/runtime-operations-center/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeOperationsCenter.refresh(request.authContext!))
  );
}
