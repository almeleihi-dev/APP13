import type { AuthContext } from "../../shared/auth/index.js";
import type { AiOperationalOversightExperienceService } from "../../ai-operational-oversight-experience/application/ai-operational-oversight-experience-service.js";
import type { AiOperationalOversightExperienceQuery } from "../../ai-operational-oversight-experience/application/ai-operational-oversight-experience-service.js";
import { createAiOperationalOversightExperienceService } from "../../ai-operational-oversight-experience/application/ai-operational-oversight-experience-service.js";
import type { AiOperationalOversightExperienceOutput } from "../../ai-operational-oversight-experience/domain/ai-operational-oversight-experience-context.js";
import type { AiExperienceFinalClosureContext } from "../domain/ai-experience-final-closure-context.js";

export interface UpstreamFinalClosureInputs {
  operationalOversight: AiOperationalOversightExperienceOutput;
}

export class AiExperienceFinalClosureRepository {
  private readonly aiOperationalOversightExperience: AiOperationalOversightExperienceService;

  constructor(deps?: {
    aiOperationalOversightExperience?: AiOperationalOversightExperienceService;
  }) {
    this.aiOperationalOversightExperience =
      deps?.aiOperationalOversightExperience ?? createAiOperationalOversightExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiExperienceFinalClosureContext,
    query: AiOperationalOversightExperienceQuery
  ): UpstreamFinalClosureInputs {
    const operationalOversight = this.aiOperationalOversightExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { operationalOversight };
  }
}

export function createAiExperienceFinalClosureRepository(
  deps?: ConstructorParameters<typeof AiExperienceFinalClosureRepository>[0]
): AiExperienceFinalClosureRepository {
  return new AiExperienceFinalClosureRepository(deps);
}
