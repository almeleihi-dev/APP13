import type { ConversationSummary, ConversationState, ConversationContext } from "../domain/conversation.js";
import { buildDefaultConversation } from "../domain/conversation.js";
import type { ChatMessage } from "../domain/chat-message.js";
import { buildDefaultMessages, buildDraftMessage } from "../domain/chat-message.js";

export class ChatRepository {
  private readonly conversations = new Map<string, ConversationSummary[]>();
  private readonly messages = new Map<string, ChatMessage[]>();

  getConversations(userId: string): ConversationSummary[] {
    if (!this.conversations.has(userId)) {
      const conv = buildDefaultConversation(`conv-${userId.slice(-6)}`);
      this.conversations.set(userId, [conv]);
      this.messages.set(conv.id, buildDefaultMessages(conv.id));
    }
    return [...(this.conversations.get(userId) ?? [])];
  }

  getConversation(userId: string, conversationId: string): ConversationSummary | undefined {
    return this.getConversations(userId).find((c) => c.id === conversationId);
  }

  getMessages(conversationId: string): ChatMessage[] {
    return [...(this.messages.get(conversationId) ?? [])];
  }

  createConversation(
    userId: string,
    input: { title: string; context: ConversationContext; createdAt: string }
  ): ConversationSummary {
    const conv = buildDefaultConversation(`conv-${Date.now()}`, {
      title: input.title,
      state: "draft",
      context: input.context,
      createdAt: input.createdAt,
      lastActivityAt: input.createdAt,
      latestMessagePreview: "Conversation created.",
      unreadPlaceholder: 0,
    });
    const existing = this.conversations.get(userId) ?? [];
    this.conversations.set(userId, [conv, ...existing]);
    this.messages.set(conv.id, buildDefaultMessages(conv.id));
    return conv;
  }

  activateConversation(userId: string, conversationId: string): ConversationSummary | undefined {
    const conv = this.getConversation(userId, conversationId);
    if (!conv) return undefined;
    conv.state = "active";
    return this.updateConversation(userId, conv);
  }

  updateConversationState(
    userId: string,
    conversationId: string,
    state: ConversationState
  ): ConversationSummary | undefined {
    const conv = this.getConversation(userId, conversationId);
    if (!conv) return undefined;
    conv.state = state;
    return this.updateConversation(userId, conv);
  }

  appendLocalMessage(
    userId: string,
    conversationId: string,
    input: { senderId: string; senderRole: "customer" | "provider"; senderName: string; body: string; sentAt: string }
  ): ChatMessage | undefined {
    const conv = this.getConversation(userId, conversationId);
    if (!conv || !input.body.trim()) return undefined;
    const message = buildDraftMessage(conversationId, { ...input, body: input.body.trim() });
    message.deliveryPlaceholder = "sent";
    const existing = this.messages.get(conversationId) ?? [];
    this.messages.set(conversationId, [...existing, message]);
    conv.latestMessagePreview = message.body;
    conv.lastActivityAt = input.sentAt;
    conv.unreadPlaceholder = 0;
    this.updateConversation(userId, conv);
    return message;
  }

  getActiveConversations(userId: string): ConversationSummary[] {
    return this.getConversations(userId).filter((c) => c.state !== "archived");
  }

  archiveConversation(userId: string, conversationId: string): ConversationSummary | undefined {
    return this.updateConversationState(userId, conversationId, "archived");
  }

  private updateConversation(userId: string, updated: ConversationSummary): ConversationSummary {
    const list = this.getConversations(userId).map((c) => (c.id === updated.id ? { ...updated } : c));
    this.conversations.set(userId, list);
    return { ...updated };
  }
}

export function createChatRepository(): ChatRepository {
  return new ChatRepository();
}

let singleton: ChatRepository | undefined;

export function chatRepository(): ChatRepository {
  if (!singleton) singleton = createChatRepository();
  return singleton;
}
