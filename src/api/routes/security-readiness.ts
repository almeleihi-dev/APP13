import type { FastifyInstance } from "fastify";
import type { SecurityReadinessService } from "../../experience/security-readiness/application/security-readiness-service.js";

export async function registerSecurityReadinessRoutes(
  app: FastifyInstance,
  securityReadiness: SecurityReadinessService
): Promise<void> {
  app.get(
    "/security-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getSecurityReadinessCenter(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getSecurityOverview(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/authentication",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getAuthenticationAudit(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/authorization",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getAuthorizationAudit(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/secrets",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getSecretsAudit(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/api",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getApiSecurityAudit(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/data-protection",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getDataProtectionAudit(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/auditability",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getAuditabilityReview(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/compliance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getComplianceReadiness(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getSecurityRiskRegister(request.authContext!));
    }
  );

  app.get(
    "/security-readiness/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await securityReadiness.getSecurityRecommendations(request.authContext!));
    }
  );
}
