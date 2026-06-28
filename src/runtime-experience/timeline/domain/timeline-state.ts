import type { TimelineScreenId } from "./timeline-screen.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";

export type TimelineFilterId = "today" | "week" | "month" | "active" | "completed" | "archived";

export const TIMELINE_FILTER_IDS: TimelineFilterId[] = [
  "today",
  "week",
  "month",
  "active",
  "completed",
  "archived",
];

export interface TimelineSessionState {
  userId: string;
  currentScreen: TimelineScreenId;
  activeEventId?: string;
  activeFilter: TimelineFilterId;
  navigation: NavigationState;
  generatedAt: string;
  lastRefreshedAt: string;
}

export function createTimelineSessionState(userId: string, generatedAt: string): TimelineSessionState {
  return {
    userId,
    currentScreen: "timeline-home",
    activeFilter: "week",
    navigation: buildInitialNavigationState("/timeline/home"),
    generatedAt,
    lastRefreshedAt: generatedAt,
  };
}

export function isTimelineFilterId(value: string): value is TimelineFilterId {
  return TIMELINE_FILTER_IDS.includes(value as TimelineFilterId);
}
