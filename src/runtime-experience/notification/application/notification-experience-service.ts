import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import { AppError } from "../../../shared/errors/index.js";
import type { NotificationScreenId, NotificationRuntimeScreenView } from "../domain/notification-screen.js";
import {
  NOTIFICATION_EXPERIENCE_FLOW,
  NOTIFICATION_EXPERIENCE_VERSION,
  NOTIFICATION_SCREEN_PROTOTYPE_MAP,
  isNotificationScreenId,
} from "../domain/notification-screen.js";
import {
  createNotificationSessionState,
  type NotificationSessionState,
  type NotificationFilterId,
  isNotificationFilterId,
} from "../domain/notification-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToDetail,
} from "./notification-navigation.js";
import { groupNotificationsByDate } from "./notification-builder.js";
import { buildNotificationHomeScreen } from "../presentation/notification-home.js";
import { buildNotificationListScreen } from "../presentation/notification-list.js";
import { buildNotificationDetailScreen } from "../presentation/notification-detail.js";
import { buildNotificationFiltersScreen } from "../presentation/notification-filters.js";
import { buildNotificationSettingsScreen } from "../presentation/notification-settings.js";
import { buildNotificationEmptyStateScreen } from "../presentation/notification-empty-state.js";
import { NotificationRepository, createNotificationRepository } from "../infrastructure/notification-repository.js";
import { validateNotificationExperience } from "../validation/notification-experience-validator.js";

export type NotificationAction =
  | { type: "navigate"; targetScreen: NotificationScreenId }
  | { type: "back" }
  | { type: "bottom-nav"; itemId: string }
  | { type: "open-detail"; notificationId: string }
  | { type: "set-filter"; filter: NotificationFilterId }
  | { type: "return-need-home" }
  | { type: "return-action-home" }
  | { type: "return-contract" }
  | { type: "return-chat" }
  | { type: "return-timeline" };

export class NotificationExperienceService {
  private readonly repository: NotificationRepository;
  private readonly sessions = new Map<string, NotificationSessionState>();

  constructor(deps?: { repository?: NotificationRepository }) {
    this.repository = deps?.repository ?? createNotificationRepository();
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(
    authContext: AuthContext,
    screenId: NotificationScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "notification-home", input?.generated_at);
  }

  getList(authContext: AuthContext, input?: { generated_at?: string; filter?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (input?.filter && isNotificationFilterId(input.filter)) {
      session.activeFilter = input.filter;
    }
    session.currentScreen = "notification-list";
    session.navigation = navigateToScreen(session.navigation, "notification-list");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "notification-list");
  }

  getDetail(authContext: AuthContext, notificationId: string, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    const notification = this.repository.getNotification(authContext.userId, notificationId);
    if (!notification) {
      throw new AppError({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: `Unknown notification: ${notificationId}`,
        code: "NOT_FOUND",
      });
    }
    session.activeNotificationId = notificationId;
    session.currentScreen = "notification-detail";
    session.navigation = navigateToDetail(session.navigation, notificationId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "notification-detail");
  }

  getFilters(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "notification-filters", input?.generated_at);
  }

  getSettings(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "notification-settings", input?.generated_at);
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
      delivery: false,
      notification_count: this.repository.getNotifications(authContext.userId).length,
      screen: this.buildScreenForSession(session, session.currentScreen),
    };
  }

  dispatchAction(authContext: AuthContext, action: NotificationAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen =
          (session.navigation.stack.at(-1)?.screenId as NotificationScreenId) ?? "notification-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "open-detail":
        return this.getDetail(authContext, action.notificationId, input);
      case "set-filter":
        session.activeFilter = action.filter;
        session.currentScreen = "notification-list";
        break;
      case "return-need-home":
        return { return_route: "/need/home", current_screen: session.currentScreen, read_only: true };
      case "return-action-home":
        return { return_route: "/action/home", current_screen: session.currentScreen, read_only: true };
      case "return-contract":
        return { return_route: "/contract/home", current_screen: session.currentScreen, read_only: true };
      case "return-chat":
        return { return_route: "/chat/home", current_screen: session.currentScreen, read_only: true };
      case "return-timeline":
        return { return_route: "/timeline/home", current_screen: session.currentScreen, read_only: true };
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen), read_only: true };
  }

  getFlow() {
    return {
      version: NOTIFICATION_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      flow: NOTIFICATION_EXPERIENCE_FLOW,
      prototype_map: NOTIFICATION_SCREEN_PROTOTYPE_MAP,
      read_only: true,
      delivery: false,
    };
  }

  validateRuntime() {
    return validateNotificationExperience();
  }

  private navigateTo(authContext: AuthContext, screenId: NotificationScreenId, generatedAt?: string) {
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    session.currentScreen = screenId;
    session.navigation = navigateToScreen(session.navigation, screenId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, screenId);
  }

  private getOrCreateSession(userId: string, generatedAt?: string): NotificationSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    const session = createNotificationSessionState(userId, at);
    this.repository.getNotifications(userId);
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: NotificationSessionState,
    screenId: NotificationScreenId,
    _reducedMotion = false
  ): NotificationRuntimeScreenView {
    const allItems = this.repository.getNotifications(session.userId);
    const filtered = this.repository.getFilteredNotifications(session.userId, session.activeFilter);
    const summary = this.repository.getSummary(session.userId);

    if (allItems.length === 0 && screenId === "notification-empty-state") {
      return buildNotificationEmptyStateScreen(session.navigation, session.generatedAt);
    }

    switch (screenId) {
      case "notification-home":
        return buildNotificationHomeScreen(summary, allItems, session.navigation, session.generatedAt);
      case "notification-list":
        return buildNotificationListScreen(
          groupNotificationsByDate(filtered, session.generatedAt),
          session.navigation,
          session.generatedAt
        );
      case "notification-detail": {
        const notification = session.activeNotificationId
          ? this.repository.getNotification(session.userId, session.activeNotificationId)
          : undefined;
        if (!notification) {
          return buildNotificationHomeScreen(summary, allItems, session.navigation, session.generatedAt);
        }
        return buildNotificationDetailScreen(notification, session.navigation, session.generatedAt);
      }
      case "notification-filters":
        return buildNotificationFiltersScreen(session.activeFilter, session.navigation, session.generatedAt);
      case "notification-settings":
        return buildNotificationSettingsScreen(session.navigation, session.generatedAt);
      case "notification-empty-state":
        return buildNotificationEmptyStateScreen(session.navigation, session.generatedAt);
      default:
        if (!isNotificationScreenId(screenId)) throw new Error(`Unknown screen: ${screenId}`);
        return buildNotificationHomeScreen(summary, allItems, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: NotificationSessionState, _reducedMotion?: boolean) {
    const allItems = this.repository.getNotifications(session.userId);
    const summary = this.repository.getSummary(session.userId);
    return {
      version: NOTIFICATION_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      active_notification_id: session.activeNotificationId,
      active_filter: session.activeFilter,
      screen: this.buildScreenForSession(session, session.currentScreen),
      navigation: session.navigation,
      summary,
      notification_count: allItems.length,
      flow: NOTIFICATION_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      last_refreshed_at: session.lastRefreshedAt,
      runtime_experience: true,
      read_only: true,
      delivery: false,
    };
  }
}

export interface NotificationExperienceModule {
  notificationExperience: NotificationExperienceService;
}

export function createNotificationExperienceModule(deps?: {
  repository?: NotificationRepository;
}): NotificationExperienceModule {
  return { notificationExperience: new NotificationExperienceService(deps) };
}

export function createNotificationExperienceService(deps?: {
  repository?: NotificationRepository;
}): NotificationExperienceService {
  return new NotificationExperienceService(deps);
}
