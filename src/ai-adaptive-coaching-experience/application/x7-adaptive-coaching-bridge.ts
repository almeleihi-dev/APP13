import type { AdaptiveCoachingScenarioId } from "../domain/ai-adaptive-coaching-experience-schema.js";
import {
  PROGRESS_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForProgressIntelligence,
} from "../../ai-progress-intelligence-experience/application/x6-progress-intelligence-bridge.js";

export const ADAPTIVE_COACHING_SCENARIO_TO_CANONICAL = PROGRESS_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForAdaptiveCoaching(input: {
  scenarioId?: AdaptiveCoachingScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: AdaptiveCoachingScenarioId | null } {
  return resolveCanonicalActionIdForProgressIntelligence(input);
}
