import type { FastifyInstance } from "fastify";
import type { ProviderDashboardService } from "../../provider-workspace/application/provider-dashboard-service.js";

export async function registerProviderDashboardRoutes(
  app: FastifyInstance,
  providerDashboard: ProviderDashboardService
): Promise<void> {
  app.get(
    "/providers/:userId/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(
        await providerDashboard.getDashboard(request.authContext!.userId, userId)
      );
    }
  );

  app.get(
    "/providers/:userId/offers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(await providerDashboard.listOffers(request.authContext!.userId, userId));
    }
  );

  app.get(
    "/providers/:userId/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(
        await providerDashboard.listContracts(request.authContext!.userId, userId)
      );
    }
  );

  app.get(
    "/providers/:userId/earnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(await providerDashboard.getEarnings(request.authContext!.userId, userId));
    }
  );
}
