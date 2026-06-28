import type { FastifyInstance } from "fastify";
import type { RuntimeProductionApprovalService } from "../../runtime-experience/runtime-production-approval/application/runtime-production-approval-service.js";

export async function registerRuntimeProductionApprovalRoutes(
  app: FastifyInstance,
  runtimeProductionApproval: RuntimeProductionApprovalService
): Promise<void> {
  app.get(
    "/runtime-production-approval",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getApproval(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/decision",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getDecision(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-production-approval/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeProductionApproval.validateRuntime())
  );

  app.post(
    "/runtime-production-approval/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeProductionApproval.refresh(request.authContext!))
  );
}
