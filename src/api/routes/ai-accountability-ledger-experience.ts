import type { FastifyInstance } from "fastify";
import type {
  AiAccountabilityLedgerExperienceService,
  AiAccountabilityLedgerExperienceQuery,
} from "../../ai-accountability-ledger-experience/application/ai-accountability-ledger-experience-service.js";
import type { AccountabilityLedgerScenarioId } from "../../ai-accountability-ledger-experience/domain/ai-accountability-ledger-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiAccountabilityLedgerExperienceQuery {
  return {
    scenario_id: query.scenario_id as AccountabilityLedgerScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiAccountabilityLedgerExperienceRoutes(
  app: FastifyInstance,
  aiAccountabilityLedgerExperience: AiAccountabilityLedgerExperienceService
): Promise<void> {
  app.get(
    "/ai-accountability-ledger-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiAccountabilityLedgerExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiAccountabilityLedgerExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-accountability-ledger-experience/ledger-dashboard", (a, q) =>
    aiAccountabilityLedgerExperience.getLedgerDashboard(a, q)
  );
  registerView("/ai-accountability-ledger-experience/accountability-chain", (a, q) =>
    aiAccountabilityLedgerExperience.getAccountabilityChain(a, q)
  );
  registerView("/ai-accountability-ledger-experience/decision-trace", (a, q) =>
    aiAccountabilityLedgerExperience.getDecisionTrace(a, q)
  );
  registerView("/ai-accountability-ledger-experience/evidence-register", (a, q) =>
    aiAccountabilityLedgerExperience.getEvidenceRegister(a, q)
  );
  registerView("/ai-accountability-ledger-experience/responsibility-map", (a, q) =>
    aiAccountabilityLedgerExperience.getResponsibilityMap(a, q)
  );
  registerView("/ai-accountability-ledger-experience/audit-trail", (a, q) =>
    aiAccountabilityLedgerExperience.getAuditTrail(a, q)
  );
  registerView("/ai-accountability-ledger-experience/transparency-report", (a, q) =>
    aiAccountabilityLedgerExperience.getTransparencyReport(a, q)
  );
  registerView("/ai-accountability-ledger-experience/confidence", (a, q) =>
    aiAccountabilityLedgerExperience.getConfidence(a, q)
  );
  registerView("/ai-accountability-ledger-experience/explanation", (a, q) =>
    aiAccountabilityLedgerExperience.getExplanation(a, q)
  );
  registerView("/ai-accountability-ledger-experience/summary", (a, q) =>
    aiAccountabilityLedgerExperience.getSummary(a, q)
  );
  registerView("/ai-accountability-ledger-experience/validate", (a, q) =>
    aiAccountabilityLedgerExperience.validate(a, q)
  );
}
