import type { FastifyInstance } from "fastify";
import type { ApiAuditService } from "../../experience/api-audit/application/api-audit-service.js";

export async function registerApiAuditRoutes(
  app: FastifyInstance,
  apiAudit: ApiAuditService
): Promise<void> {
  app.get(
    "/api-audit",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiAuditCenter(request.authContext!));
    }
  );

  app.get(
    "/api-audit/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiOverview(request.authContext!));
    }
  );

  app.get(
    "/api-audit/routes",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getRouteRegistryAudit(request.authContext!));
    }
  );

  app.get(
    "/api-audit/endpoints",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getEndpointCoverageAudit(request.authContext!));
    }
  );

  app.get(
    "/api-audit/auth",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getAuthenticationAudit(request.authContext!));
    }
  );

  app.get(
    "/api-audit/documentation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiDocumentationAudit(request.authContext!));
    }
  );

  app.get(
    "/api-audit/modules",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getModuleExposureAudit(request.authContext!));
    }
  );

  app.get(
    "/api-audit/readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiProductionReadiness(request.authContext!));
    }
  );

  app.get(
    "/api-audit/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiRiskRegister(request.authContext!));
    }
  );

  app.get(
    "/api-audit/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await apiAudit.getApiRecommendations(request.authContext!));
    }
  );
}
