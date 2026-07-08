import type { FastifyInstance } from "fastify";
import type { AdminConsoleService } from "../../operations/application/admin-console-service.js";

export async function registerAdminConsoleRoutes(
  app: FastifyInstance,
  adminConsole: AdminConsoleService
): Promise<void> {
  app.get(
    "/admin/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getOverview(request.authContext!));
    }
  );

  app.get(
    "/admin/requests",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getRequests(request.authContext!));
    }
  );

  app.get(
    "/admin/offers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getOffers(request.authContext!));
    }
  );

  app.get(
    "/admin/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getContracts(request.authContext!));
    }
  );

  app.get(
    "/admin/escrow",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getEscrow(request.authContext!));
    }
  );

  app.get(
    "/admin/issues",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getIssues(request.authContext!));
    }
  );

  app.get(
    "/admin/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getTrust(request.authContext!));
    }
  );

  app.get(
    "/admin/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await adminConsole.getRisks(request.authContext!));
    }
  );
}
