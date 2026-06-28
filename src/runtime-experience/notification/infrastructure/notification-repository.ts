import type { NotificationItem } from "../domain/notification-item.js";
import { buildNotificationItem, sortNotifications } from "../domain/notification-item.js";
import type { NotificationSummary } from "../domain/notification-summary.js";
import { buildNotificationSummary } from "../domain/notification-summary.js";
import type { NotificationFilterId } from "../domain/notification-state.js";

function buildDefaultNotifications(userId: string): NotificationItem[] {
  const suffix = userId.slice(-6);
  return sortNotifications([
    buildNotificationItem({
      id: `notif-req-${suffix}`,
      title: "Request Created",
      message: "Your panel upgrade request has been submitted.",
      type: "request",
      priority: "normal",
      timestamp: "2026-06-20T09:00:00.000Z",
      status: "read",
      relatedActionId: `action-${suffix}`,
      relatedScreen: "/need/request",
      icon: "request",
      colorToken: "accent.primary",
      confidence: 0.95,
      recommendations: ["View request details"],
    }),
    buildNotificationItem({
      id: `notif-match-${suffix}`,
      title: "Match Found",
      message: "A licensed professional has been matched to your request.",
      type: "match",
      priority: "high",
      timestamp: "2026-06-20T09:15:00.000Z",
      status: "read",
      relatedScreen: "/need/opportunities",
      icon: "match",
      colorToken: "accent.primary",
      confidence: 0.92,
      recommendations: ["Review provider profile"],
    }),
    buildNotificationItem({
      id: `notif-contract-${suffix}`,
      title: "Contract Ready",
      message: "Your contract is ready for review and confirmation.",
      type: "contract",
      priority: "high",
      timestamp: "2026-06-20T10:00:00.000Z",
      status: "unread",
      relatedContractId: `contract-${suffix}`,
      relatedScreen: "/contract/home",
      icon: "contract",
      colorToken: "status.info",
      confidence: 0.98,
      recommendations: ["Review contract terms"],
    }),
    buildNotificationItem({
      id: `notif-chat-${suffix}`,
      title: "Chat Started",
      message: "A coordination conversation has been opened.",
      type: "chat",
      priority: "normal",
      timestamp: "2026-06-20T11:30:00.000Z",
      status: "unread",
      relatedConversationId: `conv-${suffix}`,
      relatedScreen: "/chat/home",
      icon: "chat",
      colorToken: "accent.primary",
      confidence: 0.88,
      recommendations: [],
    }),
    buildNotificationItem({
      id: `notif-action-${suffix}`,
      title: "Action Started",
      message: "Your professional is en route to the site.",
      type: "action",
      priority: "urgent",
      timestamp: "2026-06-20T12:00:00.000Z",
      status: "important",
      relatedActionId: `action-${suffix}`,
      relatedScreen: "/action/active",
      icon: "action",
      colorToken: "accent.primary",
      confidence: 0.94,
      recommendations: ["Track action progress"],
    }),
    buildNotificationItem({
      id: `notif-timeline-${suffix}`,
      title: "Timeline Highlight",
      message: "Milestone reached in your action timeline.",
      type: "timeline",
      priority: "normal",
      timestamp: "2026-06-20T13:00:00.000Z",
      status: "unread",
      relatedTimelineEventId: `evt-milestone-${suffix}`,
      relatedScreen: "/timeline/home",
      icon: "timeline",
      colorToken: "border.default",
      confidence: 0.85,
      recommendations: ["View timeline"],
    }),
    buildNotificationItem({
      id: `notif-reminder-${suffix}`,
      title: "Action Reminder",
      message: "Scheduled action begins in 30 minutes.",
      type: "reminder",
      priority: "high",
      timestamp: "2026-06-20T14:00:00.000Z",
      status: "unread",
      relatedActionId: `action-${suffix}`,
      relatedScreen: "/action/home",
      icon: "reminder",
      colorToken: "status.info",
      confidence: 0.9,
      recommendations: [],
    }),
    buildNotificationItem({
      id: `notif-system-${suffix}`,
      title: "System Update",
      message: "AN ACT platform maintenance completed successfully.",
      type: "system",
      priority: "low",
      timestamp: "2026-06-19T08:00:00.000Z",
      status: "read",
      relatedScreen: "/notification/home",
      icon: "system",
      colorToken: "text.primary",
      confidence: 1,
      recommendations: [],
    }),
    buildNotificationItem({
      id: `notif-announce-${suffix}`,
      title: "Announcement",
      message: "New Live Frame tiers are now available for professionals.",
      type: "announcement",
      priority: "normal",
      timestamp: "2026-06-18T10:00:00.000Z",
      status: "archived",
      relatedScreen: "/notification/home",
      icon: "announcement",
      colorToken: "surface.primary",
      confidence: 0.8,
      recommendations: [],
    }),
  ]);
}

export class NotificationRepository {
  private readonly notifications = new Map<string, NotificationItem[]>();

  getNotifications(userId: string): NotificationItem[] {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, buildDefaultNotifications(userId));
    }
    return [...(this.notifications.get(userId) ?? [])];
  }

  getNotification(userId: string, notificationId: string): NotificationItem | undefined {
    return this.getNotifications(userId).find((n) => n.id === notificationId);
  }

  getSummary(userId: string): NotificationSummary {
    return buildNotificationSummary(this.getNotifications(userId));
  }

  refresh(userId: string, _refreshedAt: string): NotificationItem[] {
    return this.getNotifications(userId);
  }

  getFilteredNotifications(userId: string, filter: NotificationFilterId): NotificationItem[] {
    const items = this.getNotifications(userId);
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
}

export function createNotificationRepository(): NotificationRepository {
  return new NotificationRepository();
}

let singleton: NotificationRepository | undefined;

export function notificationRepository(): NotificationRepository {
  if (!singleton) singleton = createNotificationRepository();
  return singleton;
}
