import type { AuthContext } from "../../shared/auth/index.js";
import type { ContractIntelligenceEngineService } from "../../contract-intelligence/application/contract-intelligence-service.js";
import type { ContractIntelligenceQuery } from "../../contract-intelligence/application/contract-intelligence-service.js";
import {
  createContractIntelligenceRepository,
  type ContractIntelligenceRepository,
} from "../../contract-intelligence/infrastructure/contract-intelligence-repository.js";
import { createContractIntelligenceEngineService } from "../../contract-intelligence/application/contract-intelligence-service.js";
import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { ExecutionIntelligenceContext } from "../domain/execution-context.js";

export interface UpstreamExecutionInputs {
  contract: ContractIntelligenceRecommendation;
  plan: ActionPlan;
  canonicalAction: CanonicalAction;
}

export class ExecutionIntelligenceRepository {
  private readonly contractRepository: ContractIntelligenceRepository;
  private readonly contractIntelligenceEngine: ContractIntelligenceEngineService;

  constructor(deps?: {
    contractRepository?: ContractIntelligenceRepository;
    contractIntelligenceEngine?: ContractIntelligenceEngineService;
  }) {
    this.contractRepository = deps?.contractRepository ?? createContractIntelligenceRepository();
    this.contractIntelligenceEngine =
      deps?.contractIntelligenceEngine ??
      createContractIntelligenceEngineService({ repository: this.contractRepository });
  }

  listExecutionScenarios() {
    return this.contractRepository.listContractScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: ExecutionIntelligenceContext,
    query: ContractIntelligenceQuery
  ): UpstreamExecutionInputs {
    const contract = this.contractIntelligenceEngine.getRecommendation(authContext, query).recommendation;

    const upstream = this.contractRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "execution-intelligence",
      },
      {
        scenario_id: query.scenario_id,
        canonical_action_id: query.canonical_action_id,
        urgency: query.urgency,
        distance_band: query.distance_band,
        intent: query.intent,
      }
    );

    return {
      contract,
      plan: upstream.plan,
      canonicalAction: upstream.canonicalAction,
    };
  }
}

export function createExecutionIntelligenceRepository(
  deps?: ConstructorParameters<typeof ExecutionIntelligenceRepository>[0]
): ExecutionIntelligenceRepository {
  return new ExecutionIntelligenceRepository(deps);
}
