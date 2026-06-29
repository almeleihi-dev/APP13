import type { AuthContext } from "../../shared/auth/index.js";
import type { AiExecutiveIntelligenceExperienceService } from "../../ai-executive-intelligence-experience/application/ai-executive-intelligence-experience-service.js";
import type { AiExecutiveIntelligenceExperienceQuery } from "../../ai-executive-intelligence-experience/application/ai-executive-intelligence-experience-service.js";
import { createAiExecutiveIntelligenceExperienceService } from "../../ai-executive-intelligence-experience/application/ai-executive-intelligence-experience-service.js";
import type { AiExecutiveIntelligenceExperienceOutput } from "../../ai-executive-intelligence-experience/domain/ai-executive-intelligence-experience-context.js";
import type { AiOrchestrationExperienceContext } from "../domain/ai-orchestration-experience-context.js";

export interface UpstreamOrchestrationInputs {
  executiveIntelligence: AiExecutiveIntelligenceExperienceOutput;
}

export class AiOrchestrationExperienceRepository {
  private readonly aiExecutiveIntelligenceExperience: AiExecutiveIntelligenceExperienceService;

  constructor(deps?: {
    aiExecutiveIntelligenceExperience?: AiExecutiveIntelligenceExperienceService;
  }) {
    this.aiExecutiveIntelligenceExperience =
      deps?.aiExecutiveIntelligenceExperience ??
      createAiExecutiveIntelligenceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiOrchestrationExperienceContext,
    query: AiExecutiveIntelligenceExperienceQuery
  ): UpstreamOrchestrationInputs {
    const executiveIntelligence =
      this.aiExecutiveIntelligenceExperience.buildOutputForValidation(authContext, query);
    return { executiveIntelligence };
  }
}

export function createAiOrchestrationExperienceRepository(
  deps?: ConstructorParameters<typeof AiOrchestrationExperienceRepository>[0]
): AiOrchestrationExperienceRepository {
  return new AiOrchestrationExperienceRepository(deps);
}
