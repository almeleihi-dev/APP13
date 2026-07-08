import type { ActionIntelligenceExperienceScenarioId } from "../domain/action-intelligence-experience-schema.js";
import {
  ORCHESTRATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOrchestration,
} from "../../orchestration-intelligence/application/c16-orchestration-bridge.js";

export const ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_TO_CANONICAL =
  ORCHESTRATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExperience(input: {
  scenarioId?: ActionIntelligenceExperienceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ActionIntelligenceExperienceScenarioId | null } {
  return resolveCanonicalActionIdForOrchestration(input);
}
