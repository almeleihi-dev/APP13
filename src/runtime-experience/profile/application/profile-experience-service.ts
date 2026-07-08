import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { ProfileScreenId, ProfileRuntimeScreenView } from "../domain/profile-screen.js";
import {
  PROFILE_EXPERIENCE_FLOW,
  PROFILE_EXPERIENCE_VERSION,
  PROFILE_SCREEN_PROTOTYPE_MAP,
  isProfileScreenId,
} from "../domain/profile-screen.js";
import { createProfileSessionState, type ProfileSessionState } from "../domain/profile-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
} from "./profile-navigation.js";
import { buildProfileHomeScreen } from "../presentation/profile-home.js";
import { buildProfileIdentityScreen } from "../presentation/profile-identity.js";
import { buildProfileLiveFrameScreen } from "../presentation/profile-live-frame.js";
import { buildProfileAchievementsScreen } from "../presentation/profile-achievements.js";
import { buildProfileAnalyticsScreen } from "../presentation/profile-analytics.js";
import { buildProfileHistoryScreen } from "../presentation/profile-history.js";
import { buildProfileSettingsScreen } from "../presentation/profile-settings.js";
import { buildProfileEmptyStateScreen } from "../presentation/profile-empty-state.js";
import { ProfileRepository, createProfileRepository } from "../infrastructure/profile-repository.js";
import { validateProfileExperience } from "../validation/profile-experience-validator.js";

export type ProfileAction =
  | { type: "navigate"; targetScreen: ProfileScreenId }
  | { type: "back" }
  | { type: "bottom-nav"; itemId: string }
  | { type: "return-need-home" }
  | { type: "return-action-home" }
  | { type: "return-timeline" }
  | { type: "return-notifications" };

export class ProfileExperienceService {
  private readonly repository: ProfileRepository;
  private readonly sessions = new Map<string, ProfileSessionState>();

  constructor(deps?: { repository?: ProfileRepository }) {
    this.repository = deps?.repository ?? createProfileRepository();
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(
    authContext: AuthContext,
    screenId: ProfileScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-home", input?.generated_at);
  }

  getIdentity(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-identity", input?.generated_at);
  }

  getLiveFrame(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-live-frame", input?.generated_at);
  }

  getAchievements(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-achievements", input?.generated_at);
  }

  getAnalytics(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-analytics", input?.generated_at);
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-history", input?.generated_at);
  }

  getSettings(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "profile-settings", input?.generated_at);
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
      persistence: false,
      profile_id: this.repository.getProfile(authContext.userId).id,
      screen: this.buildScreenForSession(session, session.currentScreen),
    };
  }

  dispatchAction(authContext: AuthContext, action: ProfileAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as ProfileScreenId) ?? "profile-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "return-need-home":
        return { return_route: "/need/home", current_screen: session.currentScreen, read_only: true };
      case "return-action-home":
        return { return_route: "/action/home", current_screen: session.currentScreen, read_only: true };
      case "return-timeline":
        return { return_route: "/timeline/home", current_screen: session.currentScreen, read_only: true };
      case "return-notifications":
        return { return_route: "/notification/home", current_screen: session.currentScreen, read_only: true };
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen), read_only: true };
  }

  getFlow() {
    return {
      version: PROFILE_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      flow: PROFILE_EXPERIENCE_FLOW,
      prototype_map: PROFILE_SCREEN_PROTOTYPE_MAP,
      read_only: true,
      persistence: false,
    };
  }

  validateRuntime() {
    return validateProfileExperience();
  }

  private navigateTo(authContext: AuthContext, screenId: ProfileScreenId, generatedAt?: string) {
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    session.currentScreen = screenId;
    session.navigation = navigateToScreen(session.navigation, screenId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, screenId);
  }

  private getOrCreateSession(userId: string, generatedAt?: string): ProfileSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    const session = createProfileSessionState(userId, at);
    this.repository.getProfile(userId);
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: ProfileSessionState,
    screenId: ProfileScreenId,
    _reducedMotion = false
  ): ProfileRuntimeScreenView {
    if (!this.repository.hasProfile(session.userId) && screenId === "profile-empty-state") {
      return buildProfileEmptyStateScreen(session.navigation, session.generatedAt);
    }

    const summary = this.repository.getProfile(session.userId);

    switch (screenId) {
      case "profile-home":
        return buildProfileHomeScreen(summary, session.navigation, session.generatedAt);
      case "profile-identity":
        return buildProfileIdentityScreen(summary, session.navigation, session.generatedAt);
      case "profile-live-frame":
        return buildProfileLiveFrameScreen(summary, session.navigation, session.generatedAt);
      case "profile-achievements":
        return buildProfileAchievementsScreen(summary, session.navigation, session.generatedAt);
      case "profile-analytics":
        return buildProfileAnalyticsScreen(summary, session.navigation, session.generatedAt);
      case "profile-history":
        return buildProfileHistoryScreen(summary, session.navigation, session.generatedAt);
      case "profile-settings":
        return buildProfileSettingsScreen(session.navigation, session.generatedAt);
      case "profile-empty-state":
        return buildProfileEmptyStateScreen(session.navigation, session.generatedAt);
      default:
        if (!isProfileScreenId(screenId)) throw new Error(`Unknown screen: ${screenId}`);
        return buildProfileHomeScreen(summary, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: ProfileSessionState, _reducedMotion?: boolean) {
    const summary = this.repository.getProfile(session.userId);
    return {
      version: PROFILE_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      screen: this.buildScreenForSession(session, session.currentScreen),
      navigation: session.navigation,
      summary: {
        id: summary.id,
        displayName: summary.displayName,
        liveFrame: summary.liveFrame,
        professionalScore: summary.professionalScore,
        trustScore: summary.trustScore,
        completionScore: summary.completionScore,
        confidence: summary.confidence,
      },
      flow: PROFILE_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      last_refreshed_at: session.lastRefreshedAt,
      runtime_experience: true,
      read_only: true,
      persistence: false,
    };
  }
}

export interface ProfileExperienceModule {
  profileExperience: ProfileExperienceService;
}

export function createProfileExperienceModule(deps?: { repository?: ProfileRepository }): ProfileExperienceModule {
  return { profileExperience: new ProfileExperienceService(deps) };
}

export function createProfileExperienceService(deps?: { repository?: ProfileRepository }): ProfileExperienceService {
  return new ProfileExperienceService(deps);
}
