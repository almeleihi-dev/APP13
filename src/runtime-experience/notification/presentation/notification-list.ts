import type { NotificationDateGroup } from "../application/notification-builder.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { NOTIFICATION_NAV_ITEMS } from "../application/notification-navigation.js";
import { NOTIFICATION_LIST_STATUS_FILTERS } from "../domain/notification-state.js";

export function buildNotificationListScreen(
  groups: NotificationDateGroup[],
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "notification-list",
    navigation,
    generatedAt,
    sections: [
      {
        id: "list-header",
        label: "List Header",
        purpose: "Notification inbox list.",
        components: [
          buildComponentInstance({
            id: "list-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Notification Inbox", subtitle: "Grouped by date" },
            label: "Notification inbox",
            role: "banner",
          }),
        ],
      },
      {
        id: "status-filters",
        label: "Status Filters",
        purpose: "Unread, Read, Important, Archived — display only.",
        components: NOTIFICATION_LIST_STATUS_FILTERS.map((status) =>
          buildComponentInstance({
            id: `status-${status}`,
            componentId: "core-ui-chip",
            props: { label: status.charAt(0).toUpperCase() + status.slice(1), status, readOnly: true },
            label: `Filter by ${status}`,
            role: "option",
          })
        ),
      },
      ...groups.map((group) => ({
        id: `group-${group.label.toLowerCase()}`,
        label: group.label,
        purpose: `Notifications from ${group.label}.`,
        components: group.notifications.map((n) =>
          buildComponentInstance({
            id: `list-${n.id}`,
            componentId: "core-ui-card",
            props: {
              notificationId: n.id,
              title: n.title,
              message: n.message,
              timestamp: n.timestamp,
              status: n.status,
              type: n.type,
              priority: n.priority,
            },
            label: `${n.title}, ${n.status}`,
            role: "listitem",
          })
        ),
      })),
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Notification navigation.",
        components: [
          buildComponentInstance({
            id: "notification-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: NOTIFICATION_NAV_ITEMS, activeId: "list" },
            label: "Notification navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
