import type { AuthContext } from "../../shared/auth/index.js";
import type { AiStrategicIntelligenceExperienceService } from "../../ai-strategic-intelligence-experience/application/ai-strategic-intelligence-experience-service.js";
import type { AiStrategicIntelligenceExperienceQuery } from "../../ai-strategic-intelligence-experience/application/ai-strategic-intelligence-experience-service.js";
import { createAiStrategicIntelligenceExperienceService } from "../../ai-strategic-intelligence-experience/application/ai-strategic-intelligence-experience-service.js";
import type { AiStrategicIntelligenceExperienceOutput } from "../../ai-strategic-intelligence-experience/domain/ai-strategic-intelligence-experience-context.js";
import type { AiPredictiveForecastExperienceContext } from "../domain/ai-predictive-forecast-experience-context.js";

export interface UpstreamPredictiveForecastInputs {
  strategicIntelligence: AiStrategicIntelligenceExperienceOutput;
}

export class AiPredictiveForecastExperienceRepository {
  private readonly aiStrategicIntelligenceExperience: AiStrategicIntelligenceExperienceService;

  constructor(deps?: {
    aiStrategicIntelligenceExperience?: AiStrategicIntelligenceExperienceService;
  }) {
    this.aiStrategicIntelligenceExperience =
      deps?.aiStrategicIntelligenceExperience ?? createAiStrategicIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiPredictiveForecastExperienceContext,
    query: AiStrategicIntelligenceExperienceQuery
  ): UpstreamPredictiveForecastInputs {
    const strategicIntelligence =
      this.aiStrategicIntelligenceExperience.buildOutputForValidation(authContext, query);
    return { strategicIntelligence };
  }
}

export function createAiPredictiveForecastExperienceRepository(
  deps?: ConstructorParameters<typeof AiPredictiveForecastExperienceRepository>[0]
): AiPredictiveForecastExperienceRepository {
  return new AiPredictiveForecastExperienceRepository(deps);
}
