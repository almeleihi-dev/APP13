import type { AuthContext } from "../../shared/auth/index.js";
import type { StrategyIntelligenceEngineService } from "../../strategy-intelligence/application/strategy-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createStrategyIntelligenceRepository,
  type StrategyIntelligenceRepository,
} from "../../strategy-intelligence/infrastructure/strategy-intelligence-repository.js";
import { createStrategyIntelligenceEngineService } from "../../strategy-intelligence/application/strategy-intelligence-service.js";
import {
  createPredictionIntelligenceRepository,
  type PredictionIntelligenceRepository,
} from "../../prediction-intelligence/infrastructure/prediction-intelligence-repository.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { LearningIntelligenceContext } from "../domain/learning-context.js";

export interface UpstreamLearningInputs {
  strategy: StrategyIntelligenceOutput;
  prediction: PredictionIntelligenceOutput;
  insight: InsightIntelligenceOutput;
  evaluation: OutcomeIntelligenceEvaluation;
}

export class LearningIntelligenceRepository {
  private readonly strategyRepository: StrategyIntelligenceRepository;
  private readonly predictionRepository: PredictionIntelligenceRepository;
  private readonly strategyIntelligenceEngine: StrategyIntelligenceEngineService;

  constructor(deps?: {
    strategyRepository?: StrategyIntelligenceRepository;
    predictionRepository?: PredictionIntelligenceRepository;
    strategyIntelligenceEngine?: StrategyIntelligenceEngineService;
  }) {
    this.strategyRepository = deps?.strategyRepository ?? createStrategyIntelligenceRepository();
    this.predictionRepository = deps?.predictionRepository ?? createPredictionIntelligenceRepository();
    this.strategyIntelligenceEngine =
      deps?.strategyIntelligenceEngine ??
      createStrategyIntelligenceEngineService({ repository: this.strategyRepository });
  }

  listLearningScenarios() {
    return this.strategyRepository.listStrategyScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: LearningIntelligenceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamLearningInputs {
    const strategy = this.strategyIntelligenceEngine.buildOutputForValidation(authContext, query);
    const strategyUpstream = this.strategyRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "learning-intelligence",
      },
      query
    );
    const evaluation = this.predictionRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "learning-intelligence",
      },
      query
    ).evaluation;

    return {
      strategy,
      prediction: strategyUpstream.prediction,
      insight: strategyUpstream.insight,
      evaluation,
    };
  }
}

export function createLearningIntelligenceRepository(
  deps?: ConstructorParameters<typeof LearningIntelligenceRepository>[0]
): LearningIntelligenceRepository {
  return new LearningIntelligenceRepository(deps);
}
