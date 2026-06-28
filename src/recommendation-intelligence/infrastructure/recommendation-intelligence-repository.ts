import type { AuthContext } from "../../shared/auth/index.js";
import type { DecisionIntelligenceEngineService } from "../../decision-intelligence/application/decision-intelligence-service.js";
import type { DecisionIntelligenceQuery } from "../../decision-intelligence/application/decision-intelligence-service.js";
import {
  createDecisionIntelligenceRepository,
  type DecisionIntelligenceRepository,
} from "../../decision-intelligence/infrastructure/decision-intelligence-repository.js";
import { createDecisionIntelligenceEngineService } from "../../decision-intelligence/application/decision-intelligence-service.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { RecommendationIntelligenceContext } from "../domain/recommendation-context.js";

export interface UpstreamRecommendationInputs {
  decision: DecisionIntelligenceRecommendation;
  evaluation: OutcomeIntelligenceEvaluation;
  execution: ExecutionIntelligenceGuidance;
}

export class RecommendationIntelligenceRepository {
  private readonly decisionRepository: DecisionIntelligenceRepository;
  private readonly decisionIntelligenceEngine: DecisionIntelligenceEngineService;

  constructor(deps?: {
    decisionRepository?: DecisionIntelligenceRepository;
    decisionIntelligenceEngine?: DecisionIntelligenceEngineService;
  }) {
    this.decisionRepository = deps?.decisionRepository ?? createDecisionIntelligenceRepository();
    this.decisionIntelligenceEngine =
      deps?.decisionIntelligenceEngine ??
      createDecisionIntelligenceEngineService({ repository: this.decisionRepository });
  }

  listRecommendationScenarios() {
    return this.decisionRepository.listDecisionScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: RecommendationIntelligenceContext,
    query: DecisionIntelligenceQuery
  ): UpstreamRecommendationInputs {
    const decision = this.decisionIntelligenceEngine.getRecommendation(authContext, query).recommendation;
    const upstream = this.decisionRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "recommendation-intelligence",
      },
      query
    );

    return {
      decision,
      evaluation: upstream.evaluation,
      execution: upstream.execution,
    };
  }
}

export function createRecommendationIntelligenceRepository(
  deps?: ConstructorParameters<typeof RecommendationIntelligenceRepository>[0]
): RecommendationIntelligenceRepository {
  return new RecommendationIntelligenceRepository(deps);
}
