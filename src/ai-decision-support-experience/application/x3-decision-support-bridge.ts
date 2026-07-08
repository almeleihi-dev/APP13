import type { DecisionSupportScenarioId } from "../domain/ai-decision-support-experience-schema.js";
import {
  GUIDANCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForGuidance,
} from "../../ai-guidance-experience/application/x2-guidance-bridge.js";

export const DECISION_SUPPORT_SCENARIO_TO_CANONICAL = GUIDANCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForDecisionSupport(input: {
  scenarioId?: DecisionSupportScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: DecisionSupportScenarioId | null } {
  return resolveCanonicalActionIdForGuidance(input);
}
