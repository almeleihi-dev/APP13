import type { FastifyInstance } from "fastify";
import type { MatchContractConversionService } from "../../conversion/application/match-contract-conversion-service.js";

export async function registerConversionRoutes(
  app: FastifyInstance,
  matchContractConversion: MatchContractConversionService
): Promise<void> {
  app.post(
    "/conversions/offers",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        customer_request_id?: string;
        provider_user_id?: string;
        selected_action_id?: string;
        commercial_terms?: {
          estimated_value?: number;
          estimated_duration?: string;
          title?: string;
          description?: string;
        };
        idempotency_key?: string;
      };

      const created = await matchContractConversion.createContractOffer(
        request.authContext!.userId,
        {
          customer_request_id: body.customer_request_id ?? "",
          provider_user_id: body.provider_user_id ?? "",
          selected_action_id: body.selected_action_id ?? "",
          commercial_terms: body.commercial_terms,
          idempotency_key: body.idempotency_key,
        }
      );

      return reply.status(201).send(created);
    }
  );

  app.get(
    "/conversions/offers/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await matchContractConversion.getContractOffer(request.authContext!.userId, id)
      );
    }
  );

  app.get(
    "/conversions/offers/:id/draft",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await matchContractConversion.getContractDraftPreview(request.authContext!.userId, id)
      );
    }
  );

  app.post(
    "/conversions/offers/:id/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await matchContractConversion.acceptContractOffer(request.authContext!.userId, id)
      );
    }
  );

  app.post(
    "/conversions/offers/:id/cancel",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(
        await matchContractConversion.cancelContractOffer(request.authContext!.userId, id)
      );
    }
  );
}
