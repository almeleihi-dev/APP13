import type { AuthContext } from "../../shared/auth/index.js";
import type { AiExecutionCompanionExperienceService } from "../../ai-execution-companion-experience/application/ai-execution-companion-experience-service.js";
import type { AiExecutionCompanionExperienceQuery } from "../../ai-execution-companion-experience/application/ai-execution-companion-experience-service.js";
import { createAiExecutionCompanionExperienceService } from "../../ai-execution-companion-experience/application/ai-execution-companion-experience-service.js";
import type { AiExecutionCompanionExperienceOutput } from "../../ai-execution-companion-experience/domain/ai-execution-companion-experience-context.js";
import type { AiProgressIntelligenceExperienceContext } from "../domain/ai-progress-intelligence-experience-context.js";

export interface UpstreamProgressIntelligenceInputs {
  executionCompanion: AiExecutionCompanionExperienceOutput;
}

export class AiProgressIntelligenceExperienceRepository {
  private readonly aiExecutionCompanionExperience: AiExecutionCompanionExperienceService;

  constructor(deps?: { aiExecutionCompanionExperience?: AiExecutionCompanionExperienceService }) {
    this.aiExecutionCompanionExperience =
      deps?.aiExecutionCompanionExperience ?? createAiExecutionCompanionExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiProgressIntelligenceExperienceContext,
    query: AiExecutionCompanionExperienceQuery
  ): UpstreamProgressIntelligenceInputs {
    const executionCompanion = this.aiExecutionCompanionExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { executionCompanion };
  }
}

export function createAiProgressIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof AiProgressIntelligenceExperienceRepository>[0]
): AiProgressIntelligenceExperienceRepository {
  return new AiProgressIntelligenceExperienceRepository(deps);
}
