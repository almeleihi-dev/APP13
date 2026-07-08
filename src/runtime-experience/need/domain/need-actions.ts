import type { NeedScreenId } from "./need-screen.js";

export type NeedActionType =
  | "navigate"
  | "back"
  | "bottom-nav"
  | "search"
  | "filter-category"
  | "select-opportunity"
  | "update-request"
  | "continue-request"
  | "start-transition"
  | "advance-transition";

export interface NeedNavigateAction {
  type: "navigate";
  targetScreen: NeedScreenId;
}

export interface NeedBackAction {
  type: "back";
}

export interface NeedBottomNavAction {
  type: "bottom-nav";
  itemId: string;
}

export interface NeedSearchAction {
  type: "search";
  keyword: string;
  category?: string;
}

export interface NeedFilterCategoryAction {
  type: "filter-category";
  category: string;
}

export interface NeedSelectOpportunityAction {
  type: "select-opportunity";
  opportunityId: string;
}

export interface NeedUpdateRequestAction {
  type: "update-request";
  fields: Partial<{
    actionSummary: string;
    location: string;
    schedule: string;
    notes: string;
    estimatedCost: number;
  }>;
}

export interface NeedContinueRequestAction {
  type: "continue-request";
}

export interface NeedStartTransitionAction {
  type: "start-transition";
}

export interface NeedAdvanceTransitionAction {
  type: "advance-transition";
  progress: number;
  stageIndex?: number;
}

export type NeedAction =
  | NeedNavigateAction
  | NeedBackAction
  | NeedBottomNavAction
  | NeedSearchAction
  | NeedFilterCategoryAction
  | NeedSelectOpportunityAction
  | NeedUpdateRequestAction
  | NeedContinueRequestAction
  | NeedStartTransitionAction
  | NeedAdvanceTransitionAction;

export const NEED_BOTTOM_NAV_TARGETS: Record<string, NeedScreenId> = {
  home: "need-home",
  search: "search",
  timeline: "need-home",
  profile: "need-home",
};

export const NEED_ACTION_LABELS: Record<NeedActionType, string> = {
  navigate: "Navigate to screen",
  back: "Go back",
  "bottom-nav": "Bottom navigation",
  search: "Search opportunities",
  "filter-category": "Filter by category",
  "select-opportunity": "Select opportunity",
  "update-request": "Update request draft",
  "continue-request": "Continue to transition",
  "start-transition": "Start official transition",
  "advance-transition": "Advance transition progress",
};
