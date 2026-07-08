import type { PricingScenarioId } from "../domain/dynamic-pricing-schema.js";
import { PRICING_REFERENCE_VALUES } from "../domain/pricing-reference-values.js";
import { PRICING_SCENARIO_TO_CANONICAL } from "../application/c3-pricing-bridge.js";
import { createActionPlanBuilder } from "../../action-planning/application/action-plan-builder.js";
import { resolveCanonicalActionIdForPlanning } from "../../action-planning/application/c2-planning-bridge.js";
import {
  createActionPlanningRepository,
  type ActionPlanningRepository,
} from "../../action-planning/infrastructure/action-planning-repository.js";
import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { ActionPlanningContext } from "../../action-planning/domain/action-plan.js";
import type { PlanningScenarioId } from "../../action-planning/domain/action-planning-schema.js";

/** C1-aligned market anchor bands (read-only reference, SAR). */
const SCENARIO_PRICE_ANCHORS: Record<
  PricingScenarioId,
  { min: number; max: number; currency: string; basis: string }
> = {
  moving_a_room: { min: 80, max: 350, currency: "SAR", basis: "room volume and handler count" },
  cleaning_an_apartment: {
    min: 120,
    max: 450,
    currency: "SAR",
    basis: "apartment size and deep-clean scope",
  },
  delivering_a_document: {
    min: 25,
    max: 120,
    currency: "SAR",
    basis: "distance and urgency",
  },
  fixing_small_home_issue: {
    min: 75,
    max: 280,
    currency: "SAR",
    basis: "parts and licensed trade requirement",
  },
  preparing_professional_service_request: {
    min: 0,
    max: 0,
    currency: "SAR",
    basis: "preparation only — pricing deferred to provider matching",
  },
};

export class DynamicPricingRepository {
  private readonly planningRepository: ActionPlanningRepository;
  private readonly planBuilder = createActionPlanBuilder();

  constructor(deps?: { planningRepository?: ActionPlanningRepository }) {
    this.planningRepository =
      deps?.planningRepository ?? createActionPlanningRepository();
  }

  getReferenceValues() {
    return PRICING_REFERENCE_VALUES;
  }

  getScenarioPriceAnchor(scenarioId: PricingScenarioId | null) {
    if (!scenarioId) return undefined;
    return SCENARIO_PRICE_ANCHORS[scenarioId];
  }

  listPricingScenarios(): Array<{
    scenarioId: PricingScenarioId;
    canonicalActionId: string;
    goal: string;
  }> {
    return this.planningRepository.listPlanningScenarios() as Array<{
      scenarioId: PricingScenarioId;
      canonicalActionId: string;
      goal: string;
    }>;
  }

  buildPlanFromContext(context: ActionPlanningContext): ActionPlan {
    const resolved = resolveCanonicalActionIdForPlanning({
      scenarioId: context.scenarioId as PlanningScenarioId | undefined,
      canonicalActionId: context.canonicalActionId,
    });
    const canonicalAction = this.planningRepository.getCanonicalAction(
      resolved.canonicalActionId
    );
    if (!canonicalAction) {
      throw new Error(`Canonical action not found: ${resolved.canonicalActionId}`);
    }
    return this.planBuilder.build(context, canonicalAction);
  }

  getCanonicalAction(canonicalActionId: string) {
    return this.planningRepository.getCanonicalAction(canonicalActionId);
  }

  getCanonicalActionForScenario(scenarioId: PricingScenarioId) {
    const canonicalActionId = PRICING_SCENARIO_TO_CANONICAL[scenarioId];
    return this.planningRepository.getCanonicalAction(canonicalActionId);
  }
}

export function createDynamicPricingRepository(
  deps?: ConstructorParameters<typeof DynamicPricingRepository>[0]
): DynamicPricingRepository {
  return new DynamicPricingRepository(deps);
}
