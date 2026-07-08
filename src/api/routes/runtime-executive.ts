import type { FastifyInstance } from "fastify";
import type { RuntimeExecutiveDashboardService } from "../../runtime-experience/runtime-executive/application/runtime-executive-dashboard-service.js";

export async function registerRuntimeExecutiveRoutes(
  app: FastifyInstance,
  runtimeExecutive: RuntimeExecutiveDashboardService
): Promise<void> {
  app.get(
    "/runtime-executive",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getExecutive(request.authContext!))
  );

  app.get(
    "/runtime-executive/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-executive/kpis",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getKpis(request.authContext!))
  );

  app.get(
    "/runtime-executive/insights",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getInsights(request.authContext!))
  );

  app.get(
    "/runtime-executive/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-executive/command-board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.getCommandBoard(request.authContext!))
  );

  app.get(
    "/runtime-executive/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeExecutive.validateRuntime())
  );

  app.post(
    "/runtime-executive/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutive.refresh(request.authContext!))
  );
}
