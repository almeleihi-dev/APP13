import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { ActionScreenId } from "../domain/action-screen.js";
import {
  ACTION_EXPERIENCE_FLOW,
  ACTION_EXPERIENCE_VERSION,
  ACTION_SCREEN_PROTOTYPE_MAP,
  isActionScreenId,
  type ActionRuntimeScreenView,
} from "../domain/action-screen.js";
import {
  createInitialActionSessionState,
  type ActionSessionState,
  type WaitingReason,
} from "../domain/action-state.js";
import type { ActionAction } from "../domain/action-actions.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  beginReturnTransition,
  completeReturnTransition,
} from "../application/action-navigation.js";
import {
  createActionReturnTransitionState,
  advanceActionReturnTransition,
  buildActionTransitionView,
  isReturnTransitionComplete,
} from "../application/action-transition.js";
import { buildActionHomeScreen } from "../presentation/action-home.js";
import { buildContractPreviewScreen } from "../presentation/contract-preview.js";
import { buildActiveActionScreen } from "../presentation/active-action.js";
import { buildProgressScreen } from "../presentation/progress-screen.js";
import { buildCompletionScreen } from "../presentation/completion-screen.js";
import { buildWaitingScreen } from "../presentation/waiting-screen.js";
import { buildTransitionScreen } from "../presentation/transition-screen.js";
import { createActionRepository, type ActionRepository } from "../infrastructure/action-repository.js";
import { validateActionExperience } from "../validation/action-experience-validator.js";

export class ActionExperienceService {
  private readonly repository: ActionRepository;
  private readonly sessions = new Map<string, ActionSessionState>();

  constructor(deps?: { repository?: ActionRepository }) {
    this.repository = deps?.repository ?? createActionRepository();
  }

  enterFromNeedTransition(
    authContext: AuthContext,
    input?: { generated_at?: string; need_handoff?: NeedRequestDraft }
  ) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const context = this.repository.applyNeedHandoff(authContext.userId, input?.need_handoff);
    const session = createInitialActionSessionState(authContext.userId, generatedAt);
    session.contract = { ...context.contract };
    session.milestones = [...context.milestones];
    session.completionPercentage = context.completionPercentage;
    session.remainingMinutes = context.remainingMinutes;
    session.currentStage = context.currentStage;
    session.needHandoff = input?.need_handoff;
    session.currentScreen = "action-home";
    session.mode = "action";
    this.sessions.set(authContext.userId, session);
    return this.toExperienceView(session);
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(
    authContext: AuthContext,
    screenId: ActionScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getScreen(authContext, "action-home", input);
  }

  getContract(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    session.currentScreen = "contract-preview";
    session.navigation = navigateToScreen(session.navigation, "contract-preview");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "contract-preview");
  }

  getActiveAction(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    session.currentScreen = "active-action";
    session.navigation = navigateToScreen(session.navigation, "active-action");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "active-action");
  }

  getProgress(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    session.currentScreen = "progress-screen";
    session.navigation = navigateToScreen(session.navigation, "progress-screen");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "progress-screen");
  }

  getCompletion(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    session.currentScreen = "completion-screen";
    session.navigation = navigateToScreen(session.navigation, "completion-screen");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "completion-screen");
  }

  getWaiting(authContext: AuthContext, input: { reason: WaitingReason; generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input.generated_at);
    this.repository.setWaiting(authContext.userId, input.reason);
    session.waitingReason = input.reason;
    session.currentScreen = "waiting-screen";
    session.navigation = navigateToScreen(session.navigation, "waiting-screen");
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "waiting-screen");
  }

  continueContract(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    const context = this.repository.activateContract(authContext.userId);
    session.contract = { ...context.contract };
    session.currentScreen = "active-action";
    session.navigation = navigateToScreen(session.navigation, "active-action");
    this.repository.startExecution(authContext.userId);
    this.syncFromRepository(session, authContext.userId);
    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, "active-action") };
  }

  completeAction(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    this.repository.completeAction(authContext.userId);
    this.syncFromRepository(session, authContext.userId);
    session.currentScreen = "completion-screen";
    session.navigation = navigateToScreen(session.navigation, "completion-screen");
    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, "completion-screen") };
  }

  startReturnTransition(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    session.transition = createActionReturnTransitionState();
    session.transition = advanceActionReturnTransition(session.transition, 0, 0);
    session.navigation = beginReturnTransition(session.navigation);
    session.currentScreen = "transition";
    session.mode = "transition";
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildActionTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      next_mode: "need",
    };
  }

  advanceTransition(authContext: AuthContext, input: { progress: number; generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.transition) {
      session.transition = createActionReturnTransitionState();
    }
    session.transition = advanceActionReturnTransition(session.transition, input.progress);
    if (isReturnTransitionComplete(session.transition)) {
      session.navigation = completeReturnTransition(session.navigation);
      session.mode = "need";
    }
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildActionTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      complete: isReturnTransitionComplete(session.transition),
      mode: session.mode,
    };
  }

  dispatchAction(authContext: AuthContext, action: ActionAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as ActionScreenId) ?? "action-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "contract-nav":
        return this.getContract(authContext, input);
      case "progress-nav":
        return this.getProgress(authContext, input);
      case "continue-contract":
        return this.continueContract(authContext, input);
      case "start-action":
        return this.continueContract(authContext, input);
      case "advance-progress":
        this.repository.advanceProgress(authContext.userId, action.milestoneId);
        this.syncFromRepository(session, authContext.userId);
        session.currentScreen = "progress-screen";
        break;
      case "complete-action":
        return this.completeAction(authContext, input);
      case "set-waiting":
        return this.getWaiting(authContext, { reason: action.reason, generated_at: input?.generated_at });
      case "start-return-transition":
        return this.startReturnTransition(authContext, input);
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
      version: ACTION_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      flow: ACTION_EXPERIENCE_FLOW,
      prototype_map: ACTION_SCREEN_PROTOTYPE_MAP,
    };
  }

  validateRuntime() {
    return validateActionExperience();
  }

  private getOrCreateSession(userId: string, generatedAt?: string): ActionSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    this.repository.applyNeedHandoff(userId);
    const session = createInitialActionSessionState(userId, at);
    this.syncFromRepository(session, userId);
    this.sessions.set(userId, session);
    return session;
  }

  private syncFromRepository(session: ActionSessionState, userId: string): void {
    const context = this.repository.getContext(userId);
    session.contract = { ...context.contract };
    session.milestones = [...context.milestones];
    session.completionPercentage = context.completionPercentage;
    session.remainingMinutes = context.remainingMinutes;
    session.currentStage = context.currentStage;
  }

  private buildScreenForSession(
    session: ActionSessionState,
    screenId: ActionScreenId,
    reducedMotion = false
  ): ActionRuntimeScreenView {
    const context = this.repository.getContext(session.userId);

    switch (screenId) {
      case "action-home":
        return buildActionHomeScreen(this.repository, session.userId, session.navigation, session.generatedAt);
      case "contract-preview":
        return buildContractPreviewScreen(context, session.navigation, session.generatedAt);
      case "active-action":
        return buildActiveActionScreen(context, session.navigation, session.generatedAt);
      case "progress-screen":
        return buildProgressScreen(context, session.navigation, session.generatedAt);
      case "completion-screen":
        return buildCompletionScreen(context, session.navigation, session.generatedAt);
      case "waiting-screen":
        return buildWaitingScreen(
          this.repository,
          session.userId,
          session.waitingReason ?? "customer",
          session.navigation,
          session.generatedAt
        );
      case "transition": {
        const transition = session.transition ?? createActionReturnTransitionState();
        return buildTransitionScreen(
          buildActionTransitionView(transition),
          session.navigation,
          session.generatedAt,
          reducedMotion
        );
      }
      default:
        if (!isActionScreenId(screenId)) {
          throw new Error(`Unknown screen: ${screenId}`);
        }
        return buildActionHomeScreen(this.repository, session.userId, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: ActionSessionState, reducedMotion?: boolean) {
    return {
      version: ACTION_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      mode: session.mode,
      screen: this.buildScreenForSession(session, session.currentScreen, reducedMotion),
      navigation: session.navigation,
      contract: session.contract,
      milestones: session.milestones,
      completion_percentage: session.completionPercentage,
      transition: session.transition ? buildActionTransitionView(session.transition) : undefined,
      flow: ACTION_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      runtime_experience: true,
    };
  }
}

export interface ActionExperienceModule {
  actionExperience: ActionExperienceService;
}

export function createActionExperienceModule(deps?: {
  repository?: ActionRepository;
}): ActionExperienceModule {
  return {
    actionExperience: new ActionExperienceService(deps),
  };
}

export function createActionExperienceService(deps?: { repository?: ActionRepository }): ActionExperienceService {
  return new ActionExperienceService(deps);
}
