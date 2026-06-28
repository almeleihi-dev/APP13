import type { FastifyInstance } from "fastify";
import type { RuntimeFinalReadinessService } from "../../runtime-experience/runtime-final-readiness/application/runtime-final-readiness-service.js";

export async function registerRuntimeFinalReadinessRoutes(
  app: FastifyInstance,
  runtimeFinalReadiness: RuntimeFinalReadinessService
): Promise<void> {
  app.get(
    "/runtime-final-readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getFinalReadiness(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/risks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getRisks(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-final-readiness/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeFinalReadiness.validateRuntime())
  );

  app.post(
    "/runtime-final-readiness/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeFinalReadiness.refresh(request.authContext!))
  );
}
