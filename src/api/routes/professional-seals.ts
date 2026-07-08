import type { FastifyInstance } from "fastify";
import type { ProfessionalSealsService } from "../../experience/professional-seals/application/professional-seals-service.js";

export async function registerProfessionalSealsRoutes(
  app: FastifyInstance,
  professionalSeals: ProfessionalSealsService
): Promise<void> {
  app.get("/professional-seals", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(
      await professionalSeals.getProfessionalSealsProfile(request.authContext!)
    );
  });

  app.get(
    "/professional-seals/categories",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalSeals.getSealsByCategory(request.authContext!));
    }
  );

  app.get(
    "/professional-seals/points",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalSeals.getSealPoints(request.authContext!));
    }
  );

  app.get(
    "/professional-seals/economy",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalSeals.getVerificationEconomy(request.authContext!));
    }
  );

  app.get(
    "/professional-seals/public",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { user_id?: string };
      const userId = query.user_id?.trim() || request.authContext!.userId;
      return reply.send(await professionalSeals.getPublicSeals(userId));
    }
  );
}
