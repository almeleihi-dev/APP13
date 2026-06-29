import type { OrchestrationScenarioId } from "../domain/ai-orchestration-experience-schema.js";
import {
  EXECUTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecutiveIntelligence,
} from "../../ai-executive-intelligence-experience/application/x11-executive-intelligence-bridge.js";

export const ORCHESTRATION_SCENARIO_TO_CANONICAL = EXECUTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForOrchestration(input: {
  scenarioId?: OrchestrationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: OrchestrationScenarioId | null } {
  return resolveCanonicalActionIdForExecutiveIntelligence(input);
}
