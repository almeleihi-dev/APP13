import type { NotificationItem } from "../domain/notification-item.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildNotificationDetailScreen(
  notification: NotificationItem,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "notification-detail",
    navigation,
    generatedAt,
    sections: [
      {
        id: "notification-id",
        label: "ID",
        purpose: "Notification identifier.",
        components: [
          buildComponentInstance({
            id: "id",
            componentId: "core-ui-badge",
            props: { label: notification.id },
            label: `Notification ${notification.id}`,
            role: "status",
          }),
        ],
      },
      {
        id: "title",
        label: "Title",
        purpose: "Notification title.",
        components: [
          buildComponentInstance({
            id: "title-bar",
            componentId: "core-ui-navigation-bar",
            props: { title: notification.title, subtitle: notification.type },
            label: notification.title,
            role: "banner",
          }),
        ],
      },
      {
        id: "message",
        label: "Message",
        purpose: "Notification message body.",
        components: [
          buildComponentInstance({
            id: "message-card",
            componentId: "core-ui-card",
            props: { title: "Message", summary: notification.message },
            label: notification.message,
          }),
        ],
      },
      {
        id: "timestamp",
        label: "Timestamp",
        purpose: "When the notification was created.",
        components: [
          buildComponentInstance({
            id: "timestamp",
            componentId: "core-ui-badge",
            props: { label: notification.timestamp },
            label: `Received at ${notification.timestamp}`,
            role: "status",
          }),
        ],
      },
      {
        id: "type-priority",
        label: "Type and Priority",
        purpose: "Notification classification.",
        components: [
          buildComponentInstance({
            id: "type",
            componentId: "core-ui-chip",
            props: { label: notification.type, colorToken: notification.colorToken },
            label: `Type: ${notification.type}`,
            role: "status",
          }),
          buildComponentInstance({
            id: "priority",
            componentId: "core-ui-chip",
            variant: notification.priority === "urgent" ? "selected" : "default",
            props: { label: notification.priority },
            label: `Priority: ${notification.priority}`,
            role: "status",
          }),
        ],
      },
      {
        id: "related-screen",
        label: "Related Screen",
        purpose: "Screen this notification relates to.",
        components: [
          buildComponentInstance({
            id: "related-screen",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: notification.relatedScreen ?? "None", route: notification.relatedScreen, readOnly: true },
            label: `Related screen: ${notification.relatedScreen ?? "none"}`,
            role: "button",
          }),
        ],
      },
      {
        id: "related-contract",
        label: "Related Contract",
        purpose: "Contract linked to this notification.",
        components: [
          buildComponentInstance({
            id: "contract",
            componentId: "core-ui-contract-card",
            props: { contractId: notification.relatedContractId, readOnly: true },
            label: notification.relatedContractId ? `Contract ${notification.relatedContractId}` : "No related contract",
            role: "region",
          }),
        ],
      },
      {
        id: "related-action",
        label: "Related Action",
        purpose: "Action linked to this notification.",
        components: [
          buildComponentInstance({
            id: "action",
            componentId: "core-ui-card",
            props: { actionId: notification.relatedActionId, readOnly: true },
            label: notification.relatedActionId ? `Action ${notification.relatedActionId}` : "No related action",
          }),
        ],
      },
      {
        id: "related-conversation",
        label: "Related Conversation",
        purpose: "Conversation linked to this notification.",
        components: [
          buildComponentInstance({
            id: "conversation",
            componentId: "core-ui-card",
            props: { conversationId: notification.relatedConversationId, readOnly: true },
            label: notification.relatedConversationId
              ? `Conversation ${notification.relatedConversationId}`
              : "No related conversation",
          }),
        ],
      },
      {
        id: "recommendations",
        label: "Recommendations",
        purpose: "Display-only recommendations — no AI execution.",
        components: notification.recommendations.map((rec, i) =>
          buildComponentInstance({
            id: `rec-${i}`,
            componentId: "core-ui-card",
            props: { title: "Recommendation", summary: rec, readOnly: true },
            label: rec,
          })
        ),
      },
      {
        id: "confidence",
        label: "Confidence",
        purpose: "Confidence score display only.",
        components: [
          buildComponentInstance({
            id: "confidence",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: `${Math.round(notification.confidence * 100)}% confidence` },
            label: `${Math.round(notification.confidence * 100)} percent confidence`,
            role: "status",
          }),
        ],
      },
      {
        id: "return-links",
        label: "Return Links",
        purpose: "Return to related experiences — display only.",
        components: [
          buildComponentInstance({
            id: "return-need",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Need Home", route: "/need/home", readOnly: true },
            label: "Return to need home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-action",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Action Home", route: "/action/home", readOnly: true },
            label: "Return to action home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-contract",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Contract", route: "/contract/home", readOnly: true },
            label: "Return to contract",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-chat",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Chat", route: "/chat/home", readOnly: true },
            label: "Return to chat",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-timeline",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Timeline", route: "/timeline/home", readOnly: true },
            label: "Return to timeline",
            role: "button",
          }),
        ],
      },
    ],
  });
}
