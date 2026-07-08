import type { PlanningScenarioId } from "../domain/action-planning-schema.js";
import {
  C1_SCENARIO_TO_CANONICAL_ACTION,
  resolveCanonicalActionIdFromScenario,
} from "../../action-ontology/application/c1-ontology-bridge.js";
import type { ScenarioId } from "../../unified-action-intelligence/domain/action-intelligence-schema.js";

export const PLANNING_SCENARIO_TO_CANONICAL: Record<PlanningScenarioId, string> = {
  moving_a_room: C1_SCENARIO_TO_CANONICAL_ACTION.moving_a_room,
  cleaning_an_apartment: C1_SCENARIO_TO_CANONICAL_ACTION.cleaning_an_apartment,
  delivering_a_document: C1_SCENARIO_TO_CANONICAL_ACTION.delivering_a_document,
  fixing_small_home_issue: C1_SCENARIO_TO_CANONICAL_ACTION.fixing_small_home_issue,
  preparing_professional_service_request:
    C1_SCENARIO_TO_CANONICAL_ACTION.preparing_professional_service_request,
};

export function resolvePlanningScenarioId(
  scenarioId: PlanningScenarioId
): PlanningScenarioId {
  return scenarioId;
}

export function resolveCanonicalActionIdForPlanning(input: {
  scenarioId?: PlanningScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: PlanningScenarioId | null } {
  if (input.scenarioId) {
    return {
      canonicalActionId: PLANNING_SCENARIO_TO_CANONICAL[input.scenarioId],
      scenarioId: input.scenarioId,
    };
  }
  if (input.canonicalActionId) {
    const scenarioEntry = Object.entries(PLANNING_SCENARIO_TO_CANONICAL).find(
      ([, actionId]) => actionId === input.canonicalActionId
    );
    return {
      canonicalActionId: input.canonicalActionId,
      scenarioId: (scenarioEntry?.[0] as PlanningScenarioId) ?? null,
    };
  }
  return {
    canonicalActionId: PLANNING_SCENARIO_TO_CANONICAL.moving_a_room,
    scenarioId: "moving_a_room",
  };
}

export function resolveCanonicalActionFromC1Scenario(
  scenarioId: ScenarioId
): string {
  return resolveCanonicalActionIdFromScenario(scenarioId);
}

export { PLANNING_SCENARIO_TO_CANONICAL as C2_PLANNING_CANONICAL_MAP };
