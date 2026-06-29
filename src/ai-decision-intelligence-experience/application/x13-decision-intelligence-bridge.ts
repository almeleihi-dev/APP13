import type { DecisionIntelligenceScenarioId } from "../domain/ai-decision-intelligence-experience-schema.js";
import {
  ORCHESTRATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOrchestration,
} from "../../ai-orchestration-experience/application/x12-orchestration-bridge.js";

export const DECISION_INTELLIGENCE_SCENARIO_TO_CANONICAL = ORCHESTRATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForDecisionIntelligence(input: {
  scenarioId?: DecisionIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: DecisionIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForOrchestration(input);
}
