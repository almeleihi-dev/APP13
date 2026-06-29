import type { OperationalOversightScenarioId } from "../domain/ai-operational-oversight-experience-schema.js";
import {
  CONFORMANCE_VALIDATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForConformanceValidation,
} from "../../ai-conformance-validation-experience/application/x19-conformance-validation-bridge.js";

export const OPERATIONAL_OVERSIGHT_SCENARIO_TO_CANONICAL = CONFORMANCE_VALIDATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForOperationalOversight(input: {
  scenarioId?: OperationalOversightScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: OperationalOversightScenarioId | null } {
  return resolveCanonicalActionIdForConformanceValidation(input);
}
