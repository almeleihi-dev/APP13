import type { AuthContext } from "../../shared/auth/index.js";
import type { LearningIntelligenceEngineService } from "../../learning-intelligence/application/learning-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createLearningIntelligenceRepository,
  type LearningIntelligenceRepository,
} from "../../learning-intelligence/infrastructure/learning-intelligence-repository.js";
import { createLearningIntelligenceEngineService } from "../../learning-intelligence/application/learning-intelligence-service.js";
import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { OptimizationIntelligenceContext } from "../domain/optimization-context.js";

export interface UpstreamOptimizationInputs {
  learning: LearningIntelligenceOutput;
  strategy: StrategyIntelligenceOutput;
  prediction: PredictionIntelligenceOutput;
  evaluation: OutcomeIntelligenceEvaluation;
}

export class OptimizationIntelligenceRepository {
  private readonly learningRepository: LearningIntelligenceRepository;
  private readonly learningIntelligenceEngine: LearningIntelligenceEngineService;

  constructor(deps?: {
    learningRepository?: LearningIntelligenceRepository;
    learningIntelligenceEngine?: LearningIntelligenceEngineService;
  }) {
    this.learningRepository = deps?.learningRepository ?? createLearningIntelligenceRepository();
    this.learningIntelligenceEngine =
      deps?.learningIntelligenceEngine ??
      createLearningIntelligenceEngineService({ repository: this.learningRepository });
  }

  listOptimizationScenarios() {
    return this.learningRepository.listLearningScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: OptimizationIntelligenceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamOptimizationInputs {
    const learning = this.learningIntelligenceEngine.buildOutputForValidation(authContext, query);
    const learningUpstream = this.learningRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "optimization-intelligence",
      },
      query
    );

    return {
      learning,
      strategy: learningUpstream.strategy,
      prediction: learningUpstream.prediction,
      evaluation: learningUpstream.evaluation,
    };
  }
}

export function createOptimizationIntelligenceRepository(
  deps?: ConstructorParameters<typeof OptimizationIntelligenceRepository>[0]
): OptimizationIntelligenceRepository {
  return new OptimizationIntelligenceRepository(deps);
}
