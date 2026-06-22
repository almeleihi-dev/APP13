import type { FastifyInstance } from "fastify";
import type { ContractJourneyService } from "../../experience/contract-journey/application/contract-journey-service.js";

export async function registerContractJourneyRoutes(
  app: FastifyInstance,
  contractJourney: ContractJourneyService
): Promise<void> {
  app.get(
    "/journeys/:contractId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(await contractJourney.getJourney(request.authContext!, contractId));
    }
  );

  app.get(
    "/journeys/:contractId/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(await contractJourney.getTimeline(request.authContext!, contractId));
    }
  );

  app.get(
    "/journeys/:contractId/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(await contractJourney.getProgress(request.authContext!, contractId));
    }
  );
}
