import type { FastifyInstance } from "fastify";
import type { ProviderCommandCenterService } from "../../experience/provider-command-center/application/provider-command-center-service.js";

export async function registerProviderCommandCenterRoutes(
  app: FastifyInstance,
  providerCommandCenter: ProviderCommandCenterService
): Promise<void> {
  app.get(
    "/provider-command-center",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await providerCommandCenter.getProviderCommandCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/provider-command-center/revenue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await providerCommandCenter.getRevenueSummary(request.authContext!));
    }
  );

  app.get(
    "/provider-command-center/contracts",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await providerCommandCenter.getContractsSummary(request.authContext!));
    }
  );

  app.get(
    "/provider-command-center/trust",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await providerCommandCenter.getTrustIntegration(request.authContext!));
    }
  );

  app.get(
    "/provider-command-center/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await providerCommandCenter.getOpportunitiesIntegration(request.authContext!)
      );
    }
  );
}
