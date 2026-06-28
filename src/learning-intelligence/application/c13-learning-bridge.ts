import type { LearningScenarioId } from "../domain/learning-intelligence-schema.js";
import {
  STRATEGY_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForStrategy,
} from "../../strategy-intelligence/application/c12-strategy-bridge.js";

export const LEARNING_SCENARIO_TO_CANONICAL = STRATEGY_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForLearning(input: {
  scenarioId?: LearningScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: LearningScenarioId | null } {
  return resolveCanonicalActionIdForStrategy(input);
}
