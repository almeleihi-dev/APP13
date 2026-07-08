import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";
import { PROFILE_SETTINGS_OPTIONS } from "../application/profile-builder.js";

export function buildProfileSettingsScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "profile-settings",
    navigation,
    generatedAt,
    sections: [
      {
        id: "settings-header",
        label: "Settings Header",
        purpose: "Profile settings — display only, no persistence.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Settings", subtitle: "Display only — no persistence" },
            label: "Profile settings",
            role: "banner",
          }),
        ],
      },
      {
        id: "settings-options",
        label: "Settings Options",
        purpose: "Appearance, notifications, privacy, accessibility, language.",
        components: PROFILE_SETTINGS_OPTIONS.map((option) =>
          buildComponentInstance({
            id: `setting-${option.id}`,
            componentId: "core-ui-card",
            props: {
              title: option.label,
              enabled: "enabled" in option ? option.enabled : undefined,
              value: "value" in option ? option.value : undefined,
              readOnly: true,
              persistence: false,
            },
            label: option.label,
            role: "switch",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Profile navigation.",
        components: [
          buildComponentInstance({
            id: "profile-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: PROFILE_NAV_ITEMS, activeId: "settings" },
            label: "Profile navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
