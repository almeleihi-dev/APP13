import type { FastifyInstance } from "fastify";
import type { ProviderProfileService } from "../../provider-experience/application/provider-profile-service.js";
import { notFound } from "../../shared/errors/index.js";

export async function registerProviderRoutes(
  app: FastifyInstance,
  providerProfile: ProviderProfileService
): Promise<void> {
  app.get(
    "/providers/:userId/profile",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const profile = await providerProfile.getPublicProfileByUserId(userId);
      if (!profile) throw notFound();
      return reply.send(profile);
    }
  );
}
