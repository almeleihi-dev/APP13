import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const NOTIFICATION_EXPERIENCE_VERSION = "an-act-notification-experience-v1" as const;

export const NOTIFICATION_SCREEN_IDS = [
  "notification-home",
  "notification-list",
  "notification-detail",
  "notification-filters",
  "notification-settings",
  "notification-empty-state",
] as const;

export type NotificationScreenId = (typeof NOTIFICATION_SCREEN_IDS)[number];

export const NOTIFICATION_SCREEN_PROTOTYPE_MAP: Record<NotificationScreenId, string> = {
  "notification-home": "prototype-notification",
  "notification-list": "prototype-notification",
  "notification-detail": "prototype-notification",
  "notification-filters": "prototype-notification",
  "notification-settings": "prototype-notification",
  "notification-empty-state": "prototype-empty-state",
};

export const NOTIFICATION_SCREEN_ROUTES: Record<NotificationScreenId, string> = {
  "notification-home": "/notification/home",
  "notification-list": "/notification/list",
  "notification-detail": "/notification/detail",
  "notification-filters": "/notification/filters",
  "notification-settings": "/notification/settings",
  "notification-empty-state": "/notification/empty",
};

export interface RuntimeComponentInstance {
  id: string;
  componentId: string;
  variant?: string;
  props: Record<string, unknown>;
  accessibility?: {
    label?: string;
    role?: string;
    tabIndex?: number;
    describedBy?: string;
  };
}

export interface NotificationScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface NotificationScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  activeNavId?: string;
  stackDepth: number;
  nextRoute?: string;
  returnToNeedHomeRoute: string;
  returnToActionHomeRoute: string;
  returnToContractRoute: string;
  returnToChatRoute: string;
  returnToTimelineRoute: string;
}

export interface NotificationScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface NotificationRuntimeScreenView {
  screenId: NotificationScreenId;
  prototypeId: string;
  route: string;
  mode: "need" | "shared";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: NotificationScreenSection[];
  navigation: NotificationScreenNavigationView;
  accessibility: NotificationScreenAccessibilityView;
  generatedAt: string;
}

export interface NotificationExperienceFlowStep {
  screenId: NotificationScreenId;
  route: string;
  label: string;
}

export const NOTIFICATION_EXPERIENCE_FLOW: NotificationExperienceFlowStep[] = [
  { screenId: "notification-home", route: NOTIFICATION_SCREEN_ROUTES["notification-home"], label: "Notification Home" },
  { screenId: "notification-list", route: NOTIFICATION_SCREEN_ROUTES["notification-list"], label: "Notification List" },
  { screenId: "notification-detail", route: NOTIFICATION_SCREEN_ROUTES["notification-detail"], label: "Notification Detail" },
  { screenId: "notification-filters", route: NOTIFICATION_SCREEN_ROUTES["notification-filters"], label: "Notification Filters" },
  { screenId: "notification-settings", route: NOTIFICATION_SCREEN_ROUTES["notification-settings"], label: "Notification Settings" },
];

export const NOTIFICATION_LIFECYCLE_FLOW = [
  "Request Created",
  "Match Found",
  "Contract Ready",
  "Chat Started",
  "Action Started",
  "Milestone",
  "Completion",
  "Archive",
] as const;

export function isNotificationScreenId(value: string): value is NotificationScreenId {
  return NOTIFICATION_SCREEN_IDS.includes(value as NotificationScreenId);
}
