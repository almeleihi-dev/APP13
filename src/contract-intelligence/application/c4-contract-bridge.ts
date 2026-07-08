import type { ContractScenarioId } from "../domain/contract-intelligence-schema.js";
import {
  PLANNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPlanning,
} from "../../action-planning/application/c2-planning-bridge.js";
import type { PlanningScenarioId } from "../../action-planning/domain/action-planning-schema.js";

export const CONTRACT_SCENARIO_TO_CANONICAL = PLANNING_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForContract(input: {
  scenarioId?: ContractScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ContractScenarioId | null } {
  const resolved = resolveCanonicalActionIdForPlanning({
    scenarioId: input.scenarioId as PlanningScenarioId | undefined,
    canonicalActionId: input.canonicalActionId,
  });
  return {
    canonicalActionId: resolved.canonicalActionId,
    scenarioId: resolved.scenarioId as ContractScenarioId | null,
  };
}
