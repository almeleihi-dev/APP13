import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import { AppError } from "../../../shared/errors/index.js";
import type { TimelineScreenId, TimelineRuntimeScreenView } from "../domain/timeline-screen.js";
import {
  TIMELINE_EXPERIENCE_FLOW,
  TIMELINE_EXPERIENCE_VERSION,
  TIMELINE_SCREEN_PROTOTYPE_MAP,
  isTimelineScreenId,
} from "../domain/timeline-screen.js";
import {
  createTimelineSessionState,
  type TimelineSessionState,
  type TimelineFilterId,
  isTimelineFilterId,
} from "../domain/timeline-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToDetail,
} from "./timeline-navigation.js";
import { groupEventsByDate, buildProgressStages } from "./timeline-builder.js";
import { buildTimelineHomeScreen } from "../presentation/timeline-home.js";
import { buildTimelineHistoryScreen } from "../presentation/timeline-history.js";
import { buildTimelineDetailScreen } from "../presentation/timeline-detail.js";
import { buildTimelineProgressScreen } from "../presentation/timeline-progress.js";
import { buildTimelineFiltersScreen } from "../presentation/timeline-filters.js";
import { buildTimelineEmptyStateScreen } from "../presentation/timeline-empty-state.js";
import { TimelineRepository, createTimelineRepository } from "../infrastructure/timeline-repository.js";
import { validateTimelineExperience } from "../validation/timeline-experience-validator.js";

export type TimelineAction =
  | { type: "navigate"; targetScreen: TimelineScreenId }
  | { type: "back" }
  | { type: "bottom-nav"; itemId: string }
  | { type: "open-detail"; eventId: string }
  | { type: "set-filter"; filter: TimelineFilterId }
  | { type: "return-need-home" }
  | { type: "return-action-home" }
  | { type: "return-contract" }
  | { type: "return-chat" };

export class TimelineExperienceService {
  private readonly repository: TimelineRepository;
  private readonly sessions = new Map<string, TimelineSessionState>();

  constructor(deps?: { repository?: TimelineRepository }) {
    this.repository = deps?.repository ?? createTimelineRepository();
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(
    authContext: AuthContext,
    screenId: TimelineScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "timeline-home", input?.generated_at);
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string; filter?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (input?.filter && isTimelineFilterId(input.filter)) {
      session.activeFilter = input.filter;
    }
    session.currentScreen = "timeline-history";
    session.navigation = navigateToScreen(session.navigation, "timeline-history");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "timeline-history");
  }

  getDetail(authContext: AuthContext, eventId: string, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    const event = this.repository.getEvent(authContext.userId, eventId);
    if (!event) {
      throw new AppError({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: `Unknown timeline event: ${eventId}`,
        code: "NOT_FOUND",
      });
    }
    session.activeEventId = eventId;
    session.currentScreen = "timeline-detail";
    session.navigation = navigateToDetail(session.navigation, eventId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "timeline-detail");
  }

  getProgress(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "timeline-progress", input?.generated_at);
  }

  getFilters(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "timeline-filters", input?.generated_at);
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    const refreshedAt = input?.generated_at ?? new Date().toISOString();
    session.lastRefreshedAt = refreshedAt;
    session.generatedAt = refreshedAt;
    this.repository.refresh(authContext.userId, refreshedAt);
    this.sessions.set(authContext.userId, session);
    return {
      refreshed_at: refreshedAt,
      read_only: true,
      event_count: this.repository.getEvents(authContext.userId).length,
      screen: this.buildScreenForSession(session, session.currentScreen),
    };
  }

  dispatchAction(authContext: AuthContext, action: TimelineAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as TimelineScreenId) ?? "timeline-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "open-detail":
        return this.getDetail(authContext, action.eventId, input);
      case "set-filter":
        session.activeFilter = action.filter;
        session.currentScreen = "timeline-history";
        break;
      case "return-need-home":
        return { return_route: "/need/home", current_screen: session.currentScreen, read_only: true };
      case "return-action-home":
        return { return_route: "/action/home", current_screen: session.currentScreen, read_only: true };
      case "return-contract":
        return { return_route: "/contract/home", current_screen: session.currentScreen, read_only: true };
      case "return-chat":
        return { return_route: "/chat/home", current_screen: session.currentScreen, read_only: true };
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen), read_only: true };
  }

  getFlow() {
    return {
      version: TIMELINE_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      flow: TIMELINE_EXPERIENCE_FLOW,
      prototype_map: TIMELINE_SCREEN_PROTOTYPE_MAP,
      read_only: true,
    };
  }

  validateRuntime() {
    return validateTimelineExperience();
  }

  private navigateTo(authContext: AuthContext, screenId: TimelineScreenId, generatedAt?: string) {
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    session.currentScreen = screenId;
    session.navigation = navigateToScreen(session.navigation, screenId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, screenId);
  }

  private getOrCreateSession(userId: string, generatedAt?: string): TimelineSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    const session = createTimelineSessionState(userId, at);
    this.repository.getEvents(userId);
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: TimelineSessionState,
    screenId: TimelineScreenId,
    _reducedMotion = false
  ): TimelineRuntimeScreenView {
    const events = this.repository.getFilteredEvents(session.userId, session.activeFilter);
    const allEvents = this.repository.getEvents(session.userId);
    const summary = this.repository.getSummary(session.userId);

    if (allEvents.length === 0 && screenId !== "timeline-empty-state") {
      return buildTimelineEmptyStateScreen(session.navigation, session.generatedAt);
    }

    switch (screenId) {
      case "timeline-home":
        return buildTimelineHomeScreen(summary, allEvents, session.navigation, session.generatedAt);
      case "timeline-history":
        return buildTimelineHistoryScreen(groupEventsByDate(events), session.navigation, session.generatedAt);
      case "timeline-detail": {
        const event = session.activeEventId
          ? this.repository.getEvent(session.userId, session.activeEventId)
          : undefined;
        if (!event) {
          return buildTimelineHomeScreen(summary, allEvents, session.navigation, session.generatedAt);
        }
        return buildTimelineDetailScreen(event, session.navigation, session.generatedAt);
      }
      case "timeline-progress":
        return buildTimelineProgressScreen(
          buildProgressStages(allEvents),
          session.navigation,
          session.generatedAt
        );
      case "timeline-filters":
        return buildTimelineFiltersScreen(session.activeFilter, session.navigation, session.generatedAt);
      case "timeline-empty-state":
        return buildTimelineEmptyStateScreen(session.navigation, session.generatedAt);
      default:
        if (!isTimelineScreenId(screenId)) throw new Error(`Unknown screen: ${screenId}`);
        return buildTimelineHomeScreen(summary, allEvents, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: TimelineSessionState, _reducedMotion?: boolean) {
    const allEvents = this.repository.getEvents(session.userId);
    const summary = this.repository.getSummary(session.userId);
    return {
      version: TIMELINE_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      active_event_id: session.activeEventId,
      active_filter: session.activeFilter,
      screen: this.buildScreenForSession(session, session.currentScreen),
      navigation: session.navigation,
      summary,
      event_count: allEvents.length,
      flow: TIMELINE_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      last_refreshed_at: session.lastRefreshedAt,
      runtime_experience: true,
      read_only: true,
    };
  }
}

export interface TimelineExperienceModule {
  timelineExperience: TimelineExperienceService;
}

export function createTimelineExperienceModule(deps?: {
  repository?: TimelineRepository;
}): TimelineExperienceModule {
  return { timelineExperience: new TimelineExperienceService(deps) };
}

export function createTimelineExperienceService(deps?: {
  repository?: TimelineRepository;
}): TimelineExperienceService {
  return new TimelineExperienceService(deps);
}
