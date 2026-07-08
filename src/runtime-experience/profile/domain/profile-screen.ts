import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const PROFILE_EXPERIENCE_VERSION = "an-act-profile-experience-v1" as const;

export const PROFILE_SCREEN_IDS = [
  "profile-home",
  "profile-identity",
  "profile-live-frame",
  "profile-achievements",
  "profile-analytics",
  "profile-history",
  "profile-settings",
  "profile-empty-state",
] as const;

export type ProfileScreenId = (typeof PROFILE_SCREEN_IDS)[number];

export const PROFILE_SCREEN_PROTOTYPE_MAP: Record<ProfileScreenId, string> = {
  "profile-home": "prototype-profile",
  "profile-identity": "prototype-profile",
  "profile-live-frame": "prototype-profile",
  "profile-achievements": "prototype-profile",
  "profile-analytics": "prototype-profile",
  "profile-history": "prototype-profile",
  "profile-settings": "prototype-profile",
  "profile-empty-state": "prototype-empty-state",
};

export const PROFILE_SCREEN_ROUTES: Record<ProfileScreenId, string> = {
  "profile-home": "/profile/home",
  "profile-identity": "/profile/identity",
  "profile-live-frame": "/profile/live-frame",
  "profile-achievements": "/profile/achievements",
  "profile-analytics": "/profile/analytics",
  "profile-history": "/profile/history",
  "profile-settings": "/profile/settings",
  "profile-empty-state": "/profile/empty",
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

export interface ProfileScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface ProfileScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  activeNavId?: string;
  stackDepth: number;
  nextRoute?: string;
  returnToNeedHomeRoute: string;
  returnToActionHomeRoute: string;
  returnToTimelineRoute: string;
  returnToNotificationsRoute: string;
}

export interface ProfileScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface ProfileRuntimeScreenView {
  screenId: ProfileScreenId;
  prototypeId: string;
  route: string;
  mode: "need" | "shared";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: ProfileScreenSection[];
  navigation: ProfileScreenNavigationView;
  accessibility: ProfileScreenAccessibilityView;
  generatedAt: string;
}

export interface ProfileExperienceFlowStep {
  screenId: ProfileScreenId;
  route: string;
  label: string;
}

export const PROFILE_EXPERIENCE_FLOW: ProfileExperienceFlowStep[] = [
  { screenId: "profile-home", route: PROFILE_SCREEN_ROUTES["profile-home"], label: "Profile Home" },
  { screenId: "profile-identity", route: PROFILE_SCREEN_ROUTES["profile-identity"], label: "Identity" },
  { screenId: "profile-live-frame", route: PROFILE_SCREEN_ROUTES["profile-live-frame"], label: "Live Frame" },
  { screenId: "profile-achievements", route: PROFILE_SCREEN_ROUTES["profile-achievements"], label: "Achievements" },
  { screenId: "profile-analytics", route: PROFILE_SCREEN_ROUTES["profile-analytics"], label: "Analytics" },
  { screenId: "profile-history", route: PROFILE_SCREEN_ROUTES["profile-history"], label: "History" },
  { screenId: "profile-settings", route: PROFILE_SCREEN_ROUTES["profile-settings"], label: "Settings" },
];

export const PROFILE_RUNTIME_FLOW = [
  "Open Profile",
  "Identity",
  "Live Frame",
  "Achievements",
  "Analytics",
  "History",
  "Settings",
  "Back",
] as const;

export function isProfileScreenId(value: string): value is ProfileScreenId {
  return PROFILE_SCREEN_IDS.includes(value as ProfileScreenId);
}
