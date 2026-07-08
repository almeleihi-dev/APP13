import type { AuthContext } from "../../shared/auth/index.js";
import type { EvolutionIntelligenceEngineService } from "../../evolution-intelligence/application/evolution-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createEvolutionIntelligenceRepository,
  type EvolutionIntelligenceRepository,
} from "../../evolution-intelligence/infrastructure/evolution-intelligence-repository.js";
import { createEvolutionIntelligenceEngineService } from "../../evolution-intelligence/application/evolution-intelligence-service.js";
import type { EvolutionIntelligenceOutput } from "../../evolution-intelligence/domain/evolution-context.js";
import type { OptimizationIntelligenceOutput } from "../../optimization-intelligence/domain/optimization-context.js";
import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { OrchestrationIntelligenceContext } from "../domain/orchestration-context.js";

export interface UpstreamOrchestrationInputs {
  evolution: EvolutionIntelligenceOutput;
  optimization: OptimizationIntelligenceOutput;
  learning: LearningIntelligenceOutput;
  strategy: StrategyIntelligenceOutput;
  prediction: PredictionIntelligenceOutput;
}

export class OrchestrationIntelligenceRepository {
  private readonly evolutionRepository: EvolutionIntelligenceRepository;
  private readonly evolutionIntelligenceEngine: EvolutionIntelligenceEngineService;

  constructor(deps?: {
    evolutionRepository?: EvolutionIntelligenceRepository;
    evolutionIntelligenceEngine?: EvolutionIntelligenceEngineService;
  }) {
    this.evolutionRepository = deps?.evolutionRepository ?? createEvolutionIntelligenceRepository();
    this.evolutionIntelligenceEngine =
      deps?.evolutionIntelligenceEngine ??
      createEvolutionIntelligenceEngineService({ repository: this.evolutionRepository });
  }

  listOrchestrationScenarios() {
    return this.evolutionRepository.listEvolutionScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: OrchestrationIntelligenceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamOrchestrationInputs {
    const evolution = this.evolutionIntelligenceEngine.buildOutputForValidation(authContext, query);
    const evolutionUpstream = this.evolutionRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "orchestration-intelligence",
      },
      query
    );

    return {
      evolution,
      optimization: evolutionUpstream.optimization,
      learning: evolutionUpstream.learning,
      strategy: evolutionUpstream.strategy,
      prediction: evolutionUpstream.prediction,
    };
  }
}

export function createOrchestrationIntelligenceRepository(
  deps?: ConstructorParameters<typeof OrchestrationIntelligenceRepository>[0]
): OrchestrationIntelligenceRepository {
  return new OrchestrationIntelligenceRepository(deps);
}
