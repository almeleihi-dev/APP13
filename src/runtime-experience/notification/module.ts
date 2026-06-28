export {
  NOTIFICATION_EXPERIENCE_VERSION,
  NOTIFICATION_SCREEN_IDS,
  NOTIFICATION_SCREEN_PROTOTYPE_MAP,
  NOTIFICATION_SCREEN_ROUTES,
  NOTIFICATION_EXPERIENCE_FLOW,
  NOTIFICATION_LIFECYCLE_FLOW,
  isNotificationScreenId,
  type NotificationScreenId,
  type NotificationRuntimeScreenView,
  type NotificationScreenSection,
  type RuntimeComponentInstance,
} from "./domain/notification-screen.js";

export {
  buildNotificationItem,
  sortNotifications,
  compareNotifications,
  NOTIFICATION_TYPE_ORDER,
  type NotificationItem,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
} from "./domain/notification-item.js";

export {
  buildNotificationSummary,
  type NotificationSummary,
} from "./domain/notification-summary.js";

export {
  resolveNotificationLayoutBinding,
  buildNotificationScreenContext,
  resolveNotificationThemeColors,
} from "./domain/notification-layout.js";

export {
  createNotificationSessionState,
  NOTIFICATION_FILTER_IDS,
  NOTIFICATION_LIST_STATUS_FILTERS,
  isNotificationFilterId,
  type NotificationSessionState,
  type NotificationFilterId,
  type NotificationListStatusFilter,
} from "./domain/notification-state.js";

export {
  NotificationExperienceService,
  createNotificationExperienceModule,
  createNotificationExperienceService,
  type NotificationExperienceModule,
  type NotificationAction,
} from "./application/notification-experience-service.js";

export {
  NOTIFICATION_NAV_ITEMS,
  buildNotificationNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToDetail,
  buildNavigationAccessibility,
} from "./application/notification-navigation.js";

export {
  groupNotificationsByDate,
  applyNotificationFilter,
  filterByListStatus,
  NOTIFICATION_SETTINGS_OPTIONS,
  type NotificationDateGroup,
} from "./application/notification-builder.js";

export {
  validateNotificationFilter,
  validateNotificationSession,
  type NotificationValidation,
} from "./application/notification-validator.js";

export { buildNotificationHomeScreen } from "./presentation/notification-home.js";
export { buildNotificationListScreen } from "./presentation/notification-list.js";
export { buildNotificationDetailScreen } from "./presentation/notification-detail.js";
export { buildNotificationFiltersScreen } from "./presentation/notification-filters.js";
export { buildNotificationSettingsScreen } from "./presentation/notification-settings.js";
export { buildNotificationEmptyStateScreen } from "./presentation/notification-empty-state.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  NotificationRepository,
  createNotificationRepository,
  notificationRepository,
} from "./infrastructure/notification-repository.js";

export {
  validateNotificationExperience,
  type NotificationExperienceValidationResult,
} from "./validation/notification-experience-validator.js";

import { validateNotificationExperience } from "./validation/notification-experience-validator.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "./domain/notification-screen.js";
import {
  NotificationExperienceService,
  createNotificationExperienceService,
} from "./application/notification-experience-service.js";

export interface AnActNotificationExperienceModule {
  version: typeof NOTIFICATION_EXPERIENCE_VERSION;
  notificationExperience: NotificationExperienceService;
  validate: typeof validateNotificationExperience;
}

export function createAnActNotificationExperienceModule(): AnActNotificationExperienceModule {
  const notificationExperience = createNotificationExperienceService();
  return {
    version: NOTIFICATION_EXPERIENCE_VERSION,
    notificationExperience,
    validate: validateNotificationExperience,
  };
}

export const NOTIFICATION_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Notification & Event Inbox Experience",
  version: NOTIFICATION_EXPERIENCE_VERSION,
  principles: [
    "Unified read-only notification center for the AN ACT lifecycle",
    "Visualizes events only — never modifies lifecycle state",
    "Consumes CH3-X1 through CH3-X9 foundations",
    "No AI, no business logic, no push delivery, no persistence",
    "Official runtime notification experience for AN ACT",
  ],
} as const;
