import type { ExecutionCompanionScenarioId } from "../domain/ai-execution-companion-experience-schema.js";
import {
  ACTION_PLANNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForActionPlanning,
} from "../../ai-action-planning-experience/application/x4-action-planning-bridge.js";

export const EXECUTION_COMPANION_SCENARIO_TO_CANONICAL = ACTION_PLANNING_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExecutionCompanion(input: {
  scenarioId?: ExecutionCompanionScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ExecutionCompanionScenarioId | null } {
  return resolveCanonicalActionIdForActionPlanning(input);
}
