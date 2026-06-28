import type { AuthContext } from "../../shared/auth/index.js";
import type { DynamicPricingService } from "../../dynamic-pricing/application/dynamic-pricing-service.js";
import type { DynamicPricingQuery } from "../../dynamic-pricing/application/dynamic-pricing-service.js";
import {
  createDynamicPricingRepository,
  type DynamicPricingRepository,
} from "../../dynamic-pricing/infrastructure/dynamic-pricing-repository.js";
import { createDynamicPricingService } from "../../dynamic-pricing/application/dynamic-pricing-service.js";
import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractScenarioId } from "../domain/contract-intelligence-schema.js";
import { resolveCanonicalActionIdForContract } from "../application/c4-contract-bridge.js";
import type { ContractIntelligenceContext } from "../domain/contract-context.js";

export interface UpstreamContractInputs {
  plan: ActionPlan;
  canonicalAction: CanonicalAction;
  scenarioId: ContractScenarioId | null;
  pricingRange: {
    recommendationId: string;
    min: number;
    max: number;
    currency: string;
    midpoint: number;
  };
  pricingConfidenceScore: number;
}

export class ContractIntelligenceRepository {
  private readonly pricingRepository: DynamicPricingRepository;
  private readonly dynamicPricing: DynamicPricingService;

  constructor(deps?: {
    pricingRepository?: DynamicPricingRepository;
    dynamicPricing?: DynamicPricingService;
  }) {
    this.pricingRepository = deps?.pricingRepository ?? createDynamicPricingRepository();
    this.dynamicPricing = deps?.dynamicPricing ?? createDynamicPricingService({
      repository: this.pricingRepository,
    });
  }

  listContractScenarios() {
    return this.pricingRepository.listPricingScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: ContractIntelligenceContext,
    query: DynamicPricingQuery
  ): UpstreamContractInputs {
    const resolved = resolveCanonicalActionIdForContract({
      scenarioId: context.scenarioId,
      canonicalActionId: context.canonicalActionId,
    });

    const plan = this.pricingRepository.buildPlanFromContext({
      scenarioId: resolved.scenarioId ?? undefined,
      canonicalActionId: resolved.canonicalActionId,
      rawIntent: context.rawIntent,
      source: context.source ?? "contract-intelligence",
    });

    const canonicalAction = this.pricingRepository.getCanonicalAction(resolved.canonicalActionId);
    if (!canonicalAction) {
      throw new Error(`Canonical action not found: ${resolved.canonicalActionId}`);
    }

    const rangeScreen = this.dynamicPricing.getRange(authContext, query);
    const pricingRecommendationId = rangeScreen.recommendation_id;

    return {
      plan,
      canonicalAction,
      scenarioId: resolved.scenarioId,
      pricingRange: {
        recommendationId: pricingRecommendationId,
        min: rangeScreen.recommended_range.min,
        max: rangeScreen.recommended_range.max,
        currency: rangeScreen.recommended_range.currency,
        midpoint: rangeScreen.recommended_range.midpoint,
      },
      pricingConfidenceScore: rangeScreen.confidence.score,
    };
  }
}

export function createContractIntelligenceRepository(
  deps?: ConstructorParameters<typeof ContractIntelligenceRepository>[0]
): ContractIntelligenceRepository {
  return new ContractIntelligenceRepository(deps);
}
