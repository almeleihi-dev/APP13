import type { OptimizationScenarioId } from "../domain/optimization-intelligence-schema.js";
import {
  LEARNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForLearning,
} from "../../learning-intelligence/application/c13-learning-bridge.js";

export const OPTIMIZATION_SCENARIO_TO_CANONICAL = LEARNING_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForOptimization(input: {
  scenarioId?: OptimizationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: OptimizationScenarioId | null } {
  return resolveCanonicalActionIdForLearning(input);
}
