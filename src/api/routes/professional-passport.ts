import type { FastifyInstance } from "fastify";
import type { ProfessionalPassportService } from "../../experience/professional-passport/application/professional-passport-service.js";

export async function registerProfessionalPassportRoutes(
  app: FastifyInstance,
  professionalPassport: ProfessionalPassportService
): Promise<void> {
  app.get("/professional-passport", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(
      await professionalPassport.getProfessionalPassport(request.authContext!)
    );
  });

  app.get(
    "/professional-passport/level",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalPassport.getPassportLevel(request.authContext!));
    }
  );

  app.get(
    "/professional-passport/performance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalPassport.getPerformance(request.authContext!));
    }
  );

  app.get(
    "/professional-passport/credentials",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await professionalPassport.getCredentials(request.authContext!));
    }
  );

  app.get(
    "/professional-passport/public",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { user_id?: string };
      const userId = query.user_id?.trim() || request.authContext!.userId;
      return reply.send(await professionalPassport.getPublicPassport(userId));
    }
  );
}
