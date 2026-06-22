import type { FastifyInstance } from "fastify";
import type { CustomerDashboardService } from "../../customer-experience/application/customer-dashboard-service.js";

export async function registerCustomerDashboardRoutes(
  app: FastifyInstance,
  customerDashboard: CustomerDashboardService
): Promise<void> {
  app.get(
    "/customers/:userId/dashboard",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(
        await customerDashboard.getDashboard(request.authContext!.userId, userId)
      );
    }
  );

  app.get(
    "/customers/:userId/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(
        await customerDashboard.listRequests(request.authContext!.userId, userId)
      );
    }
  );

  app.get(
    "/customers/:userId/offers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(await customerDashboard.listOffers(request.authContext!.userId, userId));
    }
  );

  app.get(
    "/customers/:userId/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      return reply.send(
        await customerDashboard.listContracts(request.authContext!.userId, userId)
      );
    }
  );
}
