import type { InsightScenarioId } from "../domain/insight-intelligence-schema.js";
import {
  RECOMMENDATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForRecommendation,
} from "../../recommendation-intelligence/application/c9-recommendation-bridge.js";

export const INSIGHT_SCENARIO_TO_CANONICAL = RECOMMENDATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForInsight(input: {
  scenarioId?: InsightScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: InsightScenarioId | null } {
  return resolveCanonicalActionIdForRecommendation(input);
}
