import type { PredictiveIntelligenceScenarioId } from "../domain/ai-predictive-intelligence-experience-schema.js";
import {
  RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForRecommendationIntelligence,
} from "../../ai-recommendation-intelligence-experience/application/x9-recommendation-intelligence-bridge.js";

export const PREDICTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL =
  RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForPredictiveIntelligence(input: {
  scenarioId?: PredictiveIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: PredictiveIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForRecommendationIntelligence(input);
}
