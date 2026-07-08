import type { ProgressIntelligenceScenarioId } from "../domain/ai-progress-intelligence-experience-schema.js";
import {
  EXECUTION_COMPANION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecutionCompanion,
} from "../../ai-execution-companion-experience/application/x5-execution-companion-bridge.js";

export const PROGRESS_INTELLIGENCE_SCENARIO_TO_CANONICAL = EXECUTION_COMPANION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForProgressIntelligence(input: {
  scenarioId?: ProgressIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ProgressIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForExecutionCompanion(input);
}
