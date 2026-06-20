import type { FastifyInstance } from "fastify";
import type { ProfileService } from "../../identity/application/profile-service.js";

export async function registerIdentityRoutes(
  app: FastifyInstance,
  profile: ProfileService
): Promise<void> {
  app.get(
    "/v1/me",
    { config: { authRequired: true } },
    async (request, reply) => {
      const me = await profile.getMeWithDisplayName(request.authContext!.userId);
      return reply.send(me);
    }
  );

  app.patch(
    "/v1/me",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { display_preferences?: Record<string, unknown> };
      const result = await profile.updateMe(request.authContext!.userId, body);
      return reply.send(result);
    }
  );

  app.get(
    "/v1/customers/:customerId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { customerId } = request.params as { customerId: string };
      const customer = await profile.getCustomer(
        customerId,
        request.authContext!.userId
      );
      return reply.send(customer);
    }
  );

  app.patch(
    "/v1/customers/:customerId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { customerId } = request.params as { customerId: string };
      const body = request.body as { display_preferences?: Record<string, unknown> };
      const result = await profile.updateCustomer(
        customerId,
        request.authContext!.userId,
        body
      );
      return reply.send(result);
    }
  );

  app.get(
    "/v1/providers/:providerId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { providerId } = request.params as { providerId: string };
      const provider = await profile.getProvider(providerId);
      return reply.send(provider);
    }
  );

  app.patch(
    "/v1/providers/:providerId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { providerId } = request.params as { providerId: string };
      const body = request.body as {
        display_name?: string;
        bio?: string;
        business_name?: string;
      };
      const result = await profile.updateProvider(
        providerId,
        request.authContext!.userId,
        body
      );
      return reply.send(result);
    }
  );
}
