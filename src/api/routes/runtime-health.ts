import type { FastifyInstance } from "fastify";
import type { RuntimeHealthService } from "../../runtime-experience/runtime-health/application/runtime-health-service.js";

export async function registerRuntimeHealthRoutes(
  app: FastifyInstance,
  runtimeHealth: RuntimeHealthService
): Promise<void> {
  app.get(
    "/runtime-health",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeHealth.getHealth(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-health/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeHealth.getDashboard(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-health/diagnostics",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeHealth.getDiagnostics(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-health/experience/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeHealth.getExperienceHealth(request.authContext!, id, query));
    }
  );

  app.get(
    "/runtime-health/validation",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeHealth.getValidation(request.authContext!))
  );

  app.post(
    "/runtime-health/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeHealth.refresh(request.authContext!, body));
    }
  );
}
