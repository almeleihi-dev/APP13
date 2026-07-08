import type { FastifyInstance } from "fastify";
import type { LaunchSimulationService } from "../../experience/launch-simulation/application/launch-simulation-service.js";

export async function registerLaunchSimulationRoutes(
  app: FastifyInstance,
  launchSimulation: LaunchSimulationService
): Promise<void> {
  app.get("/launch-simulation", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getLaunchSimulation(request.authContext!));
  });

  app.get(
    "/launch-simulation/scenarios",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchSimulation.getScenarioSimulations(request.authContext!));
    }
  );

  app.get("/launch-simulation/1k", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getLevelSimulation(request.authContext!, "1k"));
  });

  app.get("/launch-simulation/10k", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getLevelSimulation(request.authContext!, "10k"));
  });

  app.get(
    "/launch-simulation/100k",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchSimulation.getLevelSimulation(request.authContext!, "100k"));
    }
  );

  app.get("/launch-simulation/1m", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getLevelSimulation(request.authContext!, "1m"));
  });

  app.get("/launch-simulation/10m", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getLevelSimulation(request.authContext!, "10m"));
  });

  app.get(
    "/launch-simulation/bottlenecks",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchSimulation.getBottleneckAnalysis(request.authContext!));
    }
  );

  app.get("/launch-simulation/costs", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await launchSimulation.getCostProjection(request.authContext!));
  });

  app.get(
    "/launch-simulation/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await launchSimulation.getSimulationRecommendations(request.authContext!));
    }
  );
}
