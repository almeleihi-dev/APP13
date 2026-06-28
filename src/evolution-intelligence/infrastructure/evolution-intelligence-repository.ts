import type { AuthContext } from "../../shared/auth/index.js";
import type { OptimizationIntelligenceEngineService } from "../../optimization-intelligence/application/optimization-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createOptimizationIntelligenceRepository,
  type OptimizationIntelligenceRepository,
} from "../../optimization-intelligence/infrastructure/optimization-intelligence-repository.js";
import { createOptimizationIntelligenceEngineService } from "../../optimization-intelligence/application/optimization-intelligence-service.js";
import type { OptimizationIntelligenceOutput } from "../../optimization-intelligence/domain/optimization-context.js";
import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { EvolutionIntelligenceContext } from "../domain/evolution-context.js";

export interface UpstreamEvolutionInputs {
  optimization: OptimizationIntelligenceOutput;
  learning: LearningIntelligenceOutput;
  strategy: StrategyIntelligenceOutput;
  prediction: PredictionIntelligenceOutput;
}

export class EvolutionIntelligenceRepository {
  private readonly optimizationRepository: OptimizationIntelligenceRepository;
  private readonly optimizationIntelligenceEngine: OptimizationIntelligenceEngineService;

  constructor(deps?: {
    optimizationRepository?: OptimizationIntelligenceRepository;
    optimizationIntelligenceEngine?: OptimizationIntelligenceEngineService;
  }) {
    this.optimizationRepository =
      deps?.optimizationRepository ?? createOptimizationIntelligenceRepository();
    this.optimizationIntelligenceEngine =
      deps?.optimizationIntelligenceEngine ??
      createOptimizationIntelligenceEngineService({ repository: this.optimizationRepository });
  }

  listEvolutionScenarios() {
    return this.optimizationRepository.listOptimizationScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: EvolutionIntelligenceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamEvolutionInputs {
    const optimization = this.optimizationIntelligenceEngine.buildOutputForValidation(
      authContext,
      query
    );
    const optimizationUpstream = this.optimizationRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "evolution-intelligence",
      },
      query
    );

    return {
      optimization,
      learning: optimizationUpstream.learning,
      strategy: optimizationUpstream.strategy,
      prediction: optimizationUpstream.prediction,
    };
  }
}

export function createEvolutionIntelligenceRepository(
  deps?: ConstructorParameters<typeof EvolutionIntelligenceRepository>[0]
): EvolutionIntelligenceRepository {
  return new EvolutionIntelligenceRepository(deps);
}
