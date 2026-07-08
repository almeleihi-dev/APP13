import type { FastifyInstance } from "fastify";
import type { EventInboxService } from "../../notifications/application/event-inbox-service.js";

export async function registerNotificationRoutes(
  app: FastifyInstance,
  eventInbox: EventInboxService
): Promise<void> {
  app.get(
    "/notifications",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { limit?: string; unread_only?: string };
      const limit = query.limit ? Number.parseInt(query.limit, 10) : undefined;
      return reply.send(
        await eventInbox.listNotifications(request.authContext!, {
          limit: Number.isFinite(limit) ? limit : undefined,
          unreadOnly: query.unread_only === "true",
        })
      );
    }
  );

  app.get(
    "/notifications/unread",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await eventInbox.getUnreadSummary(request.authContext!));
    }
  );

  app.get(
    "/notifications/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await eventInbox.getNotification(request.authContext!, id));
    }
  );

  app.post(
    "/notifications/:id/read",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return reply.send(await eventInbox.markNotificationRead(request.authContext!, id));
    }
  );

  app.post(
    "/notifications/read-all",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await eventInbox.markAllNotificationsRead(request.authContext!));
    }
  );
}
