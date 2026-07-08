import type { AuthContext } from "../../shared/auth/index.js";
import type { AiActionPlanningExperienceService } from "../../ai-action-planning-experience/application/ai-action-planning-experience-service.js";
import type { AiActionPlanningExperienceQuery } from "../../ai-action-planning-experience/application/ai-action-planning-experience-service.js";
import { createAiActionPlanningExperienceService } from "../../ai-action-planning-experience/application/ai-action-planning-experience-service.js";
import type { AiActionPlanningExperienceOutput } from "../../ai-action-planning-experience/domain/ai-action-planning-experience-context.js";
import type { AiExecutionCompanionExperienceContext } from "../domain/ai-execution-companion-experience-context.js";

export interface UpstreamExecutionCompanionInputs {
  actionPlanning: AiActionPlanningExperienceOutput;
}

export class AiExecutionCompanionExperienceRepository {
  private readonly aiActionPlanningExperience: AiActionPlanningExperienceService;

  constructor(deps?: { aiActionPlanningExperience?: AiActionPlanningExperienceService }) {
    this.aiActionPlanningExperience =
      deps?.aiActionPlanningExperience ?? createAiActionPlanningExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiExecutionCompanionExperienceContext,
    query: AiActionPlanningExperienceQuery
  ): UpstreamExecutionCompanionInputs {
    const actionPlanning = this.aiActionPlanningExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { actionPlanning };
  }
}

export function createAiExecutionCompanionExperienceRepository(
  deps?: ConstructorParameters<typeof AiExecutionCompanionExperienceRepository>[0]
): AiExecutionCompanionExperienceRepository {
  return new AiExecutionCompanionExperienceRepository(deps);
}
