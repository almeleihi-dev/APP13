import type { FastifyInstance } from "fastify";
import type { RuntimeRegistryService } from "../../runtime-experience/runtime-registry/application/runtime-registry-service.js";

export async function registerRuntimeRegistryRoutes(
  app: FastifyInstance,
  runtimeRegistry: RuntimeRegistryService
): Promise<void> {
  app.get(
    "/runtime-registry",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeRegistry.getRegistry(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-registry/catalog",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeRegistry.getCatalog(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-registry/experiences",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRegistry.getExperiences(request.authContext!))
  );

  app.get(
    "/runtime-registry/experience/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(runtimeRegistry.getExperience(request.authContext!, id));
    }
  );

  app.get(
    "/runtime-registry/map",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRegistry.getMap(request.authContext!))
  );

  app.get(
    "/runtime-registry/dependencies",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRegistry.getDependencies(request.authContext!))
  );

  app.get(
    "/runtime-registry/capabilities",
    { config: { authRequired: true } },
    async (request, reply) => reply.send(runtimeRegistry.getCapabilities(request.authContext!))
  );

  app.post(
    "/runtime-registry/reload",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeRegistry.reload(request.authContext!, body));
    }
  );

  app.get(
    "/runtime-registry/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeRegistry.validateRuntime())
  );
}
