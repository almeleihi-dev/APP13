import type { FastifyInstance } from "fastify";
import type {
  ExecutiveIntelligenceCenterService,
  ExecutiveIntelligenceCenterQuery,
} from "../../executive-intelligence-center/application/executive-intelligence-center-service.js";
import type { ExecutiveIntelligenceCenterScenarioId } from "../../executive-intelligence-center/domain/executive-intelligence-center-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): ExecutiveIntelligenceCenterQuery {
  return {
    scenario_id: query.scenario_id as ExecutiveIntelligenceCenterScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerExecutiveIntelligenceCenterRoutes(
  app: FastifyInstance,
  executiveIntelligenceCenter: ExecutiveIntelligenceCenterService
): Promise<void> {
  app.get(
    "/executive-intelligence-center",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(executiveIntelligenceCenter.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: ExecutiveIntelligenceCenterQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/executive-intelligence-center/overview", (a, q) =>
    executiveIntelligenceCenter.getOverview(a, q)
  );
  registerView("/executive-intelligence-center/platform-health", (a, q) =>
    executiveIntelligenceCenter.getPlatformHealth(a, q)
  );
  registerView("/executive-intelligence-center/strategic-status", (a, q) =>
    executiveIntelligenceCenter.getStrategicStatus(a, q)
  );
  registerView("/executive-intelligence-center/operational-status", (a, q) =>
    executiveIntelligenceCenter.getOperationalStatus(a, q)
  );
  registerView("/executive-intelligence-center/intelligence", (a, q) =>
    executiveIntelligenceCenter.getIntelligence(a, q)
  );
  registerView("/executive-intelligence-center/readiness", (a, q) =>
    executiveIntelligenceCenter.getReadiness(a, q)
  );
  registerView("/executive-intelligence-center/orchestration", (a, q) =>
    executiveIntelligenceCenter.getOrchestration(a, q)
  );
  registerView("/executive-intelligence-center/reports", (a, q) =>
    executiveIntelligenceCenter.getReports(a, q)
  );
  registerView("/executive-intelligence-center/explanation", (a, q) =>
    executiveIntelligenceCenter.getExplanation(a, q)
  );
  registerView("/executive-intelligence-center/summary", (a, q) =>
    executiveIntelligenceCenter.getSummary(a, q)
  );
  registerView("/executive-intelligence-center/validate", (a, q) =>
    executiveIntelligenceCenter.validate(a, q)
  );
}
