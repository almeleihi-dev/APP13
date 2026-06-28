import type { FastifyInstance } from "fastify";
import type { RuntimeCoordinatorService } from "../../runtime-experience/runtime-coordinator/application/runtime-coordinator-service.js";

export async function registerRuntimeCoordinatorRoutes(
  app: FastifyInstance,
  runtimeCoordinator: RuntimeCoordinatorService
): Promise<void> {
  app.get(
    "/runtime-coordinator",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeCoordinator.getCoordinator(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-coordinator/status",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeCoordinator.getStatus(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-coordinator/active",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeCoordinator.getActive(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-coordinator/plan",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as {
        generated_at?: string;
        requested_route?: string;
        action?: "next" | "back" | "transition" | "finish" | "reset";
      };
      return reply.send(runtimeCoordinator.getPlan(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-coordinator/map",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeCoordinator.getMap(request.authContext!))
  );

  app.post(
    "/runtime-coordinator/coordinate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        generated_at?: string;
        current_route?: string;
        requested_route?: string;
        action?: "next" | "back" | "transition" | "finish" | "reset";
      };
      return reply.send(runtimeCoordinator.coordinate(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-coordinator/navigate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        generated_at?: string;
        requested_route?: string;
        action?: "next" | "back";
      };
      return reply.send(runtimeCoordinator.navigate(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-coordinator/transition",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string; requested_route?: string };
      return reply.send(runtimeCoordinator.transition(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-coordinator/reset",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeCoordinator.reset(request.authContext!, body));
    }
  );

  app.get(
    "/runtime-coordinator/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeCoordinator.validateRuntime())
  );
}
