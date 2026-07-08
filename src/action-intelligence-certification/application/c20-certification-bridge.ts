import type { CertificationScenarioId } from "../domain/action-intelligence-certification-schema.js";
import {
  EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecutiveCenter,
} from "../../executive-intelligence-center/application/c19-executive-bridge.js";

export const CERTIFICATION_SCENARIO_TO_CANONICAL = EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForCertification(input: {
  scenarioId?: CertificationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: CertificationScenarioId | null } {
  return resolveCanonicalActionIdForExecutiveCenter(input);
}
