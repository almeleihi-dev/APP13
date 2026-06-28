import type { OutcomeScenarioId } from "../domain/outcome-intelligence-schema.js";
import {
  EXECUTION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecution,
} from "../../execution-intelligence/application/c5-execution-bridge.js";

export const OUTCOME_SCENARIO_TO_CANONICAL = EXECUTION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForOutcome(input: {
  scenarioId?: OutcomeScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: OutcomeScenarioId | null } {
  return resolveCanonicalActionIdForExecution(input);
}
