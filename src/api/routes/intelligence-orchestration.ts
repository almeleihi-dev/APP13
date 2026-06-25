import type { FastifyInstance } from "fastify";
import type { IntelligenceOrchestrationService } from "../../intelligence-orchestration/application/intelligence-orchestration-service.js";

function queryInput(query: { intent?: string; listing_id?: string }) {
  return {
    intent: query.intent,
    listing_id: query.listing_id,
  };
}

export async function registerIntelligenceOrchestrationRoutes(
  app: FastifyInstance,
  intelligenceOrchestration: IntelligenceOrchestrationService
): Promise<void> {
  app.get(
    "/intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(intelligenceOrchestration.getOverview(request.authContext!, query));
    }
  );

  app.post(
    "/intelligence/query",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        intent: string;
        listing_id?: string;
        generated_at?: string;
      };
      return reply.send(intelligenceOrchestration.query(request.authContext!, body));
    }
  );

  app.post(
    "/intelligence/recommend",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        intent?: string;
        listing_id?: string;
        generated_at?: string;
      };
      return reply.send(intelligenceOrchestration.recommend(request.authContext!, body));
    }
  );

  app.post(
    "/intelligence/plan",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        intent?: string;
        listing_id?: string;
        generated_at?: string;
      };
      return reply.send(intelligenceOrchestration.plan(request.authContext!, body));
    }
  );

  app.post(
    "/intelligence/explain",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        intent?: string;
        listing_id?: string;
        generated_at?: string;
      };
      return reply.send(intelligenceOrchestration.explain(request.authContext!, body));
    }
  );

  app.get(
    "/intelligence/contributions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { intent?: string; listing_id?: string };
      return reply.send(
        intelligenceOrchestration.getContributions(request.authContext!, queryInput(query))
      );
    }
  );

  app.get(
    "/intelligence/pipeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { intent?: string; listing_id?: string };
      return reply.send(
        intelligenceOrchestration.getPipeline(request.authContext!, queryInput(query))
      );
    }
  );

  app.get(
    "/intelligence/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligenceOrchestration.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/intelligence/health",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(intelligenceOrchestration.getHealth(request.authContext!));
    }
  );

  app.post(
    "/intelligence/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        intent?: string;
        listing_id?: string;
        generated_at?: string;
      };
      return reply.send(intelligenceOrchestration.refresh(request.authContext!, body));
    }
  );
}
