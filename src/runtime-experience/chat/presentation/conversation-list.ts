import type { ConversationSummary } from "../domain/conversation.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CHAT_NAV_ITEMS } from "../application/chat-navigation.js";

export function buildConversationListScreen(
  conversations: ConversationSummary[],
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "conversation-list",
    navigation,
    generatedAt,
    sections: [
      {
        id: "search-placeholder",
        label: "Search Placeholder",
        purpose: "Search placeholder — no backend search.",
        components: [
          buildComponentInstance({
            id: "search-input",
            componentId: "core-ui-search",
            variant: "search",
            props: { placeholder: "Search conversations...", disabled: false, backendSearch: false },
            label: "Search conversations",
            role: "searchbox",
          }),
        ],
      },
      {
        id: "conversation-cards",
        label: "Conversation Cards",
        purpose: "List of action-centric conversations.",
        components: conversations.map((conv) => {
          const provider = conv.participants.find((p) => p.role === "provider");
          return buildComponentInstance({
            id: `list-${conv.id}`,
            componentId: "core-ui-card",
            variant: "elevated",
            props: {
              conversationId: conv.id,
              title: conv.title,
              latestMessage: conv.latestMessagePreview,
              lastActivityAt: conv.lastActivityAt,
              state: conv.state,
              liveFrame: provider?.liveFrameTier
                ? { componentId: "core-ui-live-frame", tier: provider.liveFrameTier }
                : undefined,
              contractStatus: conv.context.contractStatus,
              actionStatus: conv.context.actionStatus,
            },
            label: conv.title,
            role: "article",
          });
        }),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Chat navigation.",
        components: [
          buildComponentInstance({
            id: "chat-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: CHAT_NAV_ITEMS, activeId: "conversations" },
            label: "Chat navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
