import type { NotificationItem } from "./notification-item.js";

export interface NotificationSummary {
  unreadCount: number;
  recentNotificationIds: string[];
  importantEventIds: string[];
  actionReminderIds: string[];
  timelineHighlightIds: string[];
  contractUpdateIds: string[];
  liveFrameUpdateCount: number;
  totalNotifications: number;
}

export function buildNotificationSummary(items: NotificationItem[]): NotificationSummary {
  const unread = items.filter((n) => n.status === "unread");
  const important = items.filter((n) => n.status === "important" || n.priority === "high" || n.priority === "urgent");
  const sorted = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    unreadCount: unread.length,
    recentNotificationIds: sorted.slice(0, 5).map((n) => n.id),
    importantEventIds: important.slice(0, 3).map((n) => n.id),
    actionReminderIds: items.filter((n) => n.type === "reminder" || n.type === "action").slice(0, 3).map((n) => n.id),
    timelineHighlightIds: items.filter((n) => n.type === "timeline").slice(0, 3).map((n) => n.id),
    contractUpdateIds: items.filter((n) => n.type === "contract").slice(0, 3).map((n) => n.id),
    liveFrameUpdateCount: items.filter((n) => n.type === "action" && n.priority === "high").length,
    totalNotifications: items.length,
  };
}
