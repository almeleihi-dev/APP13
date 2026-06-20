import type { FastifyInstance } from "fastify";
import type { ContractEngineService } from "../../../contract/application/contract-engine.service.js";

export async function registerInternalContractRoutes(
  app: FastifyInstance,
  contracts: ContractEngineService
): Promise<void> {
  app.post(
    "/internal/v1/contracts/:contractId/materialize",
    { config: { authRequired: false, serviceAuth: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      const body = request.body as { actor_user_id?: string };
      const actorUserId = body.actor_user_id ?? request.actorUserId ?? "system";
      const result = await contracts.materialize(
        contractId,
        actorUserId,
        request.idempotencyKey
      );
      return reply.status(202).send({
        id: request.idempotencyKey ?? contractId,
        status: "completed",
        resource_type: "contract",
        resource_id: result.contract_id,
      });
    }
  );

  app.post(
    "/internal/v1/contracts/:contractId/activate",
    { config: { authRequired: false, serviceAuth: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      const body = request.body as { actor_user_id?: string };
      const actorUserId = body.actor_user_id ?? request.actorUserId ?? "system";
      const op = await contracts.enqueueActivateViaInternal(
        contractId,
        actorUserId,
        request.idempotencyKey,
        request.requestId
      );
      return reply.status(202).send(op);
    }
  );

  app.post(
    "/internal/v1/contracts/:contractId/complete",
    { config: { authRequired: false, serviceAuth: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      const body = request.body as { actor_user_id?: string };
      const actorUserId = body.actor_user_id ?? request.actorUserId ?? "system";
      const op = await contracts.enqueueComplete(
        contractId,
        actorUserId,
        request.idempotencyKey,
        request.requestId
      );
      return reply.status(202).send(op);
    }
  );

  app.post(
    "/internal/v1/contracts/:contractId/transitions/issue-path",
    { config: { authRequired: false, serviceAuth: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      const body = request.body as { transition: string; reason?: string; actor_user_id?: string };
      const actorUserId = body.actor_user_id ?? request.actorUserId ?? "system";
      const result = await contracts.applyIssuePathTransition(contractId, actorUserId, body);
      return reply.send(result);
    }
  );
}
