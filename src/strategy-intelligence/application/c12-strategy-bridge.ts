import type { StrategyScenarioId } from "../domain/strategy-intelligence-schema.js";
import {
  PREDICTION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPrediction,
} from "../../prediction-intelligence/application/c11-prediction-bridge.js";

export const STRATEGY_SCENARIO_TO_CANONICAL = PREDICTION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForStrategy(input: {
  scenarioId?: StrategyScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: StrategyScenarioId | null } {
  return resolveCanonicalActionIdForPrediction(input);
}
