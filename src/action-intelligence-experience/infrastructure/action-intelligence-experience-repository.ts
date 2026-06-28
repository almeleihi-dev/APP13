import type { AuthContext } from "../../shared/auth/index.js";
import type { OrchestrationIntelligenceEngineService } from "../../orchestration-intelligence/application/orchestration-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createOrchestrationIntelligenceRepository,
  type OrchestrationIntelligenceRepository,
} from "../../orchestration-intelligence/infrastructure/orchestration-intelligence-repository.js";
import { createOrchestrationIntelligenceEngineService } from "../../orchestration-intelligence/application/orchestration-intelligence-service.js";
import type { OrchestrationIntelligenceOutput } from "../../orchestration-intelligence/domain/orchestration-context.js";
import type { ActionIntelligenceExperienceContext } from "../domain/action-intelligence-experience-context.js";

export interface UpstreamExperienceInputs {
  orchestration: OrchestrationIntelligenceOutput;
}

export class ActionIntelligenceExperienceRepository {
  private readonly orchestrationRepository: OrchestrationIntelligenceRepository;
  private readonly orchestrationIntelligenceEngine: OrchestrationIntelligenceEngineService;

  constructor(deps?: {
    orchestrationRepository?: OrchestrationIntelligenceRepository;
    orchestrationIntelligenceEngine?: OrchestrationIntelligenceEngineService;
  }) {
    this.orchestrationRepository =
      deps?.orchestrationRepository ?? createOrchestrationIntelligenceRepository();
    this.orchestrationIntelligenceEngine =
      deps?.orchestrationIntelligenceEngine ??
      createOrchestrationIntelligenceEngineService({ repository: this.orchestrationRepository });
  }

  listExperienceScenarios() {
    return this.orchestrationRepository.listOrchestrationScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: ActionIntelligenceExperienceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamExperienceInputs {
    const orchestration = this.orchestrationIntelligenceEngine.buildOutputForValidation(
      authContext,
      query
    );
    return { orchestration };
  }
}

export function createActionIntelligenceExperienceRepository(
  deps?: ConstructorParameters<typeof ActionIntelligenceExperienceRepository>[0]
): ActionIntelligenceExperienceRepository {
  return new ActionIntelligenceExperienceRepository(deps);
}
