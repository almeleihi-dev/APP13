import type { FastifyInstance } from "fastify";
import type { LiveFrameExperienceService } from "../../experience/live-frame/application/live-frame-experience-service.js";

export async function registerLiveFrameRoutes(
  app: FastifyInstance,
  liveFrameExperience: LiveFrameExperienceService
): Promise<void> {
  app.get("/live-frame", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await liveFrameExperience.getLiveFrame(request.authContext!));
  });

  app.get("/live-frame/progress", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await liveFrameExperience.getProgress(request.authContext!));
  });

  app.get("/live-frame/evolution", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await liveFrameExperience.getEvolution(request.authContext!));
  });

  app.get("/live-frame/public", { config: { authRequired: true } }, async (request, reply) => {
    const query = request.query as { user_id?: string };
    const userId = query.user_id?.trim() || request.authContext!.userId;
    return reply.send(await liveFrameExperience.getPublic(userId));
  });
}
