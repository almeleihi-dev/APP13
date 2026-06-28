import type { ActionScreenId } from "./action-screen.js";
import type { TransitionEngineState } from "../../../navigation-framework/transitions/transition-engine.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export type WaitingReason = "customer" | "confirmation" | "payment";

export interface ActionMilestone {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
}

export interface ActionContractSummary {
  actionSummary: string;
  customerName: string;
  providerName: string;
  schedule: string;
  location: string;
  notes: string;
  estimatedCostSar: number;
  agreementStatus: "draft" | "pending" | "active" | "complete";
}

export interface ActionSessionState {
  userId: string;
  currentScreen: ActionScreenId;
  navigation: NavigationState;
  contract: ActionContractSummary;
  currentStage: string;
  milestones: ActionMilestone[];
  completionPercentage: number;
  remainingMinutes: number;
  waitingReason?: WaitingReason;
  needHandoff?: NeedRequestDraft;
  transition?: TransitionEngineState;
  mode: "action" | "transition" | "need";
  generatedAt: string;
}

export function createInitialContract(): ActionContractSummary {
  return {
    actionSummary: "Certified Electrician — Panel Upgrade",
    customerName: "Customer",
    providerName: "Licensed Professional",
    schedule: "Mon 10:00",
    location: "Riyadh",
    notes: "",
    estimatedCostSar: 850,
    agreementStatus: "pending",
  };
}

export function createDefaultMilestones(): ActionMilestone[] {
  return [
    { id: "ms-1", label: "Arrive on site", status: "complete" },
    { id: "ms-2", label: "Assess panel", status: "active" },
    { id: "ms-3", label: "Complete upgrade", status: "pending" },
    { id: "ms-4", label: "Final inspection", status: "pending" },
  ];
}

export function createInitialActionSessionState(userId: string, generatedAt: string): ActionSessionState {
  return {
    userId,
    currentScreen: "action-home",
    navigation: buildInitialNavigationState("/action/home"),
    contract: createInitialContract(),
    currentStage: "Ready to execute",
    milestones: createDefaultMilestones(),
    completionPercentage: 25,
    remainingMinutes: 90,
    mode: "action",
    generatedAt,
  };
}
