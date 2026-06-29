import type { AuthContext } from "../../shared/auth/index.js";
import type { AiGovernanceAssuranceExperienceService } from "../../ai-governance-assurance-experience/application/ai-governance-assurance-experience-service.js";
import type { AiGovernanceAssuranceExperienceQuery } from "../../ai-governance-assurance-experience/application/ai-governance-assurance-experience-service.js";
import { createAiGovernanceAssuranceExperienceService } from "../../ai-governance-assurance-experience/application/ai-governance-assurance-experience-service.js";
import type { AiGovernanceAssuranceExperienceOutput } from "../../ai-governance-assurance-experience/domain/ai-governance-assurance-experience-context.js";
import type { AiAccountabilityLedgerExperienceContext } from "../domain/ai-accountability-ledger-experience-context.js";

export interface UpstreamAccountabilityLedgerInputs {
  governanceAssurance: AiGovernanceAssuranceExperienceOutput;
}

export class AiAccountabilityLedgerExperienceRepository {
  private readonly aiGovernanceAssuranceExperience: AiGovernanceAssuranceExperienceService;

  constructor(deps?: {
    aiGovernanceAssuranceExperience?: AiGovernanceAssuranceExperienceService;
  }) {
    this.aiGovernanceAssuranceExperience =
      deps?.aiGovernanceAssuranceExperience ?? createAiGovernanceAssuranceExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiAccountabilityLedgerExperienceContext,
    query: AiGovernanceAssuranceExperienceQuery
  ): UpstreamAccountabilityLedgerInputs {
    const governanceAssurance = this.aiGovernanceAssuranceExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { governanceAssurance };
  }
}

export function createAiAccountabilityLedgerExperienceRepository(
  deps?: ConstructorParameters<typeof AiAccountabilityLedgerExperienceRepository>[0]
): AiAccountabilityLedgerExperienceRepository {
  return new AiAccountabilityLedgerExperienceRepository(deps);
}
