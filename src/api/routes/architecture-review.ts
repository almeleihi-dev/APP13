import type { FastifyInstance } from "fastify";
import type { ArchitectureReviewService } from "../../experience/architecture-review/application/architecture-review-service.js";

export async function registerArchitectureReviewRoutes(
  app: FastifyInstance,
  architectureReview: ArchitectureReviewService
): Promise<void> {
  app.get(
    "/architecture-review",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getArchitectureReviewCenter(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getArchitectureOverview(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/experience-layers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getExperienceLayerAudit(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/routes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getRouteSurfaceAudit(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/verifications",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getVerificationChainAudit(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/documentation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getDocumentationAudit(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/dependencies",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getDependencyBoundaryAudit(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/completeness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await architectureReview.getExecutiveStackCompleteness(request.authContext!)
      );
    }
  );

  app.get(
    "/architecture-review/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await architectureReview.getArchitectureRiskRegister(request.authContext!));
    }
  );

  app.get(
    "/architecture-review/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await architectureReview.getArchitectureRecommendations(request.authContext!)
      );
    }
  );
}
