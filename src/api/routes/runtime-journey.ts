import type { FastifyInstance } from "fastify";
import type { RuntimeJourneyService } from "../../runtime-experience/runtime-journey/application/runtime-journey-service.js";

export async function registerRuntimeJourneyRoutes(
  app: FastifyInstance,
  runtimeJourney: RuntimeJourneyService
): Promise<void> {
  app.get(
    "/runtime-journey",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeJourney.getJourney(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-journey/launch",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeJourney.launch(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-journey/current",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeJourney.getCurrent(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-journey/session",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(runtimeJourney.getSession(request.authContext!, query));
    }
  );

  app.get(
    "/runtime-journey/history",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeJourney.getHistory(_request.authContext!))
  );

  app.post(
    "/runtime-journey/start",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeJourney.start(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-journey/next",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeJourney.next(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-journey/back",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeJourney.back(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-journey/finish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeJourney.finish(request.authContext!, body));
    }
  );

  app.post(
    "/runtime-journey/reset",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(runtimeJourney.reset(request.authContext!, body));
    }
  );

  app.get(
    "/runtime-journey/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(runtimeJourney.validateRuntime())
  );
}
