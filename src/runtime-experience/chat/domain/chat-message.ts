export type MessageSenderRole = "customer" | "provider" | "system";

export type DeliveryPlaceholderStatus = "sent" | "delivered" | "read" | "pending";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
  sentAt: string;
  dateSeparator?: string;
  deliveryPlaceholder: DeliveryPlaceholderStatus;
}

export function buildMessage(input: {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
  sentAt: string;
  dateSeparator?: string;
  deliveryPlaceholder?: DeliveryPlaceholderStatus;
}): ChatMessage {
  return {
    id: input.id,
    conversationId: input.conversationId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    body: input.body,
    sentAt: input.sentAt,
    dateSeparator: input.dateSeparator,
    deliveryPlaceholder: input.deliveryPlaceholder ?? "sent",
  };
}

export function buildDefaultMessages(conversationId: string): ChatMessage[] {
  return [
    buildMessage({
      id: "msg-1",
      conversationId,
      senderId: "system",
      senderRole: "system",
      senderName: "AN ACT",
      body: "Conversation created for contract coordination.",
      sentAt: "2026-06-20T10:00:00.000Z",
      dateSeparator: "Today",
      deliveryPlaceholder: "delivered",
    }),
    buildMessage({
      id: "msg-2",
      conversationId,
      senderId: "customer-1",
      senderRole: "customer",
      senderName: "Customer",
      body: "Confirming access for Monday 10:00.",
      sentAt: "2026-06-20T10:05:00.000Z",
      deliveryPlaceholder: "read",
    }),
    buildMessage({
      id: "msg-3",
      conversationId,
      senderId: "provider-1",
      senderRole: "provider",
      senderName: "Licensed Professional",
      body: "Confirmed. I will arrive with required materials.",
      sentAt: "2026-06-20T10:08:00.000Z",
      deliveryPlaceholder: "delivered",
    }),
  ];
}

export function buildDraftMessage(
  conversationId: string,
  input: { senderId: string; senderRole: MessageSenderRole; senderName: string; body: string; sentAt: string }
): ChatMessage {
  return buildMessage({
    id: `msg-${Date.now()}`,
    conversationId,
    ...input,
    deliveryPlaceholder: "pending",
  });
}
