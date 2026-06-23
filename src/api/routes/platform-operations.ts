import type { FastifyInstance } from "fastify";
import type { PlatformOperationsService } from "../../experience/platform-operations/application/platform-operations-service.js";

export async function registerPlatformOperationsRoutes(
  app: FastifyInstance,
  platformOperations: PlatformOperationsService
): Promise<void> {
  app.get(
    "/platform-operations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getPlatformOperationsCenter(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getOperationsOverview(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getContractOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/escrow",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getEscrowOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getTrustOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/complaints",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getComplaintOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/execution",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getExecutionOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/financial",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getFinancialOperations(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/system-health",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getSystemHealthView(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getOperationalRiskRegister(request.authContext!));
    }
  );

  app.get(
    "/platform-operations/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await platformOperations.getOperationalRecommendations(request.authContext!));
    }
  );
}
