import type { FastifyInstance } from "fastify";
import type { ExpertNetworkService } from "../../expert-network/application/expert-network-service.js";

export async function registerExpertNetworkRoutes(
  app: FastifyInstance,
  expertNetwork: ExpertNetworkService
): Promise<void> {
  app.get(
    "/expert-network",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getOverview(request.authContext!));
    }
  );

  app.get(
    "/expert-network/experts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.listExperts(request.authContext!));
    }
  );

  app.get(
    "/expert-network/experts/:expertId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { expertId: string };
      const expert = expertNetwork.getExpert(request.authContext!, params.expertId);
      if (!expert) {
        return reply.status(404).send({ error: "Expert not found" });
      }
      return reply.send(expert);
    }
  );

  app.get(
    "/expert-network/roles",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getRoles(request.authContext!));
    }
  );

  app.get(
    "/expert-network/capabilities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getCapabilities(request.authContext!));
    }
  );

  app.get(
    "/expert-network/impact",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getImpact(request.authContext!));
    }
  );

  app.get(
    "/expert-network/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getRecommendations(request.authContext!));
    }
  );

  app.get(
    "/expert-network/visibility",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getVisibility(request.authContext!));
    }
  );

  app.get(
    "/expert-network/contributions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getContributions(request.authContext!));
    }
  );

  app.post(
    "/expert-network/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(expertNetwork.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/expert-network/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(expertNetwork.getStatistics(request.authContext!));
    }
  );
}
