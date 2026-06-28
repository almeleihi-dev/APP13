import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { NOTIFICATION_NAV_ITEMS } from "../application/notification-navigation.js";

export function buildNotificationEmptyStateScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "notification-empty-state",
    navigation,
    generatedAt,
    sections: [
      {
        id: "illustration-placeholder",
        label: "Illustration Placeholder",
        purpose: "Empty notification inbox illustration.",
        components: [
          buildComponentInstance({
            id: "illustration",
            componentId: "core-ui-card",
            props: { title: "No notifications", variant: "empty-illustration", illustration: true },
            label: "Empty notification illustration",
            role: "img",
          }),
        ],
      },
      {
        id: "guidance",
        label: "Guidance",
        purpose: "Guidance for empty notification inbox.",
        components: [
          buildComponentInstance({
            id: "guidance-card",
            componentId: "core-ui-card",
            props: {
              title: "Your inbox is empty",
              summary:
                "Notifications appear as you progress through the AN ACT lifecycle. This inbox is read-only and never delivers push notifications.",
            },
            label: "Notification guidance",
          }),
        ],
      },
      {
        id: "return-home",
        label: "Return Home",
        purpose: "Return to notification home.",
        components: [
          buildComponentInstance({
            id: "return-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Return to Notification Home", route: "/notification/home", readOnly: true },
            label: "Return to notification home",
            role: "button",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Notification navigation.",
        components: [
          buildComponentInstance({
            id: "notification-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: NOTIFICATION_NAV_ITEMS, activeId: "home" },
            label: "Notification navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
