import type { AuthContext } from "../../shared/auth/index.js";
import type { RecommendationIntelligenceEngineService } from "../../recommendation-intelligence/application/recommendation-intelligence-service.js";
import type { RecommendationIntelligenceQuery } from "../../recommendation-intelligence/application/recommendation-intelligence-service.js";
import {
  createRecommendationIntelligenceRepository,
  type RecommendationIntelligenceRepository,
} from "../../recommendation-intelligence/infrastructure/recommendation-intelligence-repository.js";
import { createRecommendationIntelligenceEngineService } from "../../recommendation-intelligence/application/recommendation-intelligence-service.js";
import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { InsightIntelligenceContext } from "../domain/insight-context.js";

export interface UpstreamInsightInputs {
  recommendation: RecommendationIntelligenceOutput;
  decision: DecisionIntelligenceRecommendation;
  evaluation: OutcomeIntelligenceEvaluation;
  execution: ExecutionIntelligenceGuidance;
}

export class InsightIntelligenceRepository {
  private readonly recommendationRepository: RecommendationIntelligenceRepository;
  private readonly recommendationIntelligenceEngine: RecommendationIntelligenceEngineService;

  constructor(deps?: {
    recommendationRepository?: RecommendationIntelligenceRepository;
    recommendationIntelligenceEngine?: RecommendationIntelligenceEngineService;
  }) {
    this.recommendationRepository =
      deps?.recommendationRepository ?? createRecommendationIntelligenceRepository();
    this.recommendationIntelligenceEngine =
      deps?.recommendationIntelligenceEngine ??
      createRecommendationIntelligenceEngineService({ repository: this.recommendationRepository });
  }

  listInsightScenarios() {
    return this.recommendationRepository.listRecommendationScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: InsightIntelligenceContext,
    query: RecommendationIntelligenceQuery
  ): UpstreamInsightInputs {
    const recommendation = this.recommendationIntelligenceEngine.getRecommendation(
      authContext,
      query
    ).recommendation;
    const upstream = this.recommendationRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "insight-intelligence",
      },
      query
    );

    return {
      recommendation,
      decision: upstream.decision,
      evaluation: upstream.evaluation,
      execution: upstream.execution,
    };
  }
}

export function createInsightIntelligenceRepository(
  deps?: ConstructorParameters<typeof InsightIntelligenceRepository>[0]
): InsightIntelligenceRepository {
  return new InsightIntelligenceRepository(deps);
}
