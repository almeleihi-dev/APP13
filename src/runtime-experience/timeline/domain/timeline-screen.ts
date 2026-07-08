import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const TIMELINE_EXPERIENCE_VERSION = "an-act-timeline-experience-v1" as const;

export const TIMELINE_SCREEN_IDS = [
  "timeline-home",
  "timeline-history",
  "timeline-detail",
  "timeline-progress",
  "timeline-filters",
  "timeline-empty-state",
] as const;

export type TimelineScreenId = (typeof TIMELINE_SCREEN_IDS)[number];

export const TIMELINE_SCREEN_PROTOTYPE_MAP: Record<TimelineScreenId, string> = {
  "timeline-home": "prototype-timeline",
  "timeline-history": "prototype-timeline",
  "timeline-detail": "prototype-timeline",
  "timeline-progress": "prototype-timeline",
  "timeline-filters": "prototype-timeline",
  "timeline-empty-state": "prototype-empty-state",
};

export const TIMELINE_SCREEN_ROUTES: Record<TimelineScreenId, string> = {
  "timeline-home": "/timeline/home",
  "timeline-history": "/timeline/history",
  "timeline-detail": "/timeline/detail",
  "timeline-progress": "/timeline/progress",
  "timeline-filters": "/timeline/filters",
  "timeline-empty-state": "/timeline/empty",
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

export interface TimelineScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface TimelineScreenNavigationView {
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
}

export interface TimelineScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface TimelineRuntimeScreenView {
  screenId: TimelineScreenId;
  prototypeId: string;
  route: string;
  mode: "need" | "shared";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: TimelineScreenSection[];
  navigation: TimelineScreenNavigationView;
  accessibility: TimelineScreenAccessibilityView;
  generatedAt: string;
}

export interface TimelineExperienceFlowStep {
  screenId: TimelineScreenId;
  route: string;
  label: string;
}

export const TIMELINE_EXPERIENCE_FLOW: TimelineExperienceFlowStep[] = [
  { screenId: "timeline-home", route: TIMELINE_SCREEN_ROUTES["timeline-home"], label: "Timeline Home" },
  { screenId: "timeline-history", route: TIMELINE_SCREEN_ROUTES["timeline-history"], label: "Timeline History" },
  { screenId: "timeline-detail", route: TIMELINE_SCREEN_ROUTES["timeline-detail"], label: "Timeline Detail" },
  { screenId: "timeline-progress", route: TIMELINE_SCREEN_ROUTES["timeline-progress"], label: "Timeline Progress" },
  { screenId: "timeline-filters", route: TIMELINE_SCREEN_ROUTES["timeline-filters"], label: "Timeline Filters" },
];

export const TIMELINE_LIFECYCLE_FLOW = [
  "Need",
  "Request",
  "Matching",
  "Contract",
  "Chat",
  "Action",
  "Completion",
  "Archive",
] as const;

export function isTimelineScreenId(value: string): value is TimelineScreenId {
  return TIMELINE_SCREEN_IDS.includes(value as TimelineScreenId);
}
