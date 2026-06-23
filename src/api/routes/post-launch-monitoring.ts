import type { FastifyInstance } from "fastify";
import type { PostLaunchMonitoringService } from "../../experience/post-launch-monitoring/application/post-launch-monitoring-service.js";

export async function registerPostLaunchMonitoringRoutes(
  app: FastifyInstance,
  postLaunchMonitoring: PostLaunchMonitoringService
): Promise<void> {
  app.get(
    "/post-launch-monitoring",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await postLaunchMonitoring.getPostLaunchMonitoringCenter(request.authContext!)
      );
    }
  );

  app.get(
    "/post-launch-monitoring/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getPostLaunchOverview(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/day-1",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await postLaunchMonitoring.getFirst24HoursMonitoring(request.authContext!)
      );
    }
  );

  app.get(
    "/post-launch-monitoring/week-1",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getFirstWeekMonitoring(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/month-1",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getFirstMonthMonitoring(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/growth",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getUserGrowthMonitoring(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/operations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getOperationsMonitoring(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/security",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getSecurityMonitoring(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/warnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getEarlyWarningSystem(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/success",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await postLaunchMonitoring.getSuccessIndicators(request.authContext!));
    }
  );

  app.get(
    "/post-launch-monitoring/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await postLaunchMonitoring.getExecutiveRecommendations(request.authContext!)
      );
    }
  );
}
