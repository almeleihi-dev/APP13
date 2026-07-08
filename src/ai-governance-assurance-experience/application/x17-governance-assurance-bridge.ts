import type { GovernanceAssuranceScenarioId } from "../domain/ai-governance-assurance-experience-schema.js";
import {
  EXECUTIVE_ADVISORY_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecutiveAdvisory,
} from "../../ai-executive-advisory-experience/application/x16-executive-advisory-bridge.js";

export const GOVERNANCE_ASSURANCE_SCENARIO_TO_CANONICAL = EXECUTIVE_ADVISORY_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForGovernanceAssurance(input: {
  scenarioId?: GovernanceAssuranceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: GovernanceAssuranceScenarioId | null } {
  return resolveCanonicalActionIdForExecutiveAdvisory(input);
}
