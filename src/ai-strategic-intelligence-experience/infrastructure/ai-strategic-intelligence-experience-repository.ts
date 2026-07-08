import type { AuthContext } from "../../shared/auth/index.js";
import type { AiDecisionIntelligenceExperienceService } from "../../ai-decision-intelligence-experience/application/ai-decision-intelligence-experience-service.js";
import type { AiDecisionIntelligenceExperienceQuery } from "../../ai-decision-intelligence-experience/application/ai-decision-intelligence-experience-service.js";
import { createAiDecisionIntelligenceExperienceService } from "../../ai-decision-intelligence-experience/application/ai-decision-intelligence-experience-service.js";
import type { AiDecisionIntelligenceExperienceOutput } from "../../ai-decision-intelligence-experience/domain/ai-decision-intelligence-experience-context.js";
import type { AiStrategicIntelligenceExperienceContext } from "../domain/ai-strategic-intelligence-experience-context.js";

export interface UpstreamStrategicIntelligenceInputs {
  decisionIntelligence: AiDecisionIntelligenceExperienceOutput;
}

export class AiStrategicIntelligenceExperienceRepository {
  private readonly aiDecisionIntelligenceExperience: AiDecisionIntelligenceExperienceService;

  constructor(deps?: {
    aiDecisionIntelligenceExperience?: AiDecisionIntelligenceExperienceService;
  }) {
    this.aiDecisionIntelligenceExperience =
      deps?.aiDecisionIntelligenceExperience ?? createAiDecisionIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiStrategicIntelligenceExperienceContext,
    query: AiDecisionIntelligenceExperienceQuery
  ): UpstreamStrategicIntelligenceInputs {
    const decisionIntelligence =
      this.aiDecisionIntelligenceExperience.buildOutputForValidation(authContext, query);
    return { decisionIntelligence };
  }
}

export function createAiStrategicIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiStrategicIntelligenceExperienceRepository>[0]
): AiStrategicIntelligenceExperienceRepository {
  return new AiStrategicIntelligenceExperienceRepository(deps);
}
