import type { StrategicIntelligenceScenarioId } from "../domain/ai-strategic-intelligence-experience-schema.js";
import {
  DECISION_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForDecisionIntelligence,
} from "../../ai-decision-intelligence-experience/application/x13-decision-intelligence-bridge.js";

export const STRATEGIC_INTELLIGENCE_SCENARIO_TO_CANONICAL = DECISION_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForStrategicIntelligence(input: {
  scenarioId?: StrategicIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: StrategicIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForDecisionIntelligence(input);
}
