import type { FastifyInstance } from "fastify";
import type { PersonalAssistantService } from "../../personal-assistant/application/personal-assistant-service.js";

export async function registerPersonalAssistantRoutes(
  app: FastifyInstance,
  personalAssistant: PersonalAssistantService
): Promise<void> {
  app.get(
    "/personal-assistant",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getProfile(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/today",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getToday(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/cards",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getCards(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getRecommendations(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/goals",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getGoals(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getProgress(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getOpportunities(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/reminders",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getReminders(request.authContext!));
    }
  );

  app.get(
    "/personal-assistant/timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getTimeline(request.authContext!));
    }
  );

  app.post(
    "/personal-assistant/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(personalAssistant.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/personal-assistant/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(personalAssistant.getStatistics(request.authContext!));
    }
  );
}
