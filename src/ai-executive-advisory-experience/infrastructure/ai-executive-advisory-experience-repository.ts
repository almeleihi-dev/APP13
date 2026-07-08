import type { AuthContext } from "../../shared/auth/index.js";
import type { AiPredictiveForecastExperienceService } from "../../ai-predictive-forecast-experience/application/ai-predictive-forecast-experience-service.js";
import type { AiPredictiveForecastExperienceQuery } from "../../ai-predictive-forecast-experience/application/ai-predictive-forecast-experience-service.js";
import { createAiPredictiveForecastExperienceService } from "../../ai-predictive-forecast-experience/application/ai-predictive-forecast-experience-service.js";
import type { AiPredictiveForecastExperienceOutput } from "../../ai-predictive-forecast-experience/domain/ai-predictive-forecast-experience-context.js";
import type { AiExecutiveAdvisoryExperienceContext } from "../domain/ai-executive-advisory-experience-context.js";

export interface UpstreamExecutiveAdvisoryInputs {
  predictiveForecast: AiPredictiveForecastExperienceOutput;
}

export class AiExecutiveAdvisoryExperienceRepository {
  private readonly aiPredictiveForecastExperience: AiPredictiveForecastExperienceService;

  constructor(deps?: {
    aiPredictiveForecastExperience?: AiPredictiveForecastExperienceService;
  }) {
    this.aiPredictiveForecastExperience =
      deps?.aiPredictiveForecastExperience ?? createAiPredictiveForecastExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiExecutiveAdvisoryExperienceContext,
    query: AiPredictiveForecastExperienceQuery
  ): UpstreamExecutiveAdvisoryInputs {
    const predictiveForecast = this.aiPredictiveForecastExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { predictiveForecast };
  }
}

export function createAiExecutiveAdvisoryExperienceRepository(
  deps?: ConstructorParameters<typeof AiExecutiveAdvisoryExperienceRepository>[0]
): AiExecutiveAdvisoryExperienceRepository {
  return new AiExecutiveAdvisoryExperienceRepository(deps);
}
