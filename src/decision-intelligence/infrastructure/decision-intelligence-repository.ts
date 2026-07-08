import type { AuthContext } from "../../shared/auth/index.js";
import type { TrustIntelligenceEngineService } from "../../trust-intelligence/application/trust-intelligence-service.js";
import type { TrustIntelligenceQuery } from "../../trust-intelligence/application/trust-intelligence-service.js";
import {
  createTrustIntelligenceRepository,
  type TrustIntelligenceRepository,
} from "../../trust-intelligence/infrastructure/trust-intelligence-repository.js";
import { createTrustIntelligenceEngineService } from "../../trust-intelligence/application/trust-intelligence-service.js";
import type { TrustIntelligenceRecommendation } from "../../trust-intelligence/domain/trust-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { DecisionIntelligenceContext } from "../domain/decision-context.js";

export interface UpstreamDecisionInputs {
  trust: TrustIntelligenceRecommendation;
  evaluation: OutcomeIntelligenceEvaluation;
  execution: ExecutionIntelligenceGuidance;
  contract: ContractIntelligenceRecommendation;
}

export class DecisionIntelligenceRepository {
  private readonly trustRepository: TrustIntelligenceRepository;
  private readonly trustIntelligenceEngine: TrustIntelligenceEngineService;

  constructor(deps?: {
    trustRepository?: TrustIntelligenceRepository;
    trustIntelligenceEngine?: TrustIntelligenceEngineService;
  }) {
    this.trustRepository = deps?.trustRepository ?? createTrustIntelligenceRepository();
    this.trustIntelligenceEngine =
      deps?.trustIntelligenceEngine ??
      createTrustIntelligenceEngineService({ repository: this.trustRepository });
  }

  listDecisionScenarios() {
    return this.trustRepository.listTrustScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: DecisionIntelligenceContext,
    query: TrustIntelligenceQuery
  ): UpstreamDecisionInputs {
    const trust = this.trustIntelligenceEngine.getRecommendation(authContext, query).recommendation;
    const upstream = this.trustRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "decision-intelligence",
      },
      query
    );

    return {
      trust,
      evaluation: upstream.evaluation,
      execution: upstream.execution,
      contract: upstream.contract,
    };
  }
}

export function createDecisionIntelligenceRepository(
  deps?: ConstructorParameters<typeof DecisionIntelligenceRepository>[0]
): DecisionIntelligenceRepository {
  return new DecisionIntelligenceRepository(deps);
}
