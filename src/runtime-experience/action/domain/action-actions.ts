import type { ActionScreenId } from "./action-screen.js";
import type { WaitingReason } from "./action-state.js";

export type ActionActionType =
  | "navigate"
  | "back"
  | "bottom-nav"
  | "contract-nav"
  | "progress-nav"
  | "continue-contract"
  | "start-action"
  | "advance-progress"
  | "complete-action"
  | "set-waiting"
  | "start-return-transition"
  | "advance-transition";

export interface ActionNavigateAction {
  type: "navigate";
  targetScreen: ActionScreenId;
}

export interface ActionBackAction {
  type: "back";
}

export interface ActionBottomNavAction {
  type: "bottom-nav";
  itemId: string;
}

export interface ActionContractNavAction {
  type: "contract-nav";
}

export interface ActionProgressNavAction {
  type: "progress-nav";
}

export interface ActionContinueContractAction {
  type: "continue-contract";
}

export interface ActionStartActionAction {
  type: "start-action";
}

export interface ActionAdvanceProgressAction {
  type: "advance-progress";
  milestoneId?: string;
}

export interface ActionCompleteActionAction {
  type: "complete-action";
}

export interface ActionSetWaitingAction {
  type: "set-waiting";
  reason: WaitingReason;
}

export interface ActionStartReturnTransitionAction {
  type: "start-return-transition";
}

export interface ActionAdvanceTransitionAction {
  type: "advance-transition";
  progress: number;
  stageIndex?: number;
}

export type ActionAction =
  | ActionNavigateAction
  | ActionBackAction
  | ActionBottomNavAction
  | ActionContractNavAction
  | ActionProgressNavAction
  | ActionContinueContractAction
  | ActionStartActionAction
  | ActionAdvanceProgressAction
  | ActionCompleteActionAction
  | ActionSetWaitingAction
  | ActionStartReturnTransitionAction
  | ActionAdvanceTransitionAction;

export const ACTION_BOTTOM_NAV_TARGETS: Record<string, ActionScreenId> = {
  home: "action-home",
  contract: "contract-preview",
  progress: "progress-screen",
  completion: "completion-screen",
};

export const ACTION_ACTION_LABELS: Record<ActionActionType, string> = {
  navigate: "Navigate to screen",
  back: "Go back",
  "bottom-nav": "Bottom navigation",
  "contract-nav": "Navigate to contract",
  "progress-nav": "Navigate to progress",
  "continue-contract": "Continue from contract preview",
  "start-action": "Start active action",
  "advance-progress": "Advance progress",
  "complete-action": "Complete action",
  "set-waiting": "Set waiting state",
  "start-return-transition": "Start return transition",
  "advance-transition": "Advance return transition",
};
