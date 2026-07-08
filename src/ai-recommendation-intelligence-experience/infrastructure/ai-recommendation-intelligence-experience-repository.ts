import type { AuthContext } from "../../shared/auth/index.js";
import type { AiInsightGenerationExperienceService } from "../../ai-insight-generation-experience/application/ai-insight-generation-experience-service.js";
import type { AiInsightGenerationExperienceQuery } from "../../ai-insight-generation-experience/application/ai-insight-generation-experience-service.js";
import { createAiInsightGenerationExperienceService } from "../../ai-insight-generation-experience/application/ai-insight-generation-experience-service.js";
import type { AiInsightGenerationExperienceOutput } from "../../ai-insight-generation-experience/domain/ai-insight-generation-experience-context.js";
import type { AiRecommendationIntelligenceExperienceContext } from "../domain/ai-recommendation-intelligence-experience-context.js";

export interface UpstreamRecommendationIntelligenceInputs {
  insightGeneration: AiInsightGenerationExperienceOutput;
}

export class AiRecommendationIntelligenceExperienceRepository {
  private readonly aiInsightGenerationExperience: AiInsightGenerationExperienceService;

  constructor(deps?: { aiInsightGenerationExperience?: AiInsightGenerationExperienceService }) {
    this.aiInsightGenerationExperience =
      deps?.aiInsightGenerationExperience ?? createAiInsightGenerationExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiRecommendationIntelligenceExperienceContext,
    query: AiInsightGenerationExperienceQuery
  ): UpstreamRecommendationIntelligenceInputs {
    const insightGeneration = this.aiInsightGenerationExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { insightGeneration };
  }
}

export function createAiRecommendationIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiRecommendationIntelligenceExperienceRepository>[0]
): AiRecommendationIntelligenceExperienceRepository {
  return new AiRecommendationIntelligenceExperienceRepository(deps);
}
