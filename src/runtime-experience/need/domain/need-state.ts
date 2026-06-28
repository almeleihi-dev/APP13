import type { NeedScreenId } from "./need-screen.js";
import type { TransitionEngineState } from "../../../navigation-framework/transitions/transition-engine.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";

export interface NeedSearchState {
  keyword: string;
  category?: string;
  recentSearches: string[];
  suggestions: string[];
  loading: boolean;
  hasResults: boolean;
}

export interface NeedRequestDraft {
  opportunityId?: string;
  actionSummary: string;
  location: string;
  schedule: string;
  notes: string;
  estimatedCost: number;
}

export interface NeedSessionState {
  userId: string;
  currentScreen: NeedScreenId;
  navigation: NavigationState;
  search: NeedSearchState;
  requestDraft: NeedRequestDraft;
  selectedOpportunityId?: string;
  transition?: TransitionEngineState;
  mode: "need" | "transition" | "action";
  generatedAt: string;
}

export function createInitialSearchState(): NeedSearchState {
  return {
    keyword: "",
    recentSearches: [],
    suggestions: [],
    loading: false,
    hasResults: true,
  };
}

export function createInitialRequestDraft(): NeedRequestDraft {
  return {
    actionSummary: "",
    location: "",
    schedule: "",
    notes: "",
    estimatedCost: 0,
  };
}

export function createInitialNeedSessionState(userId: string, generatedAt: string): NeedSessionState {
  return {
    userId,
    currentScreen: "need-home",
    navigation: buildInitialNavigationState("/need/home"),
    search: createInitialSearchState(),
    requestDraft: createInitialRequestDraft(),
    mode: "need",
    generatedAt,
  };
}
