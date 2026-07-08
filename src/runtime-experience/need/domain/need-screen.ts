import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const NEED_EXPERIENCE_VERSION = "an-act-need-experience-v1" as const;

export const NEED_SCREEN_IDS = [
  "need-home",
  "search",
  "opportunity-list",
  "request",
  "empty-state",
  "transition",
] as const;

export type NeedScreenId = (typeof NEED_SCREEN_IDS)[number];

export const NEED_SCREEN_PROTOTYPE_MAP: Record<NeedScreenId, string> = {
  "need-home": "prototype-need-home",
  search: "prototype-search",
  "opportunity-list": "prototype-opportunity-list",
  request: "prototype-request",
  "empty-state": "prototype-empty-state",
  transition: "prototype-transition",
};

export const NEED_SCREEN_ROUTES: Record<NeedScreenId, string> = {
  "need-home": "/need/home",
  search: "/need/search",
  "opportunity-list": "/need/opportunities",
  request: "/need/request/create",
  "empty-state": "/need/empty",
  transition: "/system/transition",
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

export interface NeedScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface NeedScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  activeBottomNavId?: string;
  stackDepth: number;
  nextRoute?: string;
}

export interface NeedScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface NeedRuntimeScreenView {
  screenId: NeedScreenId;
  prototypeId: string;
  route: string;
  mode: "need" | "transition";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: NeedScreenSection[];
  navigation: NeedScreenNavigationView;
  accessibility: NeedScreenAccessibilityView;
  generatedAt: string;
}

export interface NeedExperienceFlowStep {
  screenId: NeedScreenId;
  route: string;
  label: string;
}

export const NEED_EXPERIENCE_FLOW: NeedExperienceFlowStep[] = [
  { screenId: "need-home", route: NEED_SCREEN_ROUTES["need-home"], label: "Need Home" },
  { screenId: "search", route: NEED_SCREEN_ROUTES.search, label: "Search" },
  { screenId: "opportunity-list", route: NEED_SCREEN_ROUTES["opportunity-list"], label: "Opportunity List" },
  { screenId: "request", route: NEED_SCREEN_ROUTES.request, label: "Request" },
  { screenId: "transition", route: NEED_SCREEN_ROUTES.transition, label: "Official Transition" },
];

export function isNeedScreenId(value: string): value is NeedScreenId {
  return NEED_SCREEN_IDS.includes(value as NeedScreenId);
}
