import type { FastifyInstance } from "fastify";
import type { RuntimeLaunchControlService } from "../../runtime-experience/runtime-launch-control/application/runtime-launch-control-service.js";

export async function registerRuntimeLaunchControlRoutes(
  app: FastifyInstance,
  runtimeLaunchControl: RuntimeLaunchControlService
): Promise<void> {
  app.get(
    "/runtime-launch-control",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getLaunchControl(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getReadiness(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-launch-control/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeLaunchControl.validateRuntime())
  );

  app.post(
    "/runtime-launch-control/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchControl.refresh(request.authContext!))
  );
}
