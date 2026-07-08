import type { IntelligenceDashboardScenarioId } from "../domain/intelligence-dashboard-schema.js";
import {
  ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExperience,
} from "../../action-intelligence-experience/application/c17-experience-bridge.js";

export const INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL =
  ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForDashboard(input: {
  scenarioId?: IntelligenceDashboardScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: IntelligenceDashboardScenarioId | null } {
  return resolveCanonicalActionIdForExperience(input);
}
