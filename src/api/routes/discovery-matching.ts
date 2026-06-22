import type { FastifyInstance } from "fastify";
import type { DiscoveryMatchingService } from "../../experience/discovery-matching/application/discovery-matching-service.js";

export async function registerDiscoveryMatchingRoutes(
  app: FastifyInstance,
  discoveryMatching: DiscoveryMatchingService
): Promise<void> {
  app.get("/discovery-matching", { config: { authRequired: true } }, async (request, reply) => {
    const query = discoveryMatching.parseQuery(request.query as Record<string, unknown>);
    return reply.send(
      await discoveryMatching.getDiscoveryExperience(request.authContext!, query)
    );
  });

  app.get(
    "/discovery-matching/feed",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = discoveryMatching.parseQuery(request.query as Record<string, unknown>);
      return reply.send(await discoveryMatching.getDiscoveryFeed(request.authContext!, query));
    }
  );

  app.get(
    "/discovery-matching/available-now",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = discoveryMatching.parseQuery(request.query as Record<string, unknown>);
      return reply.send(await discoveryMatching.getAvailableNow(request.authContext!, query));
    }
  );

  app.get(
    "/discovery-matching/requests/:requestId/providers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { requestId } = request.params as { requestId: string };
      return reply.send(
        await discoveryMatching.getProvidersForRequest(request.authContext!, requestId)
      );
    }
  );

  app.get(
    "/discovery-matching/providers/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await discoveryMatching.getRequestsForProvider(request.authContext!)
      );
    }
  );
}
