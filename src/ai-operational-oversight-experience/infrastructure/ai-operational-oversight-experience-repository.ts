import type { AuthContext } from "../../shared/auth/index.js";
import type { AiConformanceValidationExperienceService } from "../../ai-conformance-validation-experience/application/ai-conformance-validation-experience-service.js";
import type { AiConformanceValidationExperienceQuery } from "../../ai-conformance-validation-experience/application/ai-conformance-validation-experience-service.js";
import { createAiConformanceValidationExperienceService } from "../../ai-conformance-validation-experience/application/ai-conformance-validation-experience-service.js";
import type { AiConformanceValidationExperienceOutput } from "../../ai-conformance-validation-experience/domain/ai-conformance-validation-experience-context.js";
import type { AiOperationalOversightExperienceContext } from "../domain/ai-operational-oversight-experience-context.js";

export interface UpstreamOperationalOversightInputs {
  conformanceValidation: AiConformanceValidationExperienceOutput;
}

export class AiOperationalOversightExperienceRepository {
  private readonly aiConformanceValidationExperience: AiConformanceValidationExperienceService;

  constructor(deps?: {
    aiConformanceValidationExperience?: AiConformanceValidationExperienceService;
  }) {
    this.aiConformanceValidationExperience =
      deps?.aiConformanceValidationExperience ?? createAiConformanceValidationExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiOperationalOversightExperienceContext,
    query: AiConformanceValidationExperienceQuery
  ): UpstreamOperationalOversightInputs {
    const conformanceValidation = this.aiConformanceValidationExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { conformanceValidation };
  }
}

export function createAiOperationalOversightExperienceRepository(
  deps?: ConstructorParameters<typeof AiOperationalOversightExperienceRepository>[0]
): AiOperationalOversightExperienceRepository {
  return new AiOperationalOversightExperienceRepository(deps);
}
