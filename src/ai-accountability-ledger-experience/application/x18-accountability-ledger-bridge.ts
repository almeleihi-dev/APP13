import type { AccountabilityLedgerScenarioId } from "../domain/ai-accountability-ledger-experience-schema.js";
import {
  GOVERNANCE_ASSURANCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForGovernanceAssurance,
} from "../../ai-governance-assurance-experience/application/x17-governance-assurance-bridge.js";

export const ACCOUNTABILITY_LEDGER_SCENARIO_TO_CANONICAL = GOVERNANCE_ASSURANCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForAccountabilityLedger(input: {
  scenarioId?: AccountabilityLedgerScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: AccountabilityLedgerScenarioId | null } {
  return resolveCanonicalActionIdForGovernanceAssurance(input);
}
