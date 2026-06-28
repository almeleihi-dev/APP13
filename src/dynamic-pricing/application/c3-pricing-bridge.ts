import type { PricingScenarioId } from "../domain/dynamic-pricing-schema.js";
import {
  PLANNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPlanning,
} from "../../action-planning/application/c2-planning-bridge.js";
import type { PlanningScenarioId } from "../../action-planning/domain/action-planning-schema.js";

export const PRICING_SCENARIO_TO_CANONICAL = PLANNING_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForPricing(input: {
  scenarioId?: PricingScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: PricingScenarioId | null } {
  const resolved = resolveCanonicalActionIdForPlanning({
    scenarioId: input.scenarioId as PlanningScenarioId | undefined,
    canonicalActionId: input.canonicalActionId,
  });
  return {
    canonicalActionId: resolved.canonicalActionId,
    scenarioId: resolved.scenarioId as PricingScenarioId | null,
  };
}

export function isPricingScenarioId(value: string): value is PricingScenarioId {
  return value in PLANNING_SCENARIO_TO_CANONICAL;
}
