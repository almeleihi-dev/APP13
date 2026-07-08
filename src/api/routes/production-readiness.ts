import type { FastifyInstance } from "fastify";
import type { ProductionReadinessService } from "../../experience/production-readiness/application/production-readiness-service.js";

export async function registerProductionReadinessRoutes(
  app: FastifyInstance,
  productionReadiness: ProductionReadinessService
): Promise<void> {
  app.get(
    "/production-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getProductionReadinessCenter(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getProductionOverview(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/environment",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getEnvironmentAudit(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/database",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getDatabaseReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/storage",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getStorageReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/security",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getSecurityReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/monitoring",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getMonitoringReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/deployment",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getDeploymentReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/disaster-recovery",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getDisasterRecoveryReadiness(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getProductionRiskRegister(request.authContext!));
    }
  );

  app.get(
    "/production-readiness/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await productionReadiness.getLaunchRecommendations(request.authContext!));
    }
  );
}
