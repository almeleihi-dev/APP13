import type { ContractScreenId, ContractSectionId } from "./contract-screen.js";
import {
  buildDefaultContractSummary,
  type ContractSummaryModel,
  type ContractLifecycleStatus,
} from "./contract-summary.js";
import type { TransitionEngineState } from "../../../navigation-framework/transitions/transition-engine.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export interface ContractSessionState {
  userId: string;
  currentScreen: ContractScreenId;
  navigation: NavigationState;
  summary: ContractSummaryModel;
  visitedSections: ContractSectionId[];
  needHandoff?: NeedRequestDraft;
  transition?: TransitionEngineState;
  mode: "action" | "transition";
  generatedAt: string;
}

export function createContractSessionState(userId: string, generatedAt: string): ContractSessionState {
  return {
    userId,
    currentScreen: "contract-home",
    navigation: buildInitialNavigationState("/contract/home"),
    summary: buildDefaultContractSummary(`contract-${userId.slice(-6)}`),
    visitedSections: [],
    mode: "action",
    generatedAt,
  };
}

export function applyContractStatus(summary: ContractSummaryModel, status: ContractLifecycleStatus): ContractSummaryModel {
  return { ...summary, status };
}

export function markSectionVisited(
  visited: ContractSectionId[],
  sectionId: ContractSectionId
): ContractSectionId[] {
  if (visited.includes(sectionId)) return visited;
  return [...visited, sectionId];
}
