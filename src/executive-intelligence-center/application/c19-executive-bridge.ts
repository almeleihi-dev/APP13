import type { ExecutiveIntelligenceCenterScenarioId } from "../domain/executive-intelligence-center-schema.js";
import {
  INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForDashboard,
} from "../../intelligence-dashboard/application/c18-dashboard-bridge.js";

export const EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_TO_CANONICAL =
  INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExecutiveCenter(input: {
  scenarioId?: ExecutiveIntelligenceCenterScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ExecutiveIntelligenceCenterScenarioId | null } {
  return resolveCanonicalActionIdForDashboard(input);
}
