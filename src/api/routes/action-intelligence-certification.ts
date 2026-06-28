import type { FastifyInstance } from "fastify";
import type {
  ActionIntelligenceCertificationService,
  ActionIntelligenceCertificationQuery,
} from "../../action-intelligence-certification/application/action-intelligence-certification-service.js";
import type { CertificationScenarioId } from "../../action-intelligence-certification/domain/action-intelligence-certification-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): ActionIntelligenceCertificationQuery {
  return {
    scenario_id: query.scenario_id as CertificationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerActionIntelligenceCertificationRoutes(
  app: FastifyInstance,
  actionIntelligenceCertification: ActionIntelligenceCertificationService
): Promise<void> {
  app.get(
    "/action-intelligence-certification",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(actionIntelligenceCertification.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: ActionIntelligenceCertificationQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/action-intelligence-certification/platform", (a, q) =>
    actionIntelligenceCertification.getPlatform(a, q)
  );
  registerView("/action-intelligence-certification/architecture", (a, q) =>
    actionIntelligenceCertification.getArchitecture(a, q)
  );
  registerView("/action-intelligence-certification/delegation", (a, q) =>
    actionIntelligenceCertification.getDelegation(a, q)
  );
  registerView("/action-intelligence-certification/determinism", (a, q) =>
    actionIntelligenceCertification.getDeterminism(a, q)
  );
  registerView("/action-intelligence-certification/explainability", (a, q) =>
    actionIntelligenceCertification.getExplainability(a, q)
  );
  registerView("/action-intelligence-certification/dependency", (a, q) =>
    actionIntelligenceCertification.getDependency(a, q)
  );
  registerView("/action-intelligence-certification/api", (a, q) =>
    actionIntelligenceCertification.getApi(a, q)
  );
  registerView("/action-intelligence-certification/readiness", (a, q) =>
    actionIntelligenceCertification.getReadiness(a, q)
  );
  registerView("/action-intelligence-certification/ecosystem", (a, q) =>
    actionIntelligenceCertification.getEcosystem(a, q)
  );
  registerView("/action-intelligence-certification/executive-report", (a, q) =>
    actionIntelligenceCertification.getExecutiveReport(a, q)
  );
  registerView("/action-intelligence-certification/explanation", (a, q) =>
    actionIntelligenceCertification.getExplanation(a, q)
  );
  registerView("/action-intelligence-certification/summary", (a, q) =>
    actionIntelligenceCertification.getSummary(a, q)
  );
  registerView("/action-intelligence-certification/validate", (a, q) =>
    actionIntelligenceCertification.validate(a, q)
  );
}
