import type { ConversationSummary } from "../domain/conversation.js";
import { canSendMessages } from "../domain/conversation.js";
import type { ChatMessage } from "../domain/chat-message.js";

export interface ChatSessionValidation {
  valid: boolean;
  errors: string[];
  canSend: boolean;
  messageCount: number;
}

export function validateChatSession(input: {
  conversation?: ConversationSummary;
  messages: ChatMessage[];
  draftMessage: string;
}): ChatSessionValidation {
  const errors: string[] = [];
  if (!input.conversation) {
    errors.push("No active conversation");
  }
  const canSend = input.conversation ? canSendMessages(input.conversation.state) : false;
  if (input.draftMessage.trim() && !canSend) {
    errors.push("Cannot send messages in current conversation state");
  }
  return {
    valid: errors.length === 0,
    errors,
    canSend: canSend && input.draftMessage.trim().length > 0,
    messageCount: input.messages.length,
  };
}

export function validateMessageDraft(body: string): { valid: boolean; error?: string } {
  if (!body.trim()) return { valid: false, error: "Message cannot be empty" };
  if (body.length > 4000) return { valid: false, error: "Message exceeds maximum length" };
  return { valid: true };
}
