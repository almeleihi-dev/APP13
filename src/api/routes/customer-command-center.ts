import type { FastifyInstance } from "fastify";
import type { CustomerCommandCenterService } from "../../experience/customer-command-center/application/customer-command-center-service.js";

export async function registerCustomerCommandCenterRoutes(
  app: FastifyInstance,
  customerCommandCenter: CustomerCommandCenterService
): Promise<void> {
  app.get(
    "/customer-command-center",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getCustomerCommandCenter(request.authContext!));
    }
  );

  app.get(
    "/customer-command-center/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getRequestsSummary(request.authContext!));
    }
  );

  app.get(
    "/customer-command-center/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getContractsSummary(request.authContext!));
    }
  );

  app.get(
    "/customer-command-center/escrow",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getEscrowSummary(request.authContext!));
    }
  );

  app.get(
    "/customer-command-center/providers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getProviderRelationships(request.authContext!));
    }
  );

  app.get(
    "/customer-command-center/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await customerCommandCenter.getProviderRecommendations(request.authContext!));
    }
  );
}
