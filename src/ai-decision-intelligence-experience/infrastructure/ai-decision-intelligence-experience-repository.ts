import type { AuthContext } from "../../shared/auth/index.js";
import type { AiOrchestrationExperienceService } from "../../ai-orchestration-experience/application/ai-orchestration-experience-service.js";
import type { AiOrchestrationExperienceQuery } from "../../ai-orchestration-experience/application/ai-orchestration-experience-service.js";
import { createAiOrchestrationExperienceService } from "../../ai-orchestration-experience/application/ai-orchestration-experience-service.js";
import type { AiOrchestrationExperienceOutput } from "../../ai-orchestration-experience/domain/ai-orchestration-experience-context.js";
import type { AiDecisionIntelligenceExperienceContext } from "../domain/ai-decision-intelligence-experience-context.js";

export interface UpstreamDecisionIntelligenceInputs {
  orchestration: AiOrchestrationExperienceOutput;
}

export class AiDecisionIntelligenceExperienceRepository {
  private readonly aiOrchestrationExperience: AiOrchestrationExperienceService;

  constructor(deps?: { aiOrchestrationExperience?: AiOrchestrationExperienceService }) {
    this.aiOrchestrationExperience =
      deps?.aiOrchestrationExperience ?? createAiOrchestrationExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiDecisionIntelligenceExperienceContext,
    query: AiOrchestrationExperienceQuery
  ): UpstreamDecisionIntelligenceInputs {
    const orchestration = this.aiOrchestrationExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { orchestration };
  }
}

export function createAiDecisionIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiDecisionIntelligenceExperienceRepository>[0]
): AiDecisionIntelligenceExperienceRepository {
  return new AiDecisionIntelligenceExperienceRepository(deps);
}
