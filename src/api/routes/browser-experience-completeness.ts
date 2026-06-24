import type { FastifyInstance } from "fastify";
import type { BrowserExperienceCompletenessService } from "../../experience/browser-experience-completeness/application/browser-experience-completeness-service.js";

export async function registerBrowserExperienceCompletenessRoutes(
  app: FastifyInstance,
  browserExperienceCompleteness: BrowserExperienceCompletenessService
): Promise<void> {
  app.get(
    "/browser-experience-completeness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserExperienceCompletenessCenter(
          request.authContext!
        )
      );
    }
  );

  app.get(
    "/browser-experience-completeness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserCompletenessOverview(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/layers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserLayerAudit(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/routes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserRouteCompleteness(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/static-assets",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getStaticAssetAudit(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/ui-pages",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getUiPageWiringAudit(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/x31-alignment",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await browserExperienceCompleteness.getX31Alignment(request.authContext!));
    }
  );

  app.get(
    "/browser-experience-completeness/verification",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserVerificationChain(request.authContext!)
      );
    }
  );

  app.get(
    "/browser-experience-completeness/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserCompletenessRecommendations(
          request.authContext!
        )
      );
    }
  );

  app.get(
    "/browser-experience-completeness/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await browserExperienceCompleteness.getBrowserCompletenessScore(request.authContext!)
      );
    }
  );
}
