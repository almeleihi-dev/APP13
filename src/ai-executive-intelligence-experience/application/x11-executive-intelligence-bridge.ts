import type { ExecutiveIntelligenceScenarioId } from "../domain/ai-executive-intelligence-experience-schema.js";
import {
  PREDICTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPredictiveIntelligence,
} from "../../ai-predictive-intelligence-experience/application/x10-predictive-intelligence-bridge.js";

export const EXECUTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL =
  PREDICTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExecutiveIntelligence(input: {
  scenarioId?: ExecutiveIntelligenceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ExecutiveIntelligenceScenarioId | null } {
  return resolveCanonicalActionIdForPredictiveIntelligence(input);
}
