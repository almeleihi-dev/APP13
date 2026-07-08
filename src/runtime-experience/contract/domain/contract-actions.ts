import type { ContractScreenId, ContractSectionId } from "./contract-screen.js";

export type ContractActionType =
  | "navigate"
  | "back"
  | "section-nav"
  | "bottom-nav"
  | "continue-review"
  | "continue-parties"
  | "continue-terms"
  | "continue-timeline"
  | "continue-cost"
  | "confirm-contract"
  | "start-transition"
  | "advance-transition"
  | "return-action-home";

export interface ContractNavigateAction {
  type: "navigate";
  targetScreen: ContractScreenId;
}

export interface ContractBackAction {
  type: "back";
}

export interface ContractSectionNavAction {
  type: "section-nav";
  sectionId: ContractSectionId;
}

export interface ContractBottomNavAction {
  type: "bottom-nav";
  itemId: string;
}

export interface ContractContinueReviewAction {
  type: "continue-review";
}

export interface ContractContinuePartiesAction {
  type: "continue-parties";
}

export interface ContractContinueTermsAction {
  type: "continue-terms";
}

export interface ContractContinueTimelineAction {
  type: "continue-timeline";
}

export interface ContractContinueCostAction {
  type: "continue-cost";
}

export interface ContractConfirmAction {
  type: "confirm-contract";
  confirmed: boolean;
}

export interface ContractStartTransitionAction {
  type: "start-transition";
}

export interface ContractAdvanceTransitionAction {
  type: "advance-transition";
  progress: number;
  stageIndex?: number;
}

export interface ContractReturnActionHomeAction {
  type: "return-action-home";
}

export type ContractAction =
  | ContractNavigateAction
  | ContractBackAction
  | ContractSectionNavAction
  | ContractBottomNavAction
  | ContractContinueReviewAction
  | ContractContinuePartiesAction
  | ContractContinueTermsAction
  | ContractContinueTimelineAction
  | ContractContinueCostAction
  | ContractConfirmAction
  | ContractStartTransitionAction
  | ContractAdvanceTransitionAction
  | ContractReturnActionHomeAction;

export const CONTRACT_SECTION_SCREEN_MAP: Record<ContractSectionId, ContractScreenId> = {
  summary: "contract-home",
  review: "contract-review",
  parties: "parties",
  terms: "terms",
  timeline: "timeline",
  cost: "cost",
  confirmation: "confirmation",
  status: "status",
};

export const CONTRACT_BOTTOM_NAV_TARGETS: Record<string, ContractScreenId> = {
  home: "contract-home",
  review: "contract-review",
  parties: "parties",
  terms: "terms",
  timeline: "timeline",
  cost: "cost",
  status: "status",
};

export const CONTRACT_ACTION_LABELS: Record<ContractActionType, string> = {
  navigate: "Navigate to contract screen",
  back: "Go back",
  "section-nav": "Navigate to contract section",
  "bottom-nav": "Contract bottom navigation",
  "continue-review": "Continue from review",
  "continue-parties": "Continue from parties",
  "continue-terms": "Continue from terms",
  "continue-timeline": "Continue from timeline",
  "continue-cost": "Continue from cost",
  "confirm-contract": "User confirms contract",
  "start-transition": "Start contract transition",
  "advance-transition": "Advance contract transition",
  "return-action-home": "Return to action home",
};
