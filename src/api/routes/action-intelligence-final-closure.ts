import type { FastifyInstance } from "fastify";
import type {
  ActionIntelligenceFinalClosureService,
  ActionIntelligenceFinalClosureQuery,
} from "../../action-intelligence-final-closure/application/action-intelligence-final-closure-service.js";
import type { ClosureScenarioId } from "../../action-intelligence-final-closure/domain/action-intelligence-final-closure-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): ActionIntelligenceFinalClosureQuery {
  return {
    scenario_id: query.scenario_id as ClosureScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerActionIntelligenceFinalClosureRoutes(
  app: FastifyInstance,
  actionIntelligenceFinalClosure: ActionIntelligenceFinalClosureService
): Promise<void> {
  app.get(
    "/action-intelligence-final-closure",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionIntelligenceFinalClosure.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: ActionIntelligenceFinalClosureQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/action-intelligence-final-closure/chapter-status", (a, q) =>
    actionIntelligenceFinalClosure.getChapterStatus(a, q)
  );
  registerView("/action-intelligence-final-closure/architecture", (a, q) =>
    actionIntelligenceFinalClosure.getArchitecture(a, q)
  );
  registerView("/action-intelligence-final-closure/ecosystem", (a, q) =>
    actionIntelligenceFinalClosure.getEcosystem(a, q)
  );
  registerView("/action-intelligence-final-closure/certification", (a, q) =>
    actionIntelligenceFinalClosure.getCertification(a, q)
  );
  registerView("/action-intelligence-final-closure/implementation", (a, q) =>
    actionIntelligenceFinalClosure.getImplementation(a, q)
  );
  registerView("/action-intelligence-final-closure/dependency", (a, q) =>
    actionIntelligenceFinalClosure.getDependency(a, q)
  );
  registerView("/action-intelligence-final-closure/readiness", (a, q) =>
    actionIntelligenceFinalClosure.getReadiness(a, q)
  );
  registerView("/action-intelligence-final-closure/executive-closure", (a, q) =>
    actionIntelligenceFinalClosure.getExecutiveClosure(a, q)
  );
  registerView("/action-intelligence-final-closure/handoff", (a, q) =>
    actionIntelligenceFinalClosure.getHandoff(a, q)
  );
  registerView("/action-intelligence-final-closure/explanation", (a, q) =>
    actionIntelligenceFinalClosure.getExplanation(a, q)
  );
  registerView("/action-intelligence-final-closure/summary", (a, q) =>
    actionIntelligenceFinalClosure.getSummary(a, q)
  );
  registerView("/action-intelligence-final-closure/validate", (a, q) =>
    actionIntelligenceFinalClosure.validate(a, q)
  );
}
