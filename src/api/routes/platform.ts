import type { FastifyInstance } from "fastify";
import type { PlatformExperienceService } from "../../experience/platform-experience-service.js";

export async function registerPlatformExperienceRoutes(
  app: FastifyInstance,
  platformExperience: PlatformExperienceService
): Promise<void> {
  app.get(
    "/platform/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { platform_id?: string };
      return reply.send(
        await platformExperience.getHome(request.authContext!.userId, query.platform_id?.trim())
      );
    }
  );

  app.get(
    "/platform/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { platform_id?: string };
      return reply.send(
        await platformExperience.getOverview(request.authContext!.userId, query.platform_id?.trim())
      );
    }
  );
}
