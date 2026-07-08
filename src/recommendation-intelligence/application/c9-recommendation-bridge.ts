import type { RecommendationScenarioId } from "../domain/recommendation-intelligence-schema.js";
import {
  DECISION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForDecision,
} from "../../decision-intelligence/application/c8-decision-bridge.js";

export const RECOMMENDATION_SCENARIO_TO_CANONICAL = DECISION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForRecommendation(input: {
  scenarioId?: RecommendationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: RecommendationScenarioId | null } {
  return resolveCanonicalActionIdForDecision(input);
}
