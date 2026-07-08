import type { FastifyInstance } from "fastify";
import type { RuntimeLaunchReadinessAuthorityService } from "../../runtime-experience/runtime-launch-readiness-authority/application/runtime-launch-readiness-authority-service.js";

export async function registerRuntimeLaunchReadinessAuthorityRoutes(
  app: FastifyInstance,
  runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService
): Promise<void> {
  app.get(
    "/runtime-launch-readiness-authority",
    { config: { authRequired: true } },
    async (request, reply) =>
      reply.send(runtimeLaunchReadinessAuthority.getLaunchReadinessAuthority(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/checks",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.getChecks(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/decision",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.getDecision(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-launch-readiness-authority/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeLaunchReadinessAuthority.validateRuntime())
  );

  app.post(
    "/runtime-launch-readiness-authority/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeLaunchReadinessAuthority.refresh(request.authContext!))
  );
}
