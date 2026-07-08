import type { ConversationSummary } from "../domain/conversation.js";
import type { ChatMessage } from "../domain/chat-message.js";
import { canSendMessages } from "../domain/conversation.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { buildMessageInputSection } from "./message-input.js";
import { buildAttachmentPlaceholderSection } from "./attachment-placeholder.js";

export function buildConversationScreen(
  conversation: ConversationSummary,
  messages: ChatMessage[],
  draftMessage: string,
  navigation: NavigationState,
  generatedAt: string
) {
  const canSend = canSendMessages(conversation.state);
  const messageComponents = messages.flatMap((msg) => {
    const items = [];
    if (msg.dateSeparator) {
      items.push(
        buildComponentInstance({
          id: `sep-${msg.id}`,
          componentId: "core-ui-card",
          props: { title: msg.dateSeparator, variant: "date-separator" },
          label: `Messages from ${msg.dateSeparator}`,
          role: "separator",
        })
      );
    }
    items.push(
      buildComponentInstance({
        id: `msg-${msg.id}`,
        componentId: "core-ui-card",
        props: {
          messageId: msg.id,
          body: msg.body,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          sentAt: msg.sentAt,
          deliveryPlaceholder: msg.deliveryPlaceholder,
        },
        label: `${msg.senderName}: ${msg.body}`,
        role: msg.senderRole === "system" ? "status" : "listitem",
      })
    );
    return items;
  });

  return buildRuntimeScreenView({
    screenId: "conversation-screen",
    navigation,
    generatedAt,
    sections: [
      {
        id: "conversation-header",
        label: "Conversation Header",
        purpose: "Conversation title and context.",
        components: [
          buildComponentInstance({
            id: "header-bar",
            componentId: "core-ui-navigation-bar",
            props: { title: conversation.title, subtitle: conversation.context.type },
            label: conversation.title,
            role: "banner",
          }),
        ],
      },
      {
        id: "messages",
        label: "Messages",
        purpose: "Message thread with timestamps and delivery placeholders.",
        components: messageComponents,
      },
      {
        id: "scroll-state",
        label: "Scroll State",
        purpose: "Scroll region metadata for accessibility.",
        components: [
          buildComponentInstance({
            id: "scroll-region",
            componentId: "core-ui-card",
            props: { scrollable: true, messageCount: messages.length, role: "log" },
            label: `Message thread with ${messages.length} messages`,
            role: "log",
          }),
        ],
      },
      buildMessageInputSection(draftMessage, canSend),
      buildAttachmentPlaceholderSection(canSend),
    ],
  });
}
