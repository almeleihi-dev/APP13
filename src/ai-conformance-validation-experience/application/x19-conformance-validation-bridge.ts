import type { ConformanceValidationScenarioId } from "../domain/ai-conformance-validation-experience-schema.js";
import {
  ACCOUNTABILITY_LEDGER_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForAccountabilityLedger,
} from "../../ai-accountability-ledger-experience/application/x18-accountability-ledger-bridge.js";

export const CONFORMANCE_VALIDATION_SCENARIO_TO_CANONICAL = ACCOUNTABILITY_LEDGER_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForConformanceValidation(input: {
  scenarioId?: ConformanceValidationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ConformanceValidationScenarioId | null } {
  return resolveCanonicalActionIdForAccountabilityLedger(input);
}
