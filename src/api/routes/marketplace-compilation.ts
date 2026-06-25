import type { FastifyInstance } from "fastify";
import type { MarketplaceCompilationService } from "../../marketplace-compilation/application/marketplace-compilation-service.js";
import type { ActionBlueprintView } from "../../action-blueprint/domain/action-blueprint.js";

export async function registerMarketplaceCompilationRoutes(
  app: FastifyInstance,
  marketplaceCompilation: MarketplaceCompilationService
): Promise<void> {
  app.get(
    "/marketplace-compilation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(marketplaceCompilation.getCenter(request.authContext!));
    }
  );

  app.get(
    "/marketplace-compilation/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(marketplaceCompilation.getOverview(request.authContext!));
    }
  );

  app.post(
    "/marketplace-compilation/compile",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
      };
      return reply.send(marketplaceCompilation.compile(request.authContext!, body));
    }
  );

  app.post(
    "/marketplace-compilation/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
      };
      return reply.send(marketplaceCompilation.validate(request.authContext!, body));
    }
  );

  app.post(
    "/marketplace-compilation/preview",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
      };
      return reply.send(marketplaceCompilation.preview(request.authContext!, body));
    }
  );

  app.get(
    "/marketplace-compilation/listings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(marketplaceCompilation.listListings(request.authContext!));
    }
  );

  app.get(
    "/marketplace-compilation/listings/:listingId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { listingId: string };
      return reply.send(
        marketplaceCompilation.getListing(request.authContext!, params.listingId)
      );
    }
  );

  app.get(
    "/marketplace-compilation/search-index",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { q?: string };
      return reply.send(marketplaceCompilation.getSearchIndex(request.authContext!, query.q));
    }
  );

  app.get(
    "/marketplace-compilation/categories",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(marketplaceCompilation.getCategories(request.authContext!));
    }
  );

  app.get(
    "/marketplace-compilation/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(marketplaceCompilation.getSchema(request.authContext!));
    }
  );

  app.post(
    "/marketplace-compilation/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint?: ActionBlueprintView;
        blueprint_id?: string;
        version?: string;
      };
      return reply.send(marketplaceCompilation.publish(request.authContext!, body));
    }
  );

  app.post(
    "/marketplace-compilation/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint_id: string; version: string };
      return reply.send(marketplaceCompilation.deprecate(request.authContext!, body));
    }
  );
}
