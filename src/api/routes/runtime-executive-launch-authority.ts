import type { FastifyInstance } from "fastify";
import type { RuntimeExecutiveLaunchAuthorityService } from "../../runtime-experience/runtime-executive-launch-authority/application/runtime-executive-launch-authority-service.js";

export async function registerRuntimeExecutiveLaunchAuthorityRoutes(
  app: FastifyInstance,
  runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService
): Promise<void> {
  app.get(
    "/runtime-executive-launch-authority",
    { config: { authRequired: true } },
    async (request, reply) =>
      reply.send(runtimeExecutiveLaunchAuthority.getExecutiveLaunchAuthority(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.getDashboard(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/readiness",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.getReadiness(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/decision",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.getDecision(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/board",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.getBoard(request.authContext!))
  );

  app.get(
    "/runtime-executive-launch-authority/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeExecutiveLaunchAuthority.validateRuntime())
  );

  app.post(
    "/runtime-executive-launch-authority/refresh",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeExecutiveLaunchAuthority.refresh(request.authContext!))
  );
}
