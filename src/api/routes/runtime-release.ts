import type { FastifyInstance } from "fastify";
import type { RuntimeReleaseService } from "../../runtime-experience/runtime-release/application/runtime-release-service.js";

export async function registerRuntimeReleaseRoutes(
  app: FastifyInstance,
  runtimeRelease: RuntimeReleaseService
): Promise<void> {
  app.get(
    "/runtime-release",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getRelease(request.authContext!))
  );

  app.get(
    "/runtime-release/readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getReadiness(request.authContext!))
  );

  app.get(
    "/runtime-release/checklist",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getChecklist(request.authContext!))
  );

  app.get(
    "/runtime-release/report",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getReport(request.authContext!))
  );

  app.get(
    "/runtime-release/candidate",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getCandidate(request.authContext!))
  );

  app.get(
    "/runtime-release/certification",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getCertification(request.authContext!))
  );

  app.get(
    "/runtime-release/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-release/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeRelease.validateRuntime())
  );

  app.post(
    "/runtime-release/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRelease.refresh(request.authContext!))
  );
}
