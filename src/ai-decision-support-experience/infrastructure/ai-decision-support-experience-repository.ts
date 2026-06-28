import type { AuthContext } from "../../shared/auth/index.js";
import type { AiGuidanceExperienceService } from "../../ai-guidance-experience/application/ai-guidance-experience-service.js";
import type { AiGuidanceExperienceQuery } from "../../ai-guidance-experience/application/ai-guidance-experience-service.js";
import { createAiGuidanceExperienceService } from "../../ai-guidance-experience/application/ai-guidance-experience-service.js";
import type { AiGuidanceExperienceOutput } from "../../ai-guidance-experience/domain/ai-guidance-experience-context.js";
import type { AiDecisionSupportExperienceContext } from "../domain/ai-decision-support-experience-context.js";

export interface UpstreamDecisionSupportInputs {
  guidance: AiGuidanceExperienceOutput;
}

export class AiDecisionSupportExperienceRepository {
  private readonly aiGuidanceExperience: AiGuidanceExperienceService;

  constructor(deps?: { aiGuidanceExperience?: AiGuidanceExperienceService }) {
    this.aiGuidanceExperience =
      deps?.aiGuidanceExperience ?? createAiGuidanceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiDecisionSupportExperienceContext,
    query: AiGuidanceExperienceQuery
  ): UpstreamDecisionSupportInputs {
    const guidance = this.aiGuidanceExperience.buildOutputForValidation(authContext, query);
    return { guidance };
  }
}

export function createAiDecisionSupportExperienceRepository(
  deps?: ConstructorParameters<typeof AiDecisionSupportExperienceRepository>[0]
): AiDecisionSupportExperienceRepository {
  return new AiDecisionSupportExperienceRepository(deps);
}
