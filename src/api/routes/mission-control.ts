import type { FastifyInstance } from "fastify";
import type { MissionControlService } from "../../experience/mission-control/application/mission-control-service.js";

export async function registerMissionControlRoutes(
  app: FastifyInstance,
  missionControl: MissionControlService
): Promise<void> {
  app.get("/mission-control", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await missionControl.getMissionControlCenter(request.authContext!));
  });

  app.get(
    "/mission-control/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getMissionControlOverview(request.authContext!));
    }
  );

  app.get(
    "/mission-control/decisions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getTopDecisionsPanel(request.authContext!));
    }
  );

  app.get("/mission-control/risks", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await missionControl.getTopRisksPanel(request.authContext!));
  });

  app.get(
    "/mission-control/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getTopOpportunitiesPanel(request.authContext!));
    }
  );

  app.get("/mission-control/growth", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await missionControl.getGrowthCommandPanel(request.authContext!));
  });

  app.get(
    "/mission-control/government",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getGovernmentCommandPanel(request.authContext!));
    }
  );

  app.get(
    "/mission-control/investors",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getInvestorCommandPanel(request.authContext!));
    }
  );

  app.get(
    "/mission-control/operations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getOperationsCommandPanel(request.authContext!));
    }
  );

  app.get(
    "/mission-control/action-queue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await missionControl.getExecutiveActionQueue(request.authContext!));
    }
  );
}
