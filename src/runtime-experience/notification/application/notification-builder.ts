import type { NotificationItem } from "../domain/notification-item.js";
import type { NotificationFilterId } from "../domain/notification-state.js";

export interface NotificationDateGroup {
  label: "Today" | "Yesterday" | "Earlier";
  notifications: NotificationItem[];
}

export function groupNotificationsByDate(items: NotificationItem[], referenceDate: string): NotificationDateGroup[] {
  const ref = new Date(referenceDate);
  const todayStr = ref.toISOString().slice(0, 10);
  const yesterday = new Date(ref);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const today: NotificationItem[] = [];
  const yesterdayItems: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  for (const item of items) {
    const date = item.timestamp.slice(0, 10);
    if (date === todayStr) today.push(item);
    else if (date === yesterdayStr) yesterdayItems.push(item);
    else earlier.push(item);
  }

  const groups: NotificationDateGroup[] = [];
  if (today.length > 0) groups.push({ label: "Today", notifications: today });
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", notifications: yesterdayItems });
  if (earlier.length > 0) groups.push({ label: "Earlier", notifications: earlier });
  return groups;
}

export function applyNotificationFilter(items: NotificationItem[], filter: NotificationFilterId): NotificationItem[] {
  switch (filter) {
    case "unread":
      return items.filter((n) => n.status === "unread");
    case "contracts":
      return items.filter((n) => n.type === "contract");
    case "actions":
      return items.filter((n) => n.type === "action" || n.type === "reminder");
    case "messages":
      return items.filter((n) => n.type === "chat");
    case "timeline":
      return items.filter((n) => n.type === "timeline");
    case "system":
      return items.filter((n) => n.type === "system" || n.type === "announcement");
    default:
      return items;
  }
}

export function filterByListStatus(
  items: NotificationItem[],
  status: "unread" | "read" | "important" | "archived"
): NotificationItem[] {
  return items.filter((n) => n.status === status);
}

export const NOTIFICATION_SETTINGS_OPTIONS = [
  { id: "push", label: "Push Notifications", enabled: true },
  { id: "email", label: "Email", enabled: true },
  { id: "sms", label: "SMS", enabled: false },
  { id: "in-app", label: "In-App", enabled: true },
  { id: "sound", label: "Sound", enabled: true },
  { id: "vibration", label: "Vibration", enabled: false },
] as const;
