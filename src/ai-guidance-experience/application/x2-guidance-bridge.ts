import type { GuidanceScenarioId } from "../domain/ai-guidance-experience-schema.js";
import {
  CONVERSATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForConversation,
} from "../../ai-conversation-experience/application/x1-conversation-bridge.js";

export const GUIDANCE_SCENARIO_TO_CANONICAL = CONVERSATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForGuidance(input: {
  scenarioId?: GuidanceScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: GuidanceScenarioId | null } {
  return resolveCanonicalActionIdForConversation(input);
}
