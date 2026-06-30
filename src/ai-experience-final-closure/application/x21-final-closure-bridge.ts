import type { FinalClosureScenarioId } from "../domain/ai-experience-final-closure-schema.js";
import {
  OPERATIONAL_OVERSIGHT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOperationalOversight,
} from "../../ai-operational-oversight-experience/application/x20-operational-oversight-bridge.js";

export const FINAL_CLOSURE_SCENARIO_TO_CANONICAL = OPERATIONAL_OVERSIGHT_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForFinalClosure(input: {
  scenarioId?: FinalClosureScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: FinalClosureScenarioId | null } {
  return resolveCanonicalActionIdForOperationalOversight(input);
}
