import type { AuthContext } from "../../shared/auth/index.js";
import type { PredictionIntelligenceEngineService } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createPredictionIntelligenceRepository,
  type PredictionIntelligenceRepository,
} from "../../prediction-intelligence/infrastructure/prediction-intelligence-repository.js";
import { createPredictionIntelligenceEngineService } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { StrategyIntelligenceContext } from "../domain/strategy-context.js";

export interface UpstreamStrategyInputs {
  prediction: PredictionIntelligenceOutput;
  insight: InsightIntelligenceOutput;
  recommendation: RecommendationIntelligenceOutput;
  execution: ExecutionIntelligenceGuidance;
}

export class StrategyIntelligenceRepository {
  private readonly predictionRepository: PredictionIntelligenceRepository;
  private readonly predictionIntelligenceEngine: PredictionIntelligenceEngineService;

  constructor(deps?: {
    predictionRepository?: PredictionIntelligenceRepository;
    predictionIntelligenceEngine?: PredictionIntelligenceEngineService;
  }) {
    this.predictionRepository =
      deps?.predictionRepository ?? createPredictionIntelligenceRepository();
    this.predictionIntelligenceEngine =
      deps?.predictionIntelligenceEngine ??
      createPredictionIntelligenceEngineService({ repository: this.predictionRepository });
  }

  listStrategyScenarios() {
    return this.predictionRepository.listPredictionScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: StrategyIntelligenceContext,
    query: PredictionIntelligenceQuery
  ): UpstreamStrategyInputs {
    const prediction = this.predictionIntelligenceEngine.buildOutputForValidation(authContext, query);
    const upstream = this.predictionRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "strategy-intelligence",
      },
      query
    );

    return {
      prediction,
      insight: upstream.insight,
      recommendation: upstream.recommendation,
      execution: upstream.execution,
    };
  }
}

export function createStrategyIntelligenceRepository(
  deps?: ConstructorParameters<typeof StrategyIntelligenceRepository>[0]
): StrategyIntelligenceRepository {
  return new StrategyIntelligenceRepository(deps);
}
