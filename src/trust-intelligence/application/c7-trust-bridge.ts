import type { TrustScenarioId } from "../domain/trust-intelligence-schema.js";
import {
  OUTCOME_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOutcome,
} from "../../outcome-intelligence/application/c6-outcome-bridge.js";

export const TRUST_SCENARIO_TO_CANONICAL = OUTCOME_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForTrust(input: {
  scenarioId?: TrustScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: TrustScenarioId | null } {
  return resolveCanonicalActionIdForOutcome(input);
}
