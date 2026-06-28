import type { ClosureScenarioId } from "../domain/action-intelligence-final-closure-schema.js";
import {
  CERTIFICATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForCertification,
} from "../../action-intelligence-certification/application/c20-certification-bridge.js";

export const CLOSURE_SCENARIO_TO_CANONICAL = CERTIFICATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForClosure(input: {
  scenarioId?: ClosureScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ClosureScenarioId | null } {
  return resolveCanonicalActionIdForCertification(input);
}
