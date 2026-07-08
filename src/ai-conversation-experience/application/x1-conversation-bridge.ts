import type { ConversationScenarioId } from "../domain/ai-conversation-experience-schema.js";
import {
  AI_EXPERIENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForAiExperience,
} from "../../ai-experience/application/c22-ai-experience-bridge.js";

export const CONVERSATION_SCENARIO_TO_CANONICAL = AI_EXPERIENCE_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForConversation(input: {
  scenarioId?: ConversationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ConversationScenarioId | null } {
  return resolveCanonicalActionIdForAiExperience(input);
}
