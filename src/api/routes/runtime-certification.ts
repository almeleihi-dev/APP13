import type { FastifyInstance } from "fastify";
import type { RuntimeCertificationService } from "../../runtime-experience/runtime-certification/application/runtime-certification-service.js";

export async function registerRuntimeCertificationRoutes(
  app: FastifyInstance,
  runtimeCertification: RuntimeCertificationService
): Promise<void> {
  app.get(
    "/runtime-certification",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getCertification(request.authContext!))
  );

  app.get(
    "/runtime-certification/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-certification/status",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getStatus(request.authContext!))
  );

  app.get(
    "/runtime-certification/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-certification/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-certification/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-certification/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeCertification.validateRuntime())
  );

  app.post(
    "/runtime-certification/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCertification.refresh(request.authContext!))
  );
}
