import type { FastifyInstance } from "fastify";
import type { RuntimeLauncherService } from "../../runtime-experience/runtime-launcher/application/runtime-launcher-service.js";

export async function registerRuntimeLauncherRoutes(
  app: FastifyInstance,
  runtimeLauncher: RuntimeLauncherService
): Promise<void> {
  app.get(
    "/runtime-launcher",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getLauncher(request.authContext!))
  );

  app.get(
    "/runtime-launcher/modes",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getModes(request.authContext!))
  );

  app.get(
    "/runtime-launcher/readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getReadiness(request.authContext!))
  );

  app.get(
    "/runtime-launcher/checklist",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getChecklist(request.authContext!))
  );

  app.get(
    "/runtime-launcher/handoff",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getHandoff(request.authContext!))
  );

  app.get(
    "/runtime-launcher/blockers",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getBlockers(request.authContext!))
  );

  app.get(
    "/runtime-launcher/warnings",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.getWarnings(request.authContext!))
  );

  app.get(
    "/runtime-launcher/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeLauncher.validateRuntime())
  );

  app.post(
    "/runtime-launcher/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLauncher.refresh(request.authContext!))
  );
}
