import type { FastifyInstance } from "fastify";
import type { ContractEngineService } from "../../contract/application/contract-engine.service.js";

export async function registerContractRoutes(
  app: FastifyInstance,
  contracts: ContractEngineService
): Promise<void> {
  app.get(
    "/v1/contract-templates",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(contracts.listTemplates())
  );

  app.get(
    "/v1/contracts",
    { config: { authRequired: true } },
    async (request, reply) =>
      reply.send(await contracts.listContracts(request.authContext!.userId))
  );

  app.get(
    "/v1/contracts/:contractId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await contracts.getContract(contractId, request.authContext!.userId)
      );
    }
  );

  app.get(
    "/v1/contracts/:contractId/parties",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await contracts.getParties(contractId, request.authContext!.userId)
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/transitions",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      const body = request.body as {
        transition: string;
        party_role?: string;
        document_hash_ack?: string;
        reason?: string;
      };
      const result = await contracts.transitionContract(
        contractId,
        request.authContext!.userId,
        body,
        request.idempotencyKey,
        request.requestId
      );
      if (result.type === "async") {
        return reply.status(202).send(result.operation);
      }
      return reply.send(result.contract);
    }
  );

  app.get(
    "/v1/contracts/:contractId/milestones",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await contracts.listMilestones(contractId, request.authContext!.userId)
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/milestones/:milestoneId/transitions",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, milestoneId } = request.params as {
        contractId: string;
        milestoneId: string;
      };
      const body = request.body as { transition: string };
      return reply.send(
        await contracts.transitionMilestone(
          contractId,
          milestoneId,
          request.authContext!.userId,
          body.transition
        )
      );
    }
  );

  app.get(
    "/v1/contracts/:contractId/attestations",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await contracts.listAttestations(contractId, request.authContext!.userId)
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/attestations/:attestationId/transitions",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, attestationId } = request.params as {
        contractId: string;
        attestationId: string;
      };
      const body = request.body as { transition: string; fulfillment_rating?: string };
      if (body.transition !== "rate" || !body.fulfillment_rating) {
        return reply.status(400).send({ detail: "transition=rate with fulfillment_rating required" });
      }
      return reply.send(
        await contracts.rateAttestation(
          contractId,
          attestationId,
          request.authContext!.userId,
          body.fulfillment_rating
        )
      );
    }
  );
}
