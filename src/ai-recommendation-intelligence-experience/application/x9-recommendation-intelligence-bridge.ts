import type { RecommendationIntelligenceScenarioId } from "../domain/ai-recommendation-intelligence-experience-schema.js";
import {
  INSIGHT_GENERATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForInsightGeneration,
} from "../../ai-insight-generation-experience/application/x8-insight-generation-bridge.js";

export const RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL =
  INSIGHT_GENERATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForRecommendationIntelligence(input: {
  scenarioId?: RecommendationIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: RecommendationIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForInsightGeneration(input);
}
