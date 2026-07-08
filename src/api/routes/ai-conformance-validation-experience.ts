import type { FastifyInstance } from "fastify";
import type {
  AiConformanceValidationExperienceService,
  AiConformanceValidationExperienceQuery,
} from "../../ai-conformance-validation-experience/application/ai-conformance-validation-experience-service.js";
import type { ConformanceValidationScenarioId } from "../../ai-conformance-validation-experience/domain/ai-conformance-validation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import type { AuthContext } from "../../shared/auth/index.js";

function parseQuery(query: Record<string, unknown>): AiConformanceValidationExperienceQuery {
  return {
    scenario_id: query.scenario_id as ConformanceValidationScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerAiConformanceValidationExperienceRoutes(
  app: FastifyInstance,
  aiConformanceValidationExperience: AiConformanceValidationExperienceService
): Promise<void> {
  app.get(
    "/ai-conformance-validation-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(aiConformanceValidationExperience.getHome(request.authContext!));
    }
  );

  const registerView = (
    path: string,
    handler: (auth: AuthContext, query: AiConformanceValidationExperienceQuery) => unknown
  ) => {
    app.get(path, { config: { authRequired: true } }, async (request, reply) => {
      return reply.send(
        handler(request.authContext!, parseQuery(request.query as Record<string, unknown>))
      );
    });
  };

  registerView("/ai-conformance-validation-experience/conformance-dashboard", (a, q) =>
    aiConformanceValidationExperience.getConformanceDashboard(a, q)
  );
  registerView("/ai-conformance-validation-experience/validation-matrix", (a, q) =>
    aiConformanceValidationExperience.getValidationMatrix(a, q)
  );
  registerView("/ai-conformance-validation-experience/compliance-status", (a, q) =>
    aiConformanceValidationExperience.getComplianceStatus(a, q)
  );
  registerView("/ai-conformance-validation-experience/conformance-rules", (a, q) =>
    aiConformanceValidationExperience.getConformanceRules(a, q)
  );
  registerView("/ai-conformance-validation-experience/deviation-analysis", (a, q) =>
    aiConformanceValidationExperience.getDeviationAnalysis(a, q)
  );
  registerView("/ai-conformance-validation-experience/corrective-actions", (a, q) =>
    aiConformanceValidationExperience.getCorrectiveActions(a, q)
  );
  registerView("/ai-conformance-validation-experience/validation-report", (a, q) =>
    aiConformanceValidationExperience.getValidationReport(a, q)
  );
  registerView("/ai-conformance-validation-experience/confidence", (a, q) =>
    aiConformanceValidationExperience.getConfidence(a, q)
  );
  registerView("/ai-conformance-validation-experience/explanation", (a, q) =>
    aiConformanceValidationExperience.getExplanation(a, q)
  );
  registerView("/ai-conformance-validation-experience/summary", (a, q) =>
    aiConformanceValidationExperience.getSummary(a, q)
  );
  registerView("/ai-conformance-validation-experience/validate", (a, q) =>
    aiConformanceValidationExperience.validate(a, q)
  );
}
