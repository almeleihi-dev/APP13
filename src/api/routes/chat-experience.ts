import type { FastifyInstance } from "fastify";
import type { ChatExperienceService } from "../../runtime-experience/chat/application/chat-experience-service.js";
import { isChatScreenId } from "../../runtime-experience/chat/domain/chat-screen.js";
import { AppError } from "../../shared/errors/index.js";

export async function registerChatExperienceRoutes(
  app: FastifyInstance,
  chatExperience: ChatExperienceService
): Promise<void> {
  app.get(
    "/chat-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        chatExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.post(
    "/chat-experience/enter",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        generated_at?: string;
        contract_id?: string;
        action_id?: string;
        request_id?: string;
        title?: string;
      };
      return reply.send(
        chatExperience.enterFromContract(request.authContext!, {
          generated_at: body.generated_at,
          contract_id: body.contract_id,
          action_id: body.action_id,
          request_id: body.request_id,
          title: body.title,
        })
      );
    }
  );

  app.get("/chat-experience/flow", { config: { authRequired: true } }, async (_request, reply) =>
    reply.send(chatExperience.getFlow())
  );

  app.get("/chat-experience/validate", { config: { authRequired: true } }, async (_request, reply) =>
    reply.send(chatExperience.validateRuntime())
  );

  const screenRoutes: Array<{ path: string; handler: keyof ChatExperienceService }> = [
    { path: "/chat-experience/home", handler: "getHome" },
    { path: "/chat-experience/conversations", handler: "getConversationList" },
    { path: "/chat-experience/info", handler: "getConversationInfo" },
    { path: "/chat-experience/empty", handler: "getEmpty" },
  ];

  for (const route of screenRoutes) {
    app.get(route.path, { config: { authRequired: true } }, async (request, reply) => {
      const query = request.query as { generated_at?: string };
      const method = chatExperience[route.handler] as (
        auth: NonNullable<typeof request.authContext>,
        input?: { generated_at?: string }
      ) => unknown;
      return reply.send(method(request.authContext!, query));
    });
  }

  app.get(
    "/chat-experience/conversation/:conversationId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { conversationId } = request.params as { conversationId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        chatExperience.getConversation(request.authContext!, conversationId, query)
      );
    }
  );

  app.post(
    "/chat-experience/message",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { body?: string; generated_at?: string };
      if (!body.body?.trim()) {
        throw new AppError({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: "Message body is required",
          code: "VALIDATION_ERROR",
        });
      }
      return reply.send(
        chatExperience.sendMessage(request.authContext!, {
          body: body.body,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/chat-experience/complete",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(chatExperience.completeConversation(request.authContext!, body));
    }
  );

  app.post(
    "/chat-experience/archive",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(chatExperience.archiveConversation(request.authContext!, body));
    }
  );

  app.get(
    "/chat-experience/screen/:screenId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { screenId } = request.params as { screenId: string };
      if (!isChatScreenId(screenId)) {
        throw new AppError({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Unknown chat screen: ${screenId}`,
          code: "NOT_FOUND",
        });
      }
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        chatExperience.getScreen(request.authContext!, screenId, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );
}
