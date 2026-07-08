import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";

export type NotificationType =
  | "request"
  | "match"
  | "contract"
  | "chat"
  | "action"
  | "timeline"
  | "reminder"
  | "system"
  | "announcement";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type NotificationStatus = "unread" | "read" | "important" | "archived";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  status: NotificationStatus;
  relatedContractId?: string;
  relatedActionId?: string;
  relatedConversationId?: string;
  relatedTimelineEventId?: string;
  relatedScreen?: string;
  icon: string;
  colorToken: SemanticColorTokenPath;
  confidence: number;
  recommendations: string[];
}

export const NOTIFICATION_TYPE_ORDER: NotificationType[] = [
  "request",
  "match",
  "contract",
  "chat",
  "action",
  "timeline",
  "reminder",
  "system",
  "announcement",
];

export function buildNotificationItem(
  input: Partial<NotificationItem> & Pick<NotificationItem, "id" | "title" | "message" | "type" | "timestamp">
): NotificationItem {
  return {
    priority: input.priority ?? "normal",
    status: input.status ?? "unread",
    relatedContractId: input.relatedContractId,
    relatedActionId: input.relatedActionId,
    relatedConversationId: input.relatedConversationId,
    relatedTimelineEventId: input.relatedTimelineEventId,
    relatedScreen: input.relatedScreen,
    icon: input.icon ?? "notification",
    colorToken: input.colorToken ?? "accent.primary",
    confidence: input.confidence ?? 0.9,
    recommendations: input.recommendations ?? [],
    ...input,
  };
}

export function compareNotifications(a: NotificationItem, b: NotificationItem): number {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

export function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort(compareNotifications);
}
