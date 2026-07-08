import type { FastifyInstance } from "fastify";
import type { EscrowPaymentExperienceService } from "../../experience/escrow-payment/application/escrow-payment-experience-service.js";

export async function registerEscrowPaymentRoutes(
  app: FastifyInstance,
  escrowPaymentExperience: EscrowPaymentExperienceService
): Promise<void> {
  app.get(
    "/escrow-payment/:contractId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await escrowPaymentExperience.getEscrowPaymentExperience(
          request.authContext!,
          contractId
        )
      );
    }
  );

  app.get(
    "/escrow-payment/:contractId/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await escrowPaymentExperience.getFundingProgress(request.authContext!, contractId)
      );
    }
  );

  app.get(
    "/escrow-payment/:contractId/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await escrowPaymentExperience.getFinancialTimeline(request.authContext!, contractId)
      );
    }
  );

  app.get(
    "/escrow-payment/:contractId/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await escrowPaymentExperience.getFinancialReadiness(request.authContext!, contractId)
      );
    }
  );
}
