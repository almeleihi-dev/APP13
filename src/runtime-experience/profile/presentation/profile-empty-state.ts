import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileEmptyStateScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "profile-empty-state",
    navigation,
    generatedAt,
    sections: [
      {
        id: "illustration-placeholder",
        label: "Illustration Placeholder",
        purpose: "Empty profile illustration.",
        components: [
          buildComponentInstance({
            id: "illustration",
            componentId: "core-ui-card",
            props: { title: "No profile available", variant: "empty-illustration", illustration: true },
            label: "Empty profile illustration",
            role: "img",
          }),
        ],
      },
      {
        id: "guidance",
        label: "Guidance",
        purpose: "Guidance for empty profile state.",
        components: [
          buildComponentInstance({
            id: "guidance-card",
            componentId: "core-ui-card",
            props: {
              title: "Profile not available",
              summary: "Your living profile will appear here as you participate in the AN ACT lifecycle.",
            },
            label: "Profile guidance",
          }),
        ],
      },
      {
        id: "return-home",
        label: "Return Home",
        purpose: "Return to profile home.",
        components: [
          buildComponentInstance({
            id: "return-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Return to Profile Home", route: "/profile/home", readOnly: true },
            label: "Return to profile home",
            role: "button",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Profile navigation.",
        components: [
          buildComponentInstance({
            id: "profile-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: PROFILE_NAV_ITEMS, activeId: "home" },
            label: "Profile navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
