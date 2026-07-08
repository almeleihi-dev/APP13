import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { TIMELINE_NAV_ITEMS } from "../application/timeline-navigation.js";

export function buildTimelineEmptyStateScreen(navigation: NavigationState, generatedAt: string) {
  return buildRuntimeScreenView({
    screenId: "timeline-empty-state",
    navigation,
    generatedAt,
    sections: [
      {
        id: "illustration-placeholder",
        label: "Illustration Placeholder",
        purpose: "Empty timeline illustration.",
        components: [
          buildComponentInstance({
            id: "illustration",
            componentId: "core-ui-card",
            props: { title: "No timeline events", variant: "empty-illustration", illustration: true },
            label: "Empty timeline illustration",
            role: "img",
          }),
        ],
      },
      {
        id: "guidance",
        label: "Guidance",
        purpose: "Guidance for when timeline is empty.",
        components: [
          buildComponentInstance({
            id: "guidance-card",
            componentId: "core-ui-card",
            props: {
              title: "Timeline is empty",
              summary:
                "Timeline events appear as you progress through the AN ACT lifecycle — from need request through completion and archive.",
            },
            label: "Timeline guidance",
          }),
        ],
      },
      {
        id: "return-home",
        label: "Return Home",
        purpose: "Return to timeline home.",
        components: [
          buildComponentInstance({
            id: "return-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Return to Timeline Home", route: "/timeline/home", readOnly: true },
            label: "Return to timeline home",
            role: "button",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Timeline navigation.",
        components: [
          buildComponentInstance({
            id: "timeline-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: TIMELINE_NAV_ITEMS, activeId: "home" },
            label: "Timeline navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
