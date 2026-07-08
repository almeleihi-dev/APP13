import type { AuthContext } from "../../shared/auth/index.js";
import type { AiRecommendationIntelligenceExperienceService } from "../../ai-recommendation-intelligence-experience/application/ai-recommendation-intelligence-experience-service.js";
import type { AiRecommendationIntelligenceExperienceQuery } from "../../ai-recommendation-intelligence-experience/application/ai-recommendation-intelligence-experience-service.js";
import { createAiRecommendationIntelligenceExperienceService } from "../../ai-recommendation-intelligence-experience/application/ai-recommendation-intelligence-experience-service.js";
import type { AiRecommendationIntelligenceExperienceOutput } from "../../ai-recommendation-intelligence-experience/domain/ai-recommendation-intelligence-experience-context.js";
import type { AiPredictiveIntelligenceExperienceContext } from "../domain/ai-predictive-intelligence-experience-context.js";

export interface UpstreamPredictiveIntelligenceInputs {
  recommendationIntelligence: AiRecommendationIntelligenceExperienceOutput;
}

export class AiPredictiveIntelligenceExperienceRepository {
  private readonly aiRecommendationIntelligenceExperience: AiRecommendationIntelligenceExperienceService;

  constructor(deps?: {
    aiRecommendationIntelligenceExperience?: AiRecommendationIntelligenceExperienceService;
  }) {
    this.aiRecommendationIntelligenceExperience =
      deps?.aiRecommendationIntelligenceExperience ??
      createAiRecommendationIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiPredictiveIntelligenceExperienceContext,
    query: AiRecommendationIntelligenceExperienceQuery
  ): UpstreamPredictiveIntelligenceInputs {
    const recommendationIntelligence =
      this.aiRecommendationIntelligenceExperience.buildOutputForValidation(authContext, query);
    return { recommendationIntelligence };
  }
}

export function createAiPredictiveIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiPredictiveIntelligenceExperienceRepository>[0]
): AiPredictiveIntelligenceExperienceRepository {
  return new AiPredictiveIntelligenceExperienceRepository(deps);
}
