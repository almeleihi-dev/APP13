import type { NotificationFilterId } from "../domain/notification-state.js";
import { NOTIFICATION_FILTER_IDS } from "../domain/notification-state.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

const FILTER_LABELS: Record<NotificationFilterId, string> = {
  all: "All",
  unread: "Unread",
  contracts: "Contracts",
  actions: "Actions",
  messages: "Messages",
  timeline: "Timeline",
  system: "System",
};

export function buildNotificationFiltersScreen(
  activeFilter: NotificationFilterId,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "notification-filters",
    navigation,
    generatedAt,
    sections: [
      {
        id: "filter-header",
        label: "Filter Header",
        purpose: "Notification filter selection — display only.",
        components: [
          buildComponentInstance({
            id: "filter-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Filters", subtitle: "Read-only filter view" },
            label: "Notification filters",
            role: "banner",
          }),
        ],
      },
      {
        id: "filter-options",
        label: "Filter Options",
        purpose: "Available notification filters.",
        components: NOTIFICATION_FILTER_IDS.map((filterId) =>
          buildComponentInstance({
            id: `filter-${filterId}`,
            componentId: "core-ui-chip",
            variant: filterId === activeFilter ? "selected" : "default",
            props: { label: FILTER_LABELS[filterId], filterId, active: filterId === activeFilter, readOnly: true },
            label: FILTER_LABELS[filterId],
            role: "option",
          })
        ),
      },
    ],
  });
}
