import type { FastifyInstance } from "fastify";
import type { TeamBuilderService } from "../../team-builder/application/team-builder-service.js";

function listingQuery(query: { listing_id?: string }): string | undefined {
  return query.listing_id;
}

export async function registerTeamBuilderRoutes(
  app: FastifyInstance,
  teamBuilder: TeamBuilderService
): Promise<void> {
  app.get(
    "/team-builder",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getOverview(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getRecommendations(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getReadiness(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/compatibility",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getCompatibility(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/members",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getMembers(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/coverage",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getCoverage(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getRisks(request.authContext!, listingQuery(query)));
    }
  );

  app.get(
    "/team-builder/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { listing_id?: string };
      return reply.send(teamBuilder.getSummary(request.authContext!, listingQuery(query)));
    }
  );

  app.post(
    "/team-builder/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { listing_id?: string; generated_at?: string };
      return reply.send(teamBuilder.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/team-builder/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(teamBuilder.getStatistics(request.authContext!));
    }
  );
}
