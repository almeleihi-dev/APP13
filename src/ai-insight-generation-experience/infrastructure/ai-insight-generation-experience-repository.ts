import type { AuthContext } from "../../shared/auth/index.js";
import type { AiAdaptiveCoachingExperienceService } from "../../ai-adaptive-coaching-experience/application/ai-adaptive-coaching-experience-service.js";
import type { AiAdaptiveCoachingExperienceQuery } from "../../ai-adaptive-coaching-experience/application/ai-adaptive-coaching-experience-service.js";
import { createAiAdaptiveCoachingExperienceService } from "../../ai-adaptive-coaching-experience/application/ai-adaptive-coaching-experience-service.js";
import type { AiAdaptiveCoachingExperienceOutput } from "../../ai-adaptive-coaching-experience/domain/ai-adaptive-coaching-experience-context.js";
import type { AiInsightGenerationExperienceContext } from "../domain/ai-insight-generation-experience-context.js";

export interface UpstreamInsightGenerationInputs {
  adaptiveCoaching: AiAdaptiveCoachingExperienceOutput;
}

export class AiInsightGenerationExperienceRepository {
  private readonly aiAdaptiveCoachingExperience: AiAdaptiveCoachingExperienceService;

  constructor(deps?: { aiAdaptiveCoachingExperience?: AiAdaptiveCoachingExperienceService }) {
    this.aiAdaptiveCoachingExperience =
      deps?.aiAdaptiveCoachingExperience ?? createAiAdaptiveCoachingExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiInsightGenerationExperienceContext,
    query: AiAdaptiveCoachingExperienceQuery
  ): UpstreamInsightGenerationInputs {
    const adaptiveCoaching = this.aiAdaptiveCoachingExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { adaptiveCoaching };
  }
}

export function createAiInsightGenerationExperienceRepository(
  deps?: ConstructorParameters<typeof AiInsightGenerationExperienceRepository>[0]
): AiInsightGenerationExperienceRepository {
  return new AiInsightGenerationExperienceRepository(deps);
}
