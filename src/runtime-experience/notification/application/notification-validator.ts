import type { NotificationFilterId } from "../domain/notification-state.js";
import { isNotificationFilterId } from "../domain/notification-state.js";

export interface NotificationValidation {
  valid: boolean;
  errors: string[];
}

export function validateNotificationFilter(filter: string): NotificationValidation {
  if (!isNotificationFilterId(filter)) {
    return { valid: false, errors: [`Unknown filter: ${filter}`] };
  }
  return { valid: true, errors: [] };
}

export function validateNotificationSession(input: {
  notificationCount: number;
  filter: NotificationFilterId;
}): NotificationValidation {
  const errors: string[] = [];
  if (!isNotificationFilterId(input.filter)) {
    errors.push("Invalid active filter");
  }
  return { valid: errors.length === 0, errors };
}
