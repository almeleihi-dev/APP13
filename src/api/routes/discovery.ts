import type { FastifyInstance } from "fastify";
import {
  DiscoveryService,
  parseDiscoveryQuery,
} from "../../discovery/application/discovery-service.js";

export async function registerDiscoveryRoutes(
  app: FastifyInstance,
  discovery: DiscoveryService
): Promise<void> {
  app.get(
    "/discover/providers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = parseDiscoveryQuery(request.query as Record<string, unknown>);
      return reply.send(await discovery.searchProviders(query));
    }
  );

  app.get(
    "/discover/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = parseDiscoveryQuery(request.query as Record<string, unknown>);
      return reply.send(await discovery.searchActions(query));
    }
  );

  app.get(
    "/discover/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = parseDiscoveryQuery(request.query as Record<string, unknown>);
      return reply.send(await discovery.searchRequests(query));
    }
  );

  app.get(
    "/discover/search",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = parseDiscoveryQuery(request.query as Record<string, unknown>);
      return reply.send(await discovery.unifiedSearch(query));
    }
  );
}
