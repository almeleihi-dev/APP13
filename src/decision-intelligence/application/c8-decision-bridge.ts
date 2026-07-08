import type { DecisionScenarioId } from "../domain/decision-intelligence-schema.js";
import {
  TRUST_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForTrust,
} from "../../trust-intelligence/application/c7-trust-bridge.js";

export const DECISION_SCENARIO_TO_CANONICAL = TRUST_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForDecision(input: {
  scenarioId?: DecisionScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: DecisionScenarioId | null } {
  return resolveCanonicalActionIdForTrust(input);
}
