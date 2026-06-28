import type { NotificationScreenId } from "./notification-screen.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";

export type NotificationFilterId =
  | "all"
  | "unread"
  | "contracts"
  | "actions"
  | "messages"
  | "timeline"
  | "system";

export type NotificationListStatusFilter = "unread" | "read" | "important" | "archived";

export const NOTIFICATION_FILTER_IDS: NotificationFilterId[] = [
  "all",
  "unread",
  "contracts",
  "actions",
  "messages",
  "timeline",
  "system",
];

export const NOTIFICATION_LIST_STATUS_FILTERS: NotificationListStatusFilter[] = [
  "unread",
  "read",
  "important",
  "archived",
];

export interface NotificationSessionState {
  userId: string;
  currentScreen: NotificationScreenId;
  activeNotificationId?: string;
  activeFilter: NotificationFilterId;
  navigation: NavigationState;
  generatedAt: string;
  lastRefreshedAt: string;
}

export function createNotificationSessionState(userId: string, generatedAt: string): NotificationSessionState {
  return {
    userId,
    currentScreen: "notification-home",
    activeFilter: "all",
    navigation: buildInitialNavigationState("/notification/home"),
    generatedAt,
    lastRefreshedAt: generatedAt,
  };
}

export function isNotificationFilterId(value: string): value is NotificationFilterId {
  return NOTIFICATION_FILTER_IDS.includes(value as NotificationFilterId);
}
