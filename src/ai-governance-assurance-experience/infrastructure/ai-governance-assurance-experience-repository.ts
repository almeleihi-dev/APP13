import type { AuthContext } from "../../shared/auth/index.js";
import type { AiExecutiveAdvisoryExperienceService } from "../../ai-executive-advisory-experience/application/ai-executive-advisory-experience-service.js";
import type { AiExecutiveAdvisoryExperienceQuery } from "../../ai-executive-advisory-experience/application/ai-executive-advisory-experience-service.js";
import { createAiExecutiveAdvisoryExperienceService } from "../../ai-executive-advisory-experience/application/ai-executive-advisory-experience-service.js";
import type { AiExecutiveAdvisoryExperienceOutput } from "../../ai-executive-advisory-experience/domain/ai-executive-advisory-experience-context.js";
import type { AiGovernanceAssuranceExperienceContext } from "../domain/ai-governance-assurance-experience-context.js";

export interface UpstreamGovernanceAssuranceInputs {
  executiveAdvisory: AiExecutiveAdvisoryExperienceOutput;
}

export class AiGovernanceAssuranceExperienceRepository {
  private readonly aiExecutiveAdvisoryExperience: AiExecutiveAdvisoryExperienceService;

  constructor(deps?: {
    aiExecutiveAdvisoryExperience?: AiExecutiveAdvisoryExperienceService;
  }) {
    this.aiExecutiveAdvisoryExperience =
      deps?.aiExecutiveAdvisoryExperience ?? createAiExecutiveAdvisoryExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiGovernanceAssuranceExperienceContext,
    query: AiExecutiveAdvisoryExperienceQuery
  ): UpstreamGovernanceAssuranceInputs {
    const executiveAdvisory = this.aiExecutiveAdvisoryExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { executiveAdvisory };
  }
}

export function createAiGovernanceAssuranceExperienceRepository(
  deps?: ConstructorParameters<typeof AiGovernanceAssuranceExperienceRepository>[0]
): AiGovernanceAssuranceExperienceRepository {
  return new AiGovernanceAssuranceExperienceRepository(deps);
}
