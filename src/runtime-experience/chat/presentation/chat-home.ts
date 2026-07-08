import type { ConversationSummary } from "../domain/conversation.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CHAT_NAV_ITEMS } from "../application/chat-navigation.js";

export function buildChatHomeScreen(
  conversations: ConversationSummary[],
  navigation: NavigationState,
  generatedAt: string
) {
  const active = conversations.filter((c) => c.state === "active" || c.state === "waiting");

  return buildRuntimeScreenView({
    screenId: "chat-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "active-conversations",
        label: "Active Conversations",
        purpose: "Action-centric conversations tied to requests, contracts, or active actions.",
        components:
          active.length > 0
            ? active.map((conv) =>
                buildComponentInstance({
                  id: `conv-${conv.id}`,
                  componentId: "core-ui-card",
                  variant: "elevated",
                  props: {
                    conversationId: conv.id,
                    title: conv.title,
                    latestMessage: conv.latestMessagePreview,
                    lastActivityAt: conv.lastActivityAt,
                    unreadPlaceholder: conv.unreadPlaceholder,
                    contractId: conv.context.contractId,
                    actionId: conv.context.actionId,
                    participant: conv.participants.map((p) => p.name).join(" · "),
                  },
                  label: `${conv.title}, ${conv.latestMessagePreview}`,
                  role: "article",
                })
              )
            : [
                buildComponentInstance({
                  id: "no-active",
                  componentId: "core-ui-card",
                  props: { title: "No active conversations", summary: "Start from a contract or action." },
                  label: "No active conversations",
                }),
              ],
      },
      {
        id: "unread-placeholder",
        label: "Unread Placeholder",
        purpose: "Unread count placeholder — no notification engine.",
        components: active.map((conv) =>
          buildComponentInstance({
            id: `unread-${conv.id}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: conv.unreadPlaceholder > 0 ? `${conv.unreadPlaceholder} unread` : "No unread", count: conv.unreadPlaceholder },
            label: conv.unreadPlaceholder > 0 ? `${conv.unreadPlaceholder} unread messages` : "No unread messages",
            role: "status",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Chat navigation.",
        components: [
          buildComponentInstance({
            id: "chat-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: CHAT_NAV_ITEMS, activeId: "home" },
            label: "Chat navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
