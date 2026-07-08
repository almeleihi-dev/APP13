import type { FastifyInstance } from "fastify";
import type { LiveTrustFrameService } from "../../experience/live-trust-frame/application/live-trust-frame-service.js";

export async function registerLiveTrustFrameRoutes(
  app: FastifyInstance,
  liveTrustFrame: LiveTrustFrameService
): Promise<void> {
  app.get("/live-trust-frame", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await liveTrustFrame.getLiveTrustFrame(request.authContext!));
  });

  app.get(
    "/live-trust-frame/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await liveTrustFrame.getFrameScore(request.authContext!));
    }
  );

  app.get(
    "/live-trust-frame/level",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await liveTrustFrame.getFrameLevel(request.authContext!));
    }
  );

  app.get(
    "/live-trust-frame/signals",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await liveTrustFrame.getFrameSignals(request.authContext!));
    }
  );

  app.get(
    "/live-trust-frame/public",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { user_id?: string };
      const userId = query.user_id?.trim() || request.authContext!.userId;
      return reply.send(await liveTrustFrame.getPublicLiveTrustFrame(userId));
    }
  );
}
