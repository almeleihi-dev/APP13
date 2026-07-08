import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const CONTRACT_EXPERIENCE_VERSION = "an-act-contract-experience-v1" as const;

export const CONTRACT_SCREEN_IDS = [
  "contract-home",
  "contract-review",
  "parties",
  "terms",
  "timeline",
  "cost",
  "confirmation",
  "status",
  "empty-state",
  "transition",
] as const;

export type ContractScreenId = (typeof CONTRACT_SCREEN_IDS)[number];

export const CONTRACT_SCREEN_PROTOTYPE_MAP: Record<ContractScreenId, string> = {
  "contract-home": "prototype-contract",
  "contract-review": "prototype-contract",
  parties: "prototype-contract",
  terms: "prototype-contract",
  timeline: "prototype-completion",
  cost: "prototype-contract",
  confirmation: "prototype-contract",
  status: "prototype-contract",
  "empty-state": "prototype-empty-state",
  transition: "prototype-transition",
};

export const CONTRACT_SCREEN_ROUTES: Record<ContractScreenId, string> = {
  "contract-home": "/contract/home",
  "contract-review": "/contract/review",
  parties: "/contract/parties",
  terms: "/contract/terms",
  timeline: "/contract/timeline",
  cost: "/contract/cost",
  confirmation: "/contract/confirmation",
  status: "/contract/status",
  "empty-state": "/contract/empty",
  transition: "/system/transition",
};

export const CONTRACT_SECTION_IDS = [
  "summary",
  "review",
  "parties",
  "terms",
  "timeline",
  "cost",
  "confirmation",
  "status",
] as const;

export type ContractSectionId = (typeof CONTRACT_SECTION_IDS)[number];

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

export interface ContractScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface ContractScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  floatingActionVisible: boolean;
  activeSectionId?: ContractSectionId;
  stackDepth: number;
  nextRoute?: string;
  returnToActionHomeRoute: string;
}

export interface ContractScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface ContractRuntimeScreenView {
  screenId: ContractScreenId;
  prototypeId: string;
  route: string;
  mode: "action" | "transition";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: ContractScreenSection[];
  navigation: ContractScreenNavigationView;
  accessibility: ContractScreenAccessibilityView;
  generatedAt: string;
}

export interface ContractExperienceFlowStep {
  screenId: ContractScreenId;
  route: string;
  label: string;
}

export const CONTRACT_EXPERIENCE_FLOW: ContractExperienceFlowStep[] = [
  { screenId: "contract-home", route: CONTRACT_SCREEN_ROUTES["contract-home"], label: "Contract Home" },
  { screenId: "contract-review", route: CONTRACT_SCREEN_ROUTES["contract-review"], label: "Contract Review" },
  { screenId: "parties", route: CONTRACT_SCREEN_ROUTES.parties, label: "Parties" },
  { screenId: "terms", route: CONTRACT_SCREEN_ROUTES.terms, label: "Terms" },
  { screenId: "timeline", route: CONTRACT_SCREEN_ROUTES.timeline, label: "Timeline" },
  { screenId: "cost", route: CONTRACT_SCREEN_ROUTES.cost, label: "Cost" },
  { screenId: "confirmation", route: CONTRACT_SCREEN_ROUTES.confirmation, label: "Confirmation" },
  { screenId: "status", route: CONTRACT_SCREEN_ROUTES.status, label: "Contract Status" },
  { screenId: "transition", route: CONTRACT_SCREEN_ROUTES.transition, label: "Transition to Active Action" },
];

export function isContractScreenId(value: string): value is ContractScreenId {
  return CONTRACT_SCREEN_IDS.includes(value as ContractScreenId);
}

export function isContractSectionId(value: string): value is ContractSectionId {
  return CONTRACT_SECTION_IDS.includes(value as ContractSectionId);
}
