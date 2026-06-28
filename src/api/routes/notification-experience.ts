import type { FastifyInstance } from "fastify";
import type { NotificationExperienceService } from "../../runtime-experience/notification/application/notification-experience-service.js";

export async function registerNotificationExperienceRoutes(
  app: FastifyInstance,
  notificationExperience: NotificationExperienceService
): Promise<void> {
  app.get(
    "/notification-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        notificationExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.get(
    "/notification-experience/list",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; filter?: string };
      return reply.send(
        notificationExperience.getList(request.authContext!, {
          generated_at: query.generated_at,
          filter: query.filter,
        })
      );
    }
  );

  app.get(
    "/notification-experience/detail/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { generated_at?: string };
      return reply.send(notificationExperience.getDetail(request.authContext!, id, query));
    }
  );

  app.get(
    "/notification-experience/filters",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(notificationExperience.getFilters(request.authContext!, query));
    }
  );

  app.get(
    "/notification-experience/settings",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(notificationExperience.getSettings(request.authContext!, query));
    }
  );

  app.get(
    "/notification-experience/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(notificationExperience.validateRuntime())
  );

  app.post(
    "/notification-experience/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(notificationExperience.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/notification-experience/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(notificationExperience.getHome(request.authContext!, query));
    }
  );
}
