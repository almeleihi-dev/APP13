import type { AuthContext } from "../../shared/auth/index.js";
import type { AiDecisionSupportExperienceService } from "../../ai-decision-support-experience/application/ai-decision-support-experience-service.js";
import type { AiDecisionSupportExperienceQuery } from "../../ai-decision-support-experience/application/ai-decision-support-experience-service.js";
import { createAiDecisionSupportExperienceService } from "../../ai-decision-support-experience/application/ai-decision-support-experience-service.js";
import type { AiDecisionSupportExperienceOutput } from "../../ai-decision-support-experience/domain/ai-decision-support-experience-context.js";
import type { AiActionPlanningExperienceContext } from "../domain/ai-action-planning-experience-context.js";

export interface UpstreamActionPlanningInputs {
  decisionSupport: AiDecisionSupportExperienceOutput;
}

export class AiActionPlanningExperienceRepository {
  private readonly aiDecisionSupportExperience: AiDecisionSupportExperienceService;

  constructor(deps?: { aiDecisionSupportExperience?: AiDecisionSupportExperienceService }) {
    this.aiDecisionSupportExperience =
      deps?.aiDecisionSupportExperience ?? createAiDecisionSupportExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiActionPlanningExperienceContext,
    query: AiDecisionSupportExperienceQuery
  ): UpstreamActionPlanningInputs {
    const decisionSupport = this.aiDecisionSupportExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { decisionSupport };
  }
}

export function createAiActionPlanningExperienceRepository(
  deps?: ConstructorParameters<typeof AiActionPlanningExperienceRepository>[0]
): AiActionPlanningExperienceRepository {
  return new AiActionPlanningExperienceRepository(deps);
}
