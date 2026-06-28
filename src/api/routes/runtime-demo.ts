import type { FastifyInstance } from "fastify";
import type { RuntimeDemoService } from "../../runtime-experience/runtime-demo/application/runtime-demo-service.js";

export async function registerRuntimeDemoRoutes(
  app: FastifyInstance,
  runtimeDemo: RuntimeDemoService
): Promise<void> {
  app.get(
    "/runtime-demo",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.getDemo(request.authContext!))
  );

  app.get(
    "/runtime-demo/scenarios",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.getScenarios(request.authContext!))
  );

  app.get(
    "/runtime-demo/scenario/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(runtimeDemo.getScenario(request.authContext!, id));
    }
  );

  app.get(
    "/runtime-demo/session",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.getSession(request.authContext!))
  );

  app.get(
    "/runtime-demo/summary",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.getSummary(request.authContext!))
  );

  app.get(
    "/runtime-demo/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeDemo.validateRuntime())
  );

  app.post(
    "/runtime-demo/start",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { scenario_id?: string };
      return reply.send(runtimeDemo.start(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-demo/pause",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.pause(request.authContext!))
  );

  app.post(
    "/runtime-demo/resume",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.resume(request.authContext!))
  );

  app.post(
    "/runtime-demo/restart",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.restart(request.authContext!))
  );

  app.post(
    "/runtime-demo/next",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.next(request.authContext!))
  );

  app.post(
    "/runtime-demo/previous",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.previous(request.authContext!))
  );

  app.post(
    "/runtime-demo/stop",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeDemo.stop(request.authContext!))
  );
}
