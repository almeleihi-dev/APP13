import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const ACTION_EXPERIENCE_VERSION = "an-act-action-experience-v1" as const;

export const ACTION_SCREEN_IDS = [
  "action-home",
  "contract-preview",
  "active-action",
  "progress-screen",
  "completion-screen",
  "waiting-screen",
  "transition",
] as const;

export type ActionScreenId = (typeof ACTION_SCREEN_IDS)[number];

export const ACTION_SCREEN_PROTOTYPE_MAP: Record<ActionScreenId, string> = {
  "action-home": "prototype-action-home",
  "contract-preview": "prototype-contract",
  "active-action": "prototype-active-action",
  "progress-screen": "prototype-completion",
  "completion-screen": "prototype-success",
  "waiting-screen": "prototype-loading",
  transition: "prototype-transition",
};

export const ACTION_SCREEN_ROUTES: Record<ActionScreenId, string> = {
  "action-home": "/action/home",
  "contract-preview": "/action/contract",
  "active-action": "/action/active",
  "progress-screen": "/action/progress",
  "completion-screen": "/action/completion",
  "waiting-screen": "/action/waiting",
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

export interface ActionScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface ActionScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  floatingActionVisible: boolean;
  activeNavId?: string;
  stackDepth: number;
  nextRoute?: string;
}

export interface ActionScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface ActionRuntimeScreenView {
  screenId: ActionScreenId;
  prototypeId: string;
  route: string;
  mode: "action" | "transition";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: ActionScreenSection[];
  navigation: ActionScreenNavigationView;
  accessibility: ActionScreenAccessibilityView;
  generatedAt: string;
}

export interface ActionExperienceFlowStep {
  screenId: ActionScreenId;
  route: string;
  label: string;
}

export const ACTION_EXPERIENCE_FLOW: ActionExperienceFlowStep[] = [
  { screenId: "action-home", route: ACTION_SCREEN_ROUTES["action-home"], label: "Action Home" },
  { screenId: "contract-preview", route: ACTION_SCREEN_ROUTES["contract-preview"], label: "Contract Preview" },
  { screenId: "active-action", route: ACTION_SCREEN_ROUTES["active-action"], label: "Active Action" },
  { screenId: "progress-screen", route: ACTION_SCREEN_ROUTES["progress-screen"], label: "Progress" },
  { screenId: "completion-screen", route: ACTION_SCREEN_ROUTES["completion-screen"], label: "Completion" },
  { screenId: "transition", route: ACTION_SCREEN_ROUTES.transition, label: "Return Transition" },
];

export function isActionScreenId(value: string): value is ActionScreenId {
  return ACTION_SCREEN_IDS.includes(value as ActionScreenId);
}
