import type { AuthContext } from "../../shared/auth/index.js";
import type { OutcomeIntelligenceEngineService } from "../../outcome-intelligence/application/outcome-intelligence-service.js";
import type { OutcomeIntelligenceQuery } from "../../outcome-intelligence/application/outcome-intelligence-service.js";
import {
  createOutcomeIntelligenceRepository,
  type OutcomeIntelligenceRepository,
} from "../../outcome-intelligence/infrastructure/outcome-intelligence-repository.js";
import { createOutcomeIntelligenceEngineService } from "../../outcome-intelligence/application/outcome-intelligence-service.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { TrustIntelligenceContext } from "../domain/trust-context.js";

export interface UpstreamTrustInputs {
  evaluation: OutcomeIntelligenceEvaluation;
  execution: ExecutionIntelligenceGuidance;
  contract: ContractIntelligenceRecommendation;
  canonicalAction: CanonicalAction;
}

export class TrustIntelligenceRepository {
  private readonly outcomeRepository: OutcomeIntelligenceRepository;
  private readonly outcomeIntelligenceEngine: OutcomeIntelligenceEngineService;

  constructor(deps?: {
    outcomeRepository?: OutcomeIntelligenceRepository;
    outcomeIntelligenceEngine?: OutcomeIntelligenceEngineService;
  }) {
    this.outcomeRepository = deps?.outcomeRepository ?? createOutcomeIntelligenceRepository();
    this.outcomeIntelligenceEngine =
      deps?.outcomeIntelligenceEngine ??
      createOutcomeIntelligenceEngineService({ repository: this.outcomeRepository });
  }

  listTrustScenarios() {
    return this.outcomeRepository.listOutcomeScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: TrustIntelligenceContext,
    query: OutcomeIntelligenceQuery
  ): UpstreamTrustInputs {
    const evaluation = this.outcomeIntelligenceEngine.getEvaluation(authContext, query).evaluation;
    const upstream = this.outcomeRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "trust-intelligence",
      },
      query
    );

    return {
      evaluation,
      execution: upstream.guidance,
      contract: upstream.contract,
      canonicalAction: upstream.canonicalAction,
    };
  }
}

export function createTrustIntelligenceRepository(
  deps?: ConstructorParameters<typeof TrustIntelligenceRepository>[0]
): TrustIntelligenceRepository {
  return new TrustIntelligenceRepository(deps);
}
