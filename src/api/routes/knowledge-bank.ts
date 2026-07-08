import type { FastifyInstance } from "fastify";
import type { KnowledgeBankService } from "../../knowledge-bank/application/knowledge-bank-service.js";

export async function registerKnowledgeBankRoutes(
  app: FastifyInstance,
  knowledgeBank: KnowledgeBankService
): Promise<void> {
  app.get(
    "/knowledge-bank",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getOverview(request.authContext!));
    }
  );

  app.get(
    "/knowledge-bank/categories",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getCategories(request.authContext!));
    }
  );

  app.get(
    "/knowledge-bank/items",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as {
        category?: string;
        source_engine?: string;
        status?: string;
      };
      return reply.send(knowledgeBank.getItems(request.authContext!, query));
    }
  );

  app.get(
    "/knowledge-bank/relationships",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getRelationships(request.authContext!));
    }
  );

  app.get(
    "/knowledge-bank/contributions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getContributions(request.authContext!));
    }
  );

  app.get(
    "/knowledge-bank/versions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getVersions(request.authContext!));
    }
  );

  app.get(
    "/knowledge-bank/lifecycle",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { item_id?: string };
      return reply.send(knowledgeBank.getLifecycle(request.authContext!, query.item_id));
    }
  );

  app.get(
    "/knowledge-bank/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getSummary(request.authContext!));
    }
  );

  app.post(
    "/knowledge-bank/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { item_id: string };
      return reply.send(knowledgeBank.validate(request.authContext!, body));
    }
  );

  app.post(
    "/knowledge-bank/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { item_id: string };
      return reply.send(knowledgeBank.publish(request.authContext!, body));
    }
  );

  app.post(
    "/knowledge-bank/approve",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { item_id: string };
      return reply.send(knowledgeBank.approve(request.authContext!, body));
    }
  );

  app.post(
    "/knowledge-bank/archive",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { item_id: string };
      return reply.send(knowledgeBank.archive(request.authContext!, body));
    }
  );

  app.get(
    "/knowledge-bank/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(knowledgeBank.getStatistics(request.authContext!));
    }
  );
}
