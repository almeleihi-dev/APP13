import type { AuthContext } from "../../shared/auth/index.js";
import type { InsightIntelligenceEngineService } from "../../insight-intelligence/application/insight-intelligence-service.js";
import type { InsightIntelligenceQuery } from "../../insight-intelligence/application/insight-intelligence-service.js";
import {
  createInsightIntelligenceRepository,
  type InsightIntelligenceRepository,
} from "../../insight-intelligence/infrastructure/insight-intelligence-repository.js";
import { createInsightIntelligenceEngineService } from "../../insight-intelligence/application/insight-intelligence-service.js";
import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { PredictionIntelligenceContext } from "../domain/prediction-context.js";

export interface UpstreamPredictionInputs {
  insight: InsightIntelligenceOutput;
  recommendation: RecommendationIntelligenceOutput;
  decision: DecisionIntelligenceRecommendation;
  evaluation: OutcomeIntelligenceEvaluation;
  execution: ExecutionIntelligenceGuidance;
}

export class PredictionIntelligenceRepository {
  private readonly insightRepository: InsightIntelligenceRepository;
  private readonly insightIntelligenceEngine: InsightIntelligenceEngineService;

  constructor(deps?: {
    insightRepository?: InsightIntelligenceRepository;
    insightIntelligenceEngine?: InsightIntelligenceEngineService;
  }) {
    this.insightRepository = deps?.insightRepository ?? createInsightIntelligenceRepository();
    this.insightIntelligenceEngine =
      deps?.insightIntelligenceEngine ??
      createInsightIntelligenceEngineService({ repository: this.insightRepository });
  }

  listPredictionScenarios() {
    return this.insightRepository.listInsightScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: PredictionIntelligenceContext,
    query: InsightIntelligenceQuery
  ): UpstreamPredictionInputs {
    const insight = this.insightIntelligenceEngine.buildOutputForValidation(authContext, query);
    const upstream = this.insightRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "prediction-intelligence",
      },
      query
    );

    return {
      insight,
      recommendation: upstream.recommendation,
      decision: upstream.decision,
      evaluation: upstream.evaluation,
      execution: upstream.execution,
    };
  }
}

export function createPredictionIntelligenceRepository(
  deps?: ConstructorParameters<typeof PredictionIntelligenceRepository>[0]
): PredictionIntelligenceRepository {
  return new PredictionIntelligenceRepository(deps);
}
