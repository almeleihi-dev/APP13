import type { AuthContext } from "../../shared/auth/index.js";
import type { ActionIntelligenceExperienceService } from "../../action-intelligence-experience/application/action-intelligence-experience-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createActionIntelligenceExperienceRepository,
  type ActionIntelligenceExperienceRepository,
} from "../../action-intelligence-experience/infrastructure/action-intelligence-experience-repository.js";
import { createActionIntelligenceExperienceService } from "../../action-intelligence-experience/application/action-intelligence-experience-service.js";
import type { ActionIntelligenceExperienceOutput } from "../../action-intelligence-experience/domain/action-intelligence-experience-context.js";
import type { IntelligenceDashboardContext } from "../domain/intelligence-dashboard-context.js";

export interface UpstreamDashboardInputs {
  experience: ActionIntelligenceExperienceOutput;
}

export class IntelligenceDashboardRepository {
  private readonly experienceRepository: ActionIntelligenceExperienceRepository;
  private readonly actionIntelligenceExperience: ActionIntelligenceExperienceService;

  constructor(deps?: {
    experienceRepository?: ActionIntelligenceExperienceRepository;
    actionIntelligenceExperience?: ActionIntelligenceExperienceService;
  }) {
    this.experienceRepository =
      deps?.experienceRepository ?? createActionIntelligenceExperienceRepository();
    this.actionIntelligenceExperience =
      deps?.actionIntelligenceExperience ??
      createActionIntelligenceExperienceService({ repository: this.experienceRepository });
  }

  listDashboardScenarios() {
    return this.experienceRepository.listExperienceScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: IntelligenceDashboardContext,
    query: PredictionIntelligenceQuery
  ): UpstreamDashboardInputs {
    const experience = this.actionIntelligenceExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { experience };
  }
}

export function createIntelligenceDashboardRepository(
  deps?: ConstructorParameters<typeof IntelligenceDashboardRepository>[0]
): IntelligenceDashboardRepository {
  return new IntelligenceDashboardRepository(deps);
}
