import type { FastifyInstance } from "fastify";
import type {
  AiGovernanceAssuranceExperienceService,
  AiGovernanceAssuranceExperienceQuery,
} from "../../ai-governance-assurance-experience/application/ai-governance-assurance-experience-service.js";
import type { GovernanceAssuranceScenarioId } from "../../ai-governance-assurance-experience/domain/ai-governance-assurance-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiGovernanceAssuranceExperienceQuery {
  return {
    scenario_id: query.scenario_id as GovernanceAssuranceScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiGovernanceAssuranceExperienceRoutes(
  app: FastifyInstance,
  aiGovernanceAssuranceExperience: AiGovernanceAssuranceExperienceService
): Promise<void> {
  app.get(
    "/ai-governance-assurance-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiGovernanceAssuranceExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiGovernanceAssuranceExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-governance-assurance-experience/governance-dashboard", (a, q) =>
    aiGovernanceAssuranceExperience.getGovernanceDashboard(a, q)
  );
  registerView("/ai-governance-assurance-experience/policy-alignment", (a, q) =>
    aiGovernanceAssuranceExperience.getPolicyAlignment(a, q)
  );
  registerView("/ai-governance-assurance-experience/control-map", (a, q) =>
    aiGovernanceAssuranceExperience.getControlMap(a, q)
  );
  registerView("/ai-governance-assurance-experience/assurance-checks", (a, q) =>
    aiGovernanceAssuranceExperience.getAssuranceChecks(a, q)
  );
  registerView("/ai-governance-assurance-experience/risk-controls", (a, q) =>
    aiGovernanceAssuranceExperience.getRiskControls(a, q)
  );
  registerView("/ai-governance-assurance-experience/accountability", (a, q) =>
    aiGovernanceAssuranceExperience.getAccountability(a, q)
  );
  registerView("/ai-governance-assurance-experience/escalation-guidance", (a, q) =>
    aiGovernanceAssuranceExperience.getEscalationGuidance(a, q)
  );
  registerView("/ai-governance-assurance-experience/confidence", (a, q) =>
    aiGovernanceAssuranceExperience.getConfidence(a, q)
  );
  registerView("/ai-governance-assurance-experience/explanation", (a, q) =>
    aiGovernanceAssuranceExperience.getExplanation(a, q)
  );
  registerView("/ai-governance-assurance-experience/summary", (a, q) =>
    aiGovernanceAssuranceExperience.getSummary(a, q)
  );
  registerView("/ai-governance-assurance-experience/validate", (a, q) =>
    aiGovernanceAssuranceExperience.validate(a, q)
  );
}
