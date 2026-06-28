import type { FastifyInstance } from "fastify";
import type { RuntimeStateService } from "../../runtime-experience/runtime-state/application/runtime-state-service.js";

export async function registerRuntimeStateRoutes(
  app: FastifyInstance,
  runtimeState: RuntimeStateService
): Promise<void> {
  app.get(
    "/runtime-state",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeState.getState(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-state/session",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeState.getSession(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-state/history",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeState.getHistory(request.authContext!))
  );

  app.get(
    "/runtime-state/context",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeState.getContext(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-state/phase",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeState.getPhase(request.authContext!, query));
    }
  );

  app.post(
    "/runtime-state/start",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeState.start(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-state/update",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string; action?: "next" | "back" };
      return reply.send(runtimeState.update(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-state/transition",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeState.transition(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-state/finish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeState.finish(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-state/reset",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeState.reset(request.authContext!, body));
    }
  );

  app.get(
    "/runtime-state/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeState.validateRuntime())
  );
}
