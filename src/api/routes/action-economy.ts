import type { FastifyInstance } from "fastify";
import type { ActionEconomyService } from "../../experience/action-economy/application/action-economy-service.js";

export async function registerActionEconomyRoutes(
  app: FastifyInstance,
  actionEconomy: ActionEconomyService
): Promise<void> {
  app.get("/action-economy", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await actionEconomy.getActionEconomy(request.authContext!));
  });

  app.get(
    "/action-economy/actions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await actionEconomy.getActions(request.authContext!));
    }
  );

  app.get(
    "/action-economy/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await actionEconomy.getOpportunities(request.authContext!));
    }
  );

  app.get(
    "/action-economy/earnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await actionEconomy.getEarnings(request.authContext!));
    }
  );
}
