import type { AuthContext } from "../../shared/auth/index.js";
import type { AiAccountabilityLedgerExperienceService } from "../../ai-accountability-ledger-experience/application/ai-accountability-ledger-experience-service.js";
import type { AiAccountabilityLedgerExperienceQuery } from "../../ai-accountability-ledger-experience/application/ai-accountability-ledger-experience-service.js";
import { createAiAccountabilityLedgerExperienceService } from "../../ai-accountability-ledger-experience/application/ai-accountability-ledger-experience-service.js";
import type { AiAccountabilityLedgerExperienceOutput } from "../../ai-accountability-ledger-experience/domain/ai-accountability-ledger-experience-context.js";
import type { AiConformanceValidationExperienceContext } from "../domain/ai-conformance-validation-experience-context.js";

export interface UpstreamConformanceValidationInputs {
  accountabilityLedger: AiAccountabilityLedgerExperienceOutput;
}

export class AiConformanceValidationExperienceRepository {
  private readonly aiAccountabilityLedgerExperience: AiAccountabilityLedgerExperienceService;

  constructor(deps?: {
    aiAccountabilityLedgerExperience?: AiAccountabilityLedgerExperienceService;
  }) {
    this.aiAccountabilityLedgerExperience =
      deps?.aiAccountabilityLedgerExperience ?? createAiAccountabilityLedgerExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiConformanceValidationExperienceContext,
    query: AiAccountabilityLedgerExperienceQuery
  ): UpstreamConformanceValidationInputs {
    const accountabilityLedger = this.aiAccountabilityLedgerExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { accountabilityLedger };
  }
}

export function createAiConformanceValidationExperienceRepository(
  deps?: ConstructorParameters<typeof AiConformanceValidationExperienceRepository>[0]
): AiConformanceValidationExperienceRepository {
  return new AiConformanceValidationExperienceRepository(deps);
}
