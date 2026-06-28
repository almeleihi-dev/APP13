import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { NOTIFICATION_NAV_ITEMS } from "../application/notification-navigation.js";
import { NOTIFICATION_SETTINGS_OPTIONS } from "../application/notification-builder.js";

export function buildNotificationSettingsScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "notification-settings",
    navigation,
    generatedAt,
    sections: [
      {
        id: "settings-header",
        label: "Settings Header",
        purpose: "Notification settings — display only, no persistence.",
        components: [
          buildComponentInstance({
            id: "settings-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Notification Settings", subtitle: "Display only — no persistence" },
            label: "Notification settings",
            role: "banner",
          }),
        ],
      },
      {
        id: "delivery-settings",
        label: "Delivery Settings",
        purpose: "Push, email, SMS, in-app settings placeholders.",
        components: NOTIFICATION_SETTINGS_OPTIONS.map((option) =>
          buildComponentInstance({
            id: `setting-${option.id}`,
            componentId: "core-ui-card",
            props: {
              title: option.label,
              enabled: option.enabled,
              readOnly: true,
              persistence: false,
            },
            label: `${option.label}: ${option.enabled ? "enabled" : "disabled"}`,
            role: "switch",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Notification navigation.",
        components: [
          buildComponentInstance({
            id: "notification-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: NOTIFICATION_NAV_ITEMS, activeId: "settings" },
            label: "Notification navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
