import type { TimelineDateGroup } from "../application/timeline-builder.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { TIMELINE_NAV_ITEMS } from "../application/timeline-navigation.js";

export function buildTimelineHistoryScreen(
  groups: TimelineDateGroup[],
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "timeline-history",
    navigation,
    generatedAt,
    sections: [
      {
        id: "history-header",
        label: "History Header",
        purpose: "Chronological timeline history.",
        components: [
          buildComponentInstance({
            id: "history-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Timeline History", subtitle: "Chronological view" },
            label: "Timeline History",
            role: "banner",
          }),
        ],
      },
      ...groups.map((group) => ({
        id: `date-group-${group.date}`,
        label: group.label,
        purpose: `Events grouped by ${group.label}.`,
        components: group.events.map((event) =>
          buildComponentInstance({
            id: `hist-${event.id}`,
            componentId: "core-ui-timeline-card",
            props: {
              eventId: event.id,
              title: event.title,
              description: event.description,
              type: event.type,
              timestamp: event.timestamp,
              status: event.status,
              icon: event.icon,
              colorToken: event.colorToken,
            },
            label: `${event.title}, ${event.timestamp}`,
            role: "listitem",
          })
        ),
      })),
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Timeline navigation.",
        components: [
          buildComponentInstance({
            id: "timeline-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: TIMELINE_NAV_ITEMS, activeId: "history" },
            label: "Timeline navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
