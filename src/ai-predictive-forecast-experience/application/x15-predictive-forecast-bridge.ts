import type { PredictiveForecastScenarioId } from "../domain/ai-predictive-forecast-experience-schema.js";
import {
  STRATEGIC_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForStrategicIntelligence,
} from "../../ai-strategic-intelligence-experience/application/x14-strategic-intelligence-bridge.js";

export const PREDICTIVE_FORECAST_SCENARIO_TO_CANONICAL = STRATEGIC_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForPredictiveForecast(input: {
  scenarioId?: PredictiveForecastScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: PredictiveForecastScenarioId | null } {
  return resolveCanonicalActionIdForStrategicIntelligence(input);
}
