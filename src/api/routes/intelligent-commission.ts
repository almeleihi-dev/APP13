import type { FastifyInstance } from "fastify";
import type { IntelligentCommissionService } from "../../intelligent-commission/application/intelligent-commission-service.js";
import type { CommissionPolicy } from "../../intelligent-commission/domain/commission-policy.js";

export async function registerIntelligentCommissionRoutes(
  app: FastifyInstance,
  intelligentCommission: IntelligentCommissionService
): Promise<void> {
  app.get(
    "/intelligent-commission",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentCommission.getCenter(request.authContext!));
    }
  );

  app.post(
    "/intelligent-commission/calculate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        policy_id?: string;
        pricing_policy_id?: string;
      };
      return reply.send(intelligentCommission.calculate(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-commission/preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        policy_id?: string;
        pricing_policy_id?: string;
      };
      return reply.send(intelligentCommission.preview(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-commission/explain",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        listing_id?: string;
        blueprint_id?: string;
        version?: string;
        policy_id?: string;
        pricing_policy_id?: string;
      };
      return reply.send(intelligentCommission.explain(request.authContext!, body));
    }
  );

  app.get(
    "/intelligent-commission/policies",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentCommission.getPolicies(request.authContext!));
    }
  );

  app.get(
    "/intelligent-commission/breakdown",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      if (!query.listing_id) {
        return reply.status(400).send({ error: "listing_id is required" });
      }
      return reply.send(
        intelligentCommission.getBreakdown(request.authContext!, query.listing_id)
      );
    }
  );

  app.get(
    "/intelligent-commission/version",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligentCommission.getVersion(request.authContext!));
    }
  );

  app.post(
    "/intelligent-commission/publish-policy",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as CommissionPolicy;
      return reply.send(intelligentCommission.publishPolicy(request.authContext!, body));
    }
  );

  app.post(
    "/intelligent-commission/deprecate-policy",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { policy_id: string };
      return reply.send(intelligentCommission.deprecatePolicy(request.authContext!, body));
    }
  );
}
