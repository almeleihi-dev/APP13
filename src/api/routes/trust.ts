import type { FastifyInstance } from "fastify";
import type { TrustExperienceService } from "../../experience/trust-experience-service.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import { notFound } from "../../shared/errors/index.js";

export async function registerTrustExperienceRoutes(
  app: FastifyInstance,
  trustExperience: TrustExperienceService
): Promise<void> {
  app.get(
    "/trust/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getTrustCenter(id));
    }
  );

  app.get(
    "/trust/provider/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getProviderReport(id));
    }
  );

  app.get(
    "/trust/:id/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await trustExperience.getTimeline(id));
    }
  );
}

export async function registerTrustReputationRoutes(
  app: FastifyInstance,
  trustScore: TrustScoreService
): Promise<void> {
  app.get(
    "/trust/profile/:userId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const profile = await trustScore.getProfileByUserId(userId);
      if (!profile) throw notFound();
      return reply.send(profile);
    }
  );

  app.get(
    "/trust/frame/:userId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const frame = await trustScore.getFrameByUserId(userId);
      if (!frame) throw notFound();
      return reply.send(frame);
    }
  );

  app.get(
    "/trust/history/:userId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const history = await trustScore.getHistoryByUserId(userId);
      if (!history) throw notFound();
      return reply.send(history);
    }
  );
}
