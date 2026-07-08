import type { FastifyInstance } from "fastify";
import type {
  IntelligenceDashboardService,
  IntelligenceDashboardQuery,
} from "../../intelligence-dashboard/application/intelligence-dashboard-service.js";
import type { IntelligenceDashboardScenarioId } from "../../intelligence-dashboard/domain/intelligence-dashboard-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): IntelligenceDashboardQuery {
  return {
    scenario_id: query.scenario_id as IntelligenceDashboardScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerIntelligenceDashboardRoutes(
  app: FastifyInstance,
  intelligenceDashboard: IntelligenceDashboardService
): Promise<void> {
  app.get("/intelligence-dashboard", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(intelligenceDashboard.getHome(request.authContext!));
  });

  const registerPanel = (
    path: string,
    handler: (auth: AuthContext, query: IntelligenceDashboardQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerPanel("/intelligence-dashboard/overview", (a, q) =>
    intelligenceDashboard.getExecutiveOverview(a, q)
  );
  registerPanel("/intelligence-dashboard/health", (a, q) => intelligenceDashboard.getHealth(a, q));
  registerPanel("/intelligence-dashboard/journey", (a, q) => intelligenceDashboard.getJourney(a, q));
  registerPanel("/intelligence-dashboard/confidence", (a, q) =>
    intelligenceDashboard.getConfidence(a, q)
  );
  registerPanel("/intelligence-dashboard/readiness", (a, q) =>
    intelligenceDashboard.getReadiness(a, q)
  );
  registerPanel("/intelligence-dashboard/trust", (a, q) => intelligenceDashboard.getTrust(a, q));
  registerPanel("/intelligence-dashboard/decision", (a, q) =>
    intelligenceDashboard.getDecision(a, q)
  );
  registerPanel("/intelligence-dashboard/recommendation", (a, q) =>
    intelligenceDashboard.getRecommendation(a, q)
  );
  registerPanel("/intelligence-dashboard/prediction", (a, q) =>
    intelligenceDashboard.getPrediction(a, q)
  );
  registerPanel("/intelligence-dashboard/strategy", (a, q) =>
    intelligenceDashboard.getStrategy(a, q)
  );
  registerPanel("/intelligence-dashboard/learning", (a, q) => intelligenceDashboard.getLearning(a, q));
  registerPanel("/intelligence-dashboard/optimization", (a, q) =>
    intelligenceDashboard.getOptimization(a, q)
  );
  registerPanel("/intelligence-dashboard/evolution", (a, q) =>
    intelligenceDashboard.getEvolution(a, q)
  );
  registerPanel("/intelligence-dashboard/timeline", (a, q) => intelligenceDashboard.getTimeline(a, q));
  registerPanel("/intelligence-dashboard/executive-summary", (a, q) =>
    intelligenceDashboard.getExecutiveSummary(a, q)
  );
  registerPanel("/intelligence-dashboard/summary", (a, q) => intelligenceDashboard.getSummary(a, q));
  registerPanel("/intelligence-dashboard/validate", (a, q) => intelligenceDashboard.validate(a, q));
}
