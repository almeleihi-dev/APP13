import type { FastifyInstance } from "fastify";
import type { StrategicOperatingService } from "../../experience/strategic-operating-system/application/strategic-operating-service.js";

export async function registerStrategicOperatingRoutes(
  app: FastifyInstance,
  strategicOperatingSystem: StrategicOperatingService
): Promise<void> {
  app.get(
    "/strategic-operating-system",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicOperatingSystem(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicOperatingOverview(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/priorities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicPriorities(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/risks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicRiskRegister(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicOpportunityMap(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/decision-brief",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getExecutiveDecisionBrief(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/goals",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await strategicOperatingSystem.getStrategicGoals(request.authContext!));
    }
  );

  app.get(
    "/strategic-operating-system/cadence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await strategicOperatingSystem.getOperatingCadence(request.authContext!));
    }
  );

  app.get(
    "/strategic-operating-system/action-plan",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await strategicOperatingSystem.getStrategicActionPlan(request.authContext!)
      );
    }
  );

  app.get(
    "/strategic-operating-system/scorecard",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await strategicOperatingSystem.getStrategicScorecard(request.authContext!));
    }
  );
}
