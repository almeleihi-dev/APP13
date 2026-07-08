import type { SemanticColorTokenPath, SpacingTokenName, TypographyStyle } from "@an-act/tokens";

export const RUNTIME_CONTRACT_VERSION = "an-act-runtime-json-v1" as const;

export const CORE_UI_COMPONENT_IDS = [
  "core-ui-button",
  "core-ui-input",
  "core-ui-search",
  "core-ui-card",
  "core-ui-timeline-card",
  "core-ui-achievement-card",
  "core-ui-analytics-card",
  "core-ui-contract-card",
  "core-ui-recommendation-card",
  "core-ui-live-frame",
  "core-ui-badge",
  "core-ui-chip",
  "core-ui-avatar",
  "core-ui-progress",
  "core-ui-navigation-bar",
  "core-ui-side-navigation",
  "core-ui-bottom-navigation",
  "core-ui-floating-action-button",
  "core-ui-modal",
  "core-ui-dialog",
  "core-ui-sheet",
  "core-ui-toast",
  "core-ui-loading",
] as const;

export type CoreUiComponentId = (typeof CORE_UI_COMPONENT_IDS)[number];

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

export interface RuntimeScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface RuntimeScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  activeBottomNavId?: string;
  stackDepth: number;
  nextRoute?: string;
}

export interface RuntimeScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface AnActRuntimeScreenView {
  screenId: string;
  prototypeId: string;
  route: string;
  mode: "need" | "action" | "transition";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: {
    contentPaddingX: SpacingTokenName;
    contentPaddingY: SpacingTokenName;
    gap: SpacingTokenName;
  };
  regions: string[];
  sections: RuntimeScreenSection[];
  navigation: RuntimeScreenNavigationView;
  accessibility: RuntimeScreenAccessibilityView;
  generatedAt: string;
}

export interface RuntimeValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface RuntimeValidationResult {
  valid: boolean;
  issues: RuntimeValidationIssue[];
}

export interface ActionRelayTarget {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  experienceId: string;
}

export interface ActionRelayRequest {
  actionId: string;
  screenId: string;
  route: string;
  payload?: Record<string, unknown>;
}

export interface ActionRelayResult {
  actionId: string;
  target: ActionRelayTarget;
  body?: Record<string, unknown>;
}
