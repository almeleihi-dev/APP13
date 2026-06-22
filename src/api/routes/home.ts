import type { FastifyInstance } from "fastify";
import type { HomeExperienceService } from "../../experience/application/home-experience-service.js";

export async function registerHomeRoutes(
  app: FastifyInstance,
  homeExperience: HomeExperienceService
): Promise<void> {
  app.get("/home", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await homeExperience.getHome(request.authContext!));
  });

  app.get("/home/customer", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await homeExperience.getCustomerHome(request.authContext!));
  });

  app.get("/home/provider", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await homeExperience.getProviderHome(request.authContext!));
  });
}
