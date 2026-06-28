import type { NotificationItem } from "../domain/notification-item.js";
import type { NotificationSummary } from "../domain/notification-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { NOTIFICATION_NAV_ITEMS } from "../application/notification-navigation.js";

export function buildNotificationHomeScreen(
  summary: NotificationSummary,
  items: NotificationItem[],
  navigation: NavigationState,
  generatedAt: string
) {
  const byId = (ids: string[]) => items.filter((n) => ids.includes(n.id));

  return buildRuntimeScreenView({
    screenId: "notification-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "unread-count",
        label: "Unread Count",
        purpose: "Unread notification count — display only, no delivery.",
        components: [
          buildComponentInstance({
            id: "unread-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: `${summary.unreadCount} unread`, count: summary.unreadCount },
            label: `${summary.unreadCount} unread notifications`,
            role: "status",
          }),
        ],
      },
      {
        id: "recent-notifications",
        label: "Recent Notifications",
        purpose: "Most recent notifications.",
        components: byId(summary.recentNotificationIds).map((n) =>
          buildComponentInstance({
            id: `recent-${n.id}`,
            componentId: "core-ui-card",
            props: { notificationId: n.id, title: n.title, message: n.message, status: n.status },
            label: n.title,
            role: "listitem",
          })
        ),
      },
      {
        id: "important-events",
        label: "Important Events",
        purpose: "High-priority and important notifications.",
        components: byId(summary.importantEventIds).map((n) =>
          buildComponentInstance({
            id: `important-${n.id}`,
            componentId: "core-ui-toast",
            props: { title: n.title, message: n.message, priority: n.priority, readOnly: true },
            label: `Important: ${n.title}`,
            role: "alert",
          })
        ),
      },
      {
        id: "action-reminders",
        label: "Action Reminders",
        purpose: "Action and reminder notifications.",
        components: byId(summary.actionReminderIds).map((n) =>
          buildComponentInstance({
            id: `reminder-${n.id}`,
            componentId: "core-ui-card",
            props: { title: n.title, message: n.message, type: n.type },
            label: n.title,
            role: "listitem",
          })
        ),
      },
      {
        id: "timeline-highlights",
        label: "Timeline Highlights",
        purpose: "Timeline-related notification highlights.",
        components: byId(summary.timelineHighlightIds).map((n) =>
          buildComponentInstance({
            id: `timeline-${n.id}`,
            componentId: "core-ui-timeline-card",
            props: { title: n.title, message: n.message, eventId: n.relatedTimelineEventId },
            label: n.title,
            role: "listitem",
          })
        ),
      },
      {
        id: "contract-updates",
        label: "Contract Updates",
        purpose: "Contract-related notifications.",
        components: byId(summary.contractUpdateIds).map((n) =>
          buildComponentInstance({
            id: `contract-${n.id}`,
            componentId: "core-ui-contract-card",
            props: { contractId: n.relatedContractId, title: n.title, readOnly: true },
            label: n.title,
            role: "listitem",
          })
        ),
      },
      {
        id: "live-frame-updates",
        label: "Live Frame Updates",
        purpose: "Live Frame update summary.",
        components: [
          buildComponentInstance({
            id: "live-frame",
            componentId: "core-ui-live-frame",
            props: { updateCount: summary.liveFrameUpdateCount, readOnly: true },
            label: `${summary.liveFrameUpdateCount} Live Frame updates`,
            role: "region",
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
