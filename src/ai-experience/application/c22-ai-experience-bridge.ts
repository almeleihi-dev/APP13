import type { AiExperienceScenarioId } from "../domain/ai-experience-foundation-schema.js";
import {
  CLOSURE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForClosure,
} from "../../action-intelligence-final-closure/application/c21-closure-bridge.js";

export const AI_EXPERIENCE_SCENARIO_TO_CANONICAL = CLOSURE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForAiExperience(input: {
  scenarioId?: AiExperienceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: AiExperienceScenarioId | null } {
  return resolveCanonicalActionIdForClosure(input);
}
