import type { FastifyInstance } from "fastify";
import type { ActionService } from "../../action/application/action-service.js";
import type { ContractEngineService } from "../../contract/application/contract-engine.service.js";
import type { TekrrDimension } from "../../action/domain/index.js";

export async function registerActionRoutes(
  app: FastifyInstance,
  actions: ActionService
): Promise<void> {
  app.get(
    "/v1/action-types",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(actions.listActionTypes())
  );

  app.post(
    "/v1/actions",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const body = request.body as {
        action_type_code: string;
        title: string;
        description?: string;
      };
      const result = await actions.createAction(request.authContext!.userId, body);
      return reply.status(201).send(result);
    }
  );

  app.get(
    "/v1/actions",
    { config: { authRequired: true } },
    async (request, reply) =>
      reply.send(await actions.listActions(request.authContext!.userId))
  );

  app.get(
    "/v1/actions/:actionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { actionId } = request.params as { actionId: string };
      return reply.send(
        await actions.getAction(actionId, request.authContext!.userId)
      );
    }
  );

  app.patch(
    "/v1/actions/:actionId/tekrr/dimensions/:dimension",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { actionId, dimension } = request.params as {
        actionId: string;
        dimension: TekrrDimension;
      };
      const body = request.body as Record<string, unknown>;
      return reply.send(
        await actions.updateTekrrDimension(
          actionId,
          request.authContext!.userId,
          dimension,
          body
        )
      );
    }
  );

  app.post(
    "/v1/actions/:actionId/transitions",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { actionId } = request.params as { actionId: string };
      const body = request.body as { transition: string };
      return reply.send(
        await actions.transitionAction(
          actionId,
          request.authContext!.userId,
          body.transition
        )
      );
    }
  );

  app.post(
    "/v1/actions/:actionId/provider-invite",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { actionId } = request.params as { actionId: string };
      const body = request.body as { provider_id: string };
      return reply.send(
        await actions.assignProvider(
          actionId,
          request.authContext!.userId,
          body.provider_id
        )
      );
    }
  );
}

export async function registerContractActionRoutes(
  app: FastifyInstance,
  contracts: ContractEngineService
): Promise<void> {
  app.post(
    "/v1/actions/:actionId/contract/generate",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { actionId } = request.params as { actionId: string };
      const result = await contracts.generateContract(
        actionId,
        request.authContext!.userId,
        request.idempotencyKey
      );
      return reply.status(result.created ? 201 : 200).send(result.contract);
    }
  );
}
