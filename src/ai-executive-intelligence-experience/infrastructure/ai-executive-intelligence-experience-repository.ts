import type { AuthContext } from "../../shared/auth/index.js";
import type { AiPredictiveIntelligenceExperienceService } from "../../ai-predictive-intelligence-experience/application/ai-predictive-intelligence-experience-service.js";
import type { AiPredictiveIntelligenceExperienceQuery } from "../../ai-predictive-intelligence-experience/application/ai-predictive-intelligence-experience-service.js";
import { createAiPredictiveIntelligenceExperienceService } from "../../ai-predictive-intelligence-experience/application/ai-predictive-intelligence-experience-service.js";
import type { AiPredictiveIntelligenceExperienceOutput } from "../../ai-predictive-intelligence-experience/domain/ai-predictive-intelligence-experience-context.js";
import type { AiExecutiveIntelligenceExperienceContext } from "../domain/ai-executive-intelligence-experience-context.js";

export interface UpstreamExecutiveIntelligenceInputs {
  predictiveIntelligence: AiPredictiveIntelligenceExperienceOutput;
}

export class AiExecutiveIntelligenceExperienceRepository {
  private readonly aiPredictiveIntelligenceExperience: AiPredictiveIntelligenceExperienceService;

  constructor(deps?: {
    aiPredictiveIntelligenceExperience?: AiPredictiveIntelligenceExperienceService;
  }) {
    this.aiPredictiveIntelligenceExperience =
      deps?.aiPredictiveIntelligenceExperience ??
      createAiPredictiveIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiExecutiveIntelligenceExperienceContext,
    query: AiPredictiveIntelligenceExperienceQuery
  ): UpstreamExecutiveIntelligenceInputs {
    const predictiveIntelligence =
      this.aiPredictiveIntelligenceExperience.buildOutputForValidation(authContext, query);
    return { predictiveIntelligence };
  }
}

export function createAiExecutiveIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiExecutiveIntelligenceExperienceRepository>[0]
): AiExecutiveIntelligenceExperienceRepository {
  return new AiExecutiveIntelligenceExperienceRepository(deps);
}
