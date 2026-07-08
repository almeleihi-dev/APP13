import type { AuthContext } from "../../shared/auth/index.js";
import type { AiProgressIntelligenceExperienceService } from "../../ai-progress-intelligence-experience/application/ai-progress-intelligence-experience-service.js";
import type { AiProgressIntelligenceExperienceQuery } from "../../ai-progress-intelligence-experience/application/ai-progress-intelligence-experience-service.js";
import { createAiProgressIntelligenceExperienceService } from "../../ai-progress-intelligence-experience/application/ai-progress-intelligence-experience-service.js";
import type { AiProgressIntelligenceExperienceOutput } from "../../ai-progress-intelligence-experience/domain/ai-progress-intelligence-experience-context.js";
import type { AiAdaptiveCoachingExperienceContext } from "../domain/ai-adaptive-coaching-experience-context.js";

export interface UpstreamAdaptiveCoachingInputs {
  progressIntelligence: AiProgressIntelligenceExperienceOutput;
}

export class AiAdaptiveCoachingExperienceRepository {
  private readonly aiProgressIntelligenceExperience: AiProgressIntelligenceExperienceService;

  constructor(deps?: { aiProgressIntelligenceExperience?: AiProgressIntelligenceExperienceService }) {
    this.aiProgressIntelligenceExperience =
      deps?.aiProgressIntelligenceExperience ?? createAiProgressIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiAdaptiveCoachingExperienceContext,
    query: AiProgressIntelligenceExperienceQuery
  ): UpstreamAdaptiveCoachingInputs {
    const progressIntelligence = this.aiProgressIntelligenceExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { progressIntelligence };
  }
}

export function createAiAdaptiveCoachingExperienceRepository(
  deps?: ConstructorParameters<typeof AiAdaptiveCoachingExperienceRepository>[0]
): AiAdaptiveCoachingExperienceRepository {
  return new AiAdaptiveCoachingExperienceRepository(deps);
}
