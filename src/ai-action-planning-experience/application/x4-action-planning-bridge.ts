import type { ActionPlanningScenarioId } from "../domain/ai-action-planning-experience-schema.js";
import {
  DECISION_SUPPORT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForDecisionSupport,
} from "../../ai-decision-support-experience/application/x3-decision-support-bridge.js";

export const ACTION_PLANNING_SCENARIO_TO_CANONICAL = DECISION_SUPPORT_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForActionPlanning(input: {
  scenarioId?: ActionPlanningScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ActionPlanningScenarioId | null } {
  return resolveCanonicalActionIdForDecisionSupport(input);
}
