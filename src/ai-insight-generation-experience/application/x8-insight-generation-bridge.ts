import type { InsightGenerationScenarioId } from "../domain/ai-insight-generation-experience-schema.js";
import {
  ADAPTIVE_COACHING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForAdaptiveCoaching,
} from "../../ai-adaptive-coaching-experience/application/x7-adaptive-coaching-bridge.js";

export const INSIGHT_GENERATION_SCENARIO_TO_CANONICAL = ADAPTIVE_COACHING_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForInsightGeneration(input: {
  scenarioId?: InsightGenerationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: InsightGenerationScenarioId | null } {
  return resolveCanonicalActionIdForAdaptiveCoaching(input);
}
