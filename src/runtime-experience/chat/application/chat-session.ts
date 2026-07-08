import type { ChatSessionState } from "../domain/chat-state.js";
import type { ConversationSummary } from "../domain/conversation.js";
import type { ChatMessage } from "../domain/chat-message.js";
import type { ChatRepository } from "../infrastructure/chat-repository.js";

export interface ChatSessionContext {
  session: ChatSessionState;
  conversations: ConversationSummary[];
  activeConversation?: ConversationSummary;
  messages: ChatMessage[];
}

export function resolveChatSessionContext(
  repository: ChatRepository,
  session: ChatSessionState
): ChatSessionContext {
  const conversations = repository.getActiveConversations(session.userId);
  const activeConversation = session.activeConversationId
    ? repository.getConversation(session.userId, session.activeConversationId)
    : conversations[0];
  const messages = activeConversation ? repository.getMessages(activeConversation.id) : [];
  return { session, conversations, activeConversation, messages };
}

export function syncConversationActivation(
  repository: ChatRepository,
  userId: string,
  conversationId: string
): ConversationSummary | undefined {
  return repository.activateConversation(userId, conversationId);
}
