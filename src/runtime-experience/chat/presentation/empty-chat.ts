import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CHAT_NAV_ITEMS } from "../application/chat-navigation.js";

export function buildEmptyChatScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "empty-chat",
    navigation,
    generatedAt,
    sections: [
      {
        id: "illustration-placeholder",
        label: "Illustration Placeholder",
        purpose: "Empty state illustration placeholder.",
        components: [
          buildComponentInstance({
            id: "illustration",
            componentId: "core-ui-card",
            props: { title: "No conversations yet", variant: "empty-illustration", illustration: true },
            label: "Empty chat illustration",
            role: "img",
          }),
        ],
      },
      {
        id: "guidance",
        label: "Guidance",
        purpose: "Guidance for starting an action-centric conversation.",
        components: [
          buildComponentInstance({
            id: "guidance-card",
            componentId: "core-ui-card",
            props: {
              title: "Action-centric chat",
              summary:
                "Conversations are created from requests and contracts. Chat supports coordination during active actions — not social messaging.",
            },
            label: "Chat guidance",
          }),
        ],
      },
      {
        id: "start-message",
        label: "Start Conversation",
        purpose: "Prompt to start a conversation from contract or action.",
        components: [
          buildComponentInstance({
            id: "start-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "View conversations", action: "navigate-list" },
            label: "View conversations",
            role: "button",
          }),
        ],
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
