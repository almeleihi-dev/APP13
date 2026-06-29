import type { ExecutiveAdvisoryScenarioId } from "../domain/ai-executive-advisory-experience-schema.js";
import {
  PREDICTIVE_FORECAST_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPredictiveForecast,
} from "../../ai-predictive-forecast-experience/application/x15-predictive-forecast-bridge.js";

export const EXECUTIVE_ADVISORY_SCENARIO_TO_CANONICAL = PREDICTIVE_FORECAST_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExecutiveAdvisory(input: {
  scenarioId?: ExecutiveAdvisoryScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ExecutiveAdvisoryScenarioId | null } {
  return resolveCanonicalActionIdForPredictiveForecast(input);
}
