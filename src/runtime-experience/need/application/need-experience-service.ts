import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { NeedScreenId } from "../domain/need-screen.js";
import {
  NEED_EXPERIENCE_FLOW,
  NEED_EXPERIENCE_VERSION,
  NEED_SCREEN_PROTOTYPE_MAP,
  isNeedScreenId,
  type NeedRuntimeScreenView,
} from "../domain/need-screen.js";
import {
  createInitialNeedSessionState,
  createInitialRequestDraft,
  type NeedSessionState,
} from "../domain/need-state.js";
import type { NeedAction } from "../domain/need-actions.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  beginNeedTransition,
  completeNeedTransition,
} from "../application/need-navigation.js";
import {
  createNeedTransitionState,
  advanceNeedTransition,
  buildNeedTransitionView,
  isTransitionComplete,
} from "../application/need-transition.js";
import { buildNeedHomeScreen } from "../presentation/need-home.js";
import { buildSearchScreen } from "../presentation/search-screen.js";
import { buildOpportunityListScreen } from "../presentation/opportunity-list.js";
import { buildRequestScreen } from "../presentation/request-screen.js";
import { buildTransitionScreen } from "../presentation/empty-state.js";
import { createNeedRepository, type NeedRepository } from "../infrastructure/need-repository.js";
import { validateNeedExperience } from "../validation/need-experience-validator.js";

export class NeedExperienceService {
  private readonly repository: NeedRepository;
  private readonly sessions = new Map<string, NeedSessionState>();

  constructor(deps?: { repository?: NeedRepository }) {
    this.repository = deps?.repository ?? createNeedRepository();
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(authContext: AuthContext, screenId: NeedScreenId, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getScreen(authContext, "need-home", input);
  }

  getSearch(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getScreen(authContext, "search", input);
  }

  getOpportunities(authContext: AuthContext, input?: { generated_at?: string; keyword?: string; category?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (input?.keyword || input?.category) {
      session.search = this.repository.buildSearchState(authContext.userId, {
        keyword: input.keyword ?? session.search.keyword,
        category: input.category ?? session.search.category,
        hasResults: this.repository.getOpportunities({ keyword: input.keyword, category: input.category }).length > 0,
      });
    }
    session.currentScreen = "opportunity-list";
    session.navigation = navigateToScreen(session.navigation, "opportunity-list");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "opportunity-list");
  }

  getRequest(authContext: AuthContext, input?: { generated_at?: string; opportunity_id?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (input?.opportunity_id) {
      const opp = this.repository.getOpportunity(input.opportunity_id);
      if (opp) {
        session.selectedOpportunityId = opp.id;
        session.requestDraft = {
          ...session.requestDraft,
          opportunityId: opp.id,
          actionSummary: opp.title,
          estimatedCost: opp.estimatedCostSar,
        };
        this.repository.recordActivity(authContext.userId, {
          id: `act-view-${Date.now()}`,
          title: `Viewed ${opp.title}`,
          summary: "Opportunity selected for request",
          recordedAt: session.generatedAt,
          type: "view",
        });
      }
    }
    session.currentScreen = "request";
    session.navigation = navigateToScreen(session.navigation, "request");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "request");
  }

  getTransition(authContext: AuthContext, input?: { generated_at?: string; progress?: number }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.transition) {
      session.transition = createNeedTransitionState();
      session.navigation = beginNeedTransition(session.navigation);
    }
    if (input?.progress !== undefined) {
      session.transition = advanceNeedTransition(session.transition, input.progress);
    }
    session.currentScreen = "transition";
    session.mode = "transition";
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "transition");
  }

  performSearch(
    authContext: AuthContext,
    input: { keyword: string; category?: string; generated_at?: string }
  ) {
    requireAuth(authContext);
    const generatedAt = input.generated_at ?? new Date().toISOString();
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    const keyword = input.keyword.trim();
    if (keyword) {
      this.repository.recordSearch(authContext.userId, keyword, generatedAt);
    }
    const opportunities = this.repository.getOpportunities({ keyword, category: input.category });
    session.search = this.repository.buildSearchState(authContext.userId, {
      keyword,
      category: input.category,
      loading: false,
      hasResults: opportunities.length > 0,
    });
    session.currentScreen = opportunities.length > 0 ? "opportunity-list" : "search";
    session.navigation = navigateToScreen(
      session.navigation,
      opportunities.length > 0 ? "opportunity-list" : "search"
    );
    session.generatedAt = generatedAt;
    this.sessions.set(authContext.userId, session);
    return {
      search: session.search,
      screen: this.buildScreenForSession(
        session,
        opportunities.length > 0 ? "opportunity-list" : "search"
      ),
      opportunity_count: opportunities.length,
    };
  }

  continueRequest(authContext: AuthContext, input?: {
    generated_at?: string;
    location?: string;
    schedule?: string;
    notes?: string;
  }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (input?.location) {
      session.requestDraft = { ...session.requestDraft, location: input.location };
    }
    if (input?.schedule) {
      session.requestDraft = { ...session.requestDraft, schedule: input.schedule };
    }
    if (input?.notes !== undefined) {
      session.requestDraft = { ...session.requestDraft, notes: input.notes };
    }
    if (!session.requestDraft.location || !session.requestDraft.schedule) {
      throw new Error("Location and schedule are required before continuing");
    }
    this.repository.saveRequestDraft(authContext.userId, session.requestDraft);
    this.repository.recordActivity(authContext.userId, {
      id: `act-request-${Date.now()}`,
      title: session.requestDraft.actionSummary || "Request submitted",
      summary: "Request continued to official transition",
      recordedAt: session.generatedAt,
      type: "request",
    });
    session.transition = createNeedTransitionState();
    session.transition = advanceNeedTransition(session.transition, 0, 0);
    session.navigation = beginNeedTransition(session.navigation);
    session.currentScreen = "transition";
    session.mode = "transition";
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildNeedTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      next_mode: "action",
    };
  }

  advanceTransition(authContext: AuthContext, input: { progress: number; generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.transition) {
      session.transition = createNeedTransitionState();
    }
    session.transition = advanceNeedTransition(session.transition, input.progress);
    if (isTransitionComplete(session.transition)) {
      session.navigation = completeNeedTransition(session.navigation);
      session.mode = "action";
    }
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildNeedTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      complete: isTransitionComplete(session.transition),
      mode: session.mode,
    };
  }

  dispatchAction(authContext: AuthContext, action: NeedAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as NeedScreenId) ?? "need-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "search":
        return this.performSearch(authContext, {
          keyword: action.keyword,
          category: action.category,
          generated_at: input?.generated_at,
        });
      case "filter-category":
        session.search = { ...session.search, category: action.category };
        break;
      case "select-opportunity":
        return this.getRequest(authContext, {
          generated_at: input?.generated_at,
          opportunity_id: action.opportunityId,
        });
      case "update-request":
        session.requestDraft = { ...session.requestDraft, ...action.fields };
        this.repository.saveRequestDraft(authContext.userId, session.requestDraft);
        break;
      case "continue-request":
        return this.continueRequest(authContext, input);
      case "start-transition":
        return this.continueRequest(authContext, input);
      case "advance-transition":
        return this.advanceTransition(authContext, {
          progress: action.progress,
          generated_at: input?.generated_at,
        });
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen) };
  }

  getFlow() {
    return {
      version: NEED_EXPERIENCE_VERSION,
      flow: NEED_EXPERIENCE_FLOW,
      prototype_map: NEED_SCREEN_PROTOTYPE_MAP,
    };
  }

  validateRuntime() {
    return validateNeedExperience();
  }

  private getOrCreateSession(userId: string, generatedAt?: string): NeedSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    const session = createInitialNeedSessionState(userId, at);
    session.search = this.repository.buildSearchState(userId);
    session.requestDraft = createInitialRequestDraft();
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: NeedSessionState,
    screenId: NeedScreenId,
    reducedMotion = false
  ): NeedRuntimeScreenView {
    switch (screenId) {
      case "need-home":
        return buildNeedHomeScreen(this.repository, session.userId, session.navigation, session.generatedAt);
      case "search":
        return buildSearchScreen(
          this.repository,
          session.userId,
          session.search,
          session.navigation,
          session.generatedAt
        );
      case "opportunity-list": {
        const opportunities = this.repository.getOpportunities({
          keyword: session.search.keyword,
          category: session.search.category,
        });
        return buildOpportunityListScreen(opportunities, session.navigation, session.generatedAt);
      }
      case "request": {
        const opportunity = session.selectedOpportunityId
          ? this.repository.getOpportunity(session.selectedOpportunityId)
          : undefined;
        return buildRequestScreen(session.requestDraft, opportunity, session.navigation, session.generatedAt);
      }
      case "transition": {
        const transition = session.transition ?? createNeedTransitionState();
        return buildTransitionScreen(
          buildNeedTransitionView(transition, reducedMotion),
          session.navigation,
          session.generatedAt,
          reducedMotion
        );
      }
      case "empty-state":
        return buildSearchScreen(
          this.repository,
          session.userId,
          { ...session.search, hasResults: false, keyword: session.search.keyword || " " },
          session.navigation,
          session.generatedAt
        );
      default:
        if (!isNeedScreenId(screenId)) {
          throw new Error(`Unknown screen: ${screenId}`);
        }
        return buildNeedHomeScreen(this.repository, session.userId, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: NeedSessionState, reducedMotion?: boolean) {
    return {
      version: NEED_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      mode: session.mode,
      screen: this.buildScreenForSession(session, session.currentScreen, reducedMotion),
      navigation: session.navigation,
      search: session.search,
      request_draft: session.requestDraft,
      transition: session.transition ? buildNeedTransitionView(session.transition, reducedMotion) : undefined,
      flow: NEED_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      runtime_experience: true,
    };
  }
}

export interface NeedExperienceModule {
  needExperience: NeedExperienceService;
}

export function createNeedExperienceModule(deps?: {
  repository?: NeedRepository;
}): NeedExperienceModule {
  return {
    needExperience: new NeedExperienceService(deps),
  };
}

export function createNeedExperienceService(deps?: { repository?: NeedRepository }): NeedExperienceService {
  return new NeedExperienceService(deps);
}
