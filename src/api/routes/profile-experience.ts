import type { FastifyInstance } from "fastify";
import type { ProfileExperienceService } from "../../runtime-experience/profile/application/profile-experience-service.js";

export async function registerProfileExperienceRoutes(
  app: FastifyInstance,
  profileExperience: ProfileExperienceService
): Promise<void> {
  app.get(
    "/profile-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        profileExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.get(
    "/profile-experience/identity",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getIdentity(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/live-frame",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getLiveFrame(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/achievements",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getAchievements(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/analytics",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getAnalytics(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/history",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getHistory(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/settings",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getSettings(request.authContext!, query));
    }
  );

  app.get(
    "/profile-experience/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(profileExperience.validateRuntime())
  );

  app.post(
    "/profile-experience/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(profileExperience.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/profile-experience/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(profileExperience.getHome(request.authContext!, query));
    }
  );
}
