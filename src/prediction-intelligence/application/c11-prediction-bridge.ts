import type { PredictionScenarioId } from "../domain/prediction-intelligence-schema.js";
import {
  INSIGHT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForInsight,
} from "../../insight-intelligence/application/c10-insight-bridge.js";

export const PREDICTION_SCENARIO_TO_CANONICAL = INSIGHT_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForPrediction(input: {
  scenarioId?: PredictionScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: PredictionScenarioId | null } {
  return resolveCanonicalActionIdForInsight(input);
}
