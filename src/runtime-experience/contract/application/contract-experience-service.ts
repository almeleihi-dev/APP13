import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { ContractScreenId, ContractSectionId } from "../domain/contract-screen.js";
import {
  CONTRACT_EXPERIENCE_FLOW,
  CONTRACT_EXPERIENCE_VERSION,
  CONTRACT_SCREEN_PROTOTYPE_MAP,
  isContractScreenId,
  type ContractRuntimeScreenView,
} from "../domain/contract-screen.js";
import {
  createContractSessionState,
  markSectionVisited,
  type ContractSessionState,
} from "../domain/contract-state.js";
import type { ContractAction } from "../domain/contract-actions.js";
import { CONTRACT_SECTION_SCREEN_MAP } from "../domain/contract-actions.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToSection,
  beginContractTransition,
  completeContractTransition,
} from "../application/contract-navigation.js";
import {
  createContractTransitionState,
  advanceContractTransition,
  buildContractTransitionView,
  isContractTransitionComplete,
} from "../application/contract-transition.js";
import { reviewContractReadiness } from "../application/contract-review.js";
import { buildContractHomeScreen } from "../presentation/contract-home.js";
import { buildContractReviewScreen } from "../presentation/contract-review-screen.js";
import { buildContractPartiesScreen } from "../presentation/contract-parties.js";
import { buildContractTermsScreen } from "../presentation/contract-terms.js";
import { buildContractTimelineScreen } from "../presentation/contract-timeline.js";
import { buildContractCostScreen } from "../presentation/contract-cost.js";
import {
  buildContractConfirmationScreen,
} from "../presentation/contract-confirmation.js";
import { buildContractStatusScreen } from "../presentation/contract-status.js";
import {
  buildContractEmptyStateScreen,
  buildContractTransitionScreen,
} from "../presentation/contract-empty-state.js";
import { createContractRepository, type ContractRepository } from "../infrastructure/contract-repository.js";
import { validateContractExperience } from "../validation/contract-experience-validator.js";

const SECTION_FOR_SCREEN: Partial<Record<ContractScreenId, ContractSectionId>> = {
  "contract-review": "review",
  parties: "parties",
  terms: "terms",
  timeline: "timeline",
  cost: "cost",
  confirmation: "confirmation",
  status: "status",
};

export class ContractExperienceService {
  private readonly repository: ContractRepository;
  private readonly sessions = new Map<string, ContractSessionState>();

  constructor(deps?: { repository?: ContractRepository }) {
    this.repository = deps?.repository ?? createContractRepository();
  }

  enterFromActionPreview(
    authContext: AuthContext,
    input?: { generated_at?: string; need_handoff?: NeedRequestDraft }
  ) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const summary = this.repository.applyHandoffs(authContext.userId, input?.need_handoff);
    const session = createContractSessionState(authContext.userId, generatedAt);
    session.summary = summary;
    session.needHandoff = input?.need_handoff;
    session.currentScreen = "contract-home";
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
    screenId: ContractScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getScreen(authContext, "contract-home", input);
  }

  getReview(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "contract-review", "review", input?.generated_at);
  }

  getParties(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "parties", "parties", input?.generated_at);
  }

  getTerms(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "terms", "terms", input?.generated_at);
  }

  getTimeline(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "timeline", "timeline", input?.generated_at);
  }

  getCost(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "cost", "cost", input?.generated_at);
  }

  getConfirmation(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "confirmation", "confirmation", input?.generated_at);
  }

  getStatus(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "status", "status", input?.generated_at);
  }

  confirmContract(authContext: AuthContext, input: { confirmed: boolean; generated_at?: string }) {
    requireAuth(authContext);
    if (!input.confirmed) {
      throw new Error("Contract confirmation requires explicit user consent");
    }
    const session = this.getOrCreateSession(authContext.userId, input.generated_at);
    const review = reviewContractReadiness(session.summary, session.visitedSections);
    if (!review.readyForConfirmation) {
      throw new Error("Complete all contract sections before confirming");
    }
    session.summary = this.repository.setUserConfirmed(authContext.userId, true);
    session.summary.nextRequiredStep = "Continue to active action";
    session.visitedSections = markSectionVisited(session.visitedSections, "confirmation");
    session.currentScreen = "status";
    session.navigation = navigateToScreen(session.navigation, "status");
    this.sessions.set(authContext.userId, session);
    return {
      confirmed: true,
      automatic: false,
      screen: this.buildScreenForSession(session, "status"),
    };
  }

  startTransition(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.summary.userConfirmed || session.summary.status !== "confirmed") {
      throw new Error("Contract must be user-confirmed before transition to active action");
    }
    session.transition = createContractTransitionState();
    session.transition = advanceContractTransition(session.transition, 0, 0);
    session.navigation = beginContractTransition(session.navigation);
    session.currentScreen = "transition";
    session.mode = "transition";
    session.summary = this.repository.activateContract(authContext.userId);
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildContractTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      next_route: "/action/active",
    };
  }

  advanceTransition(authContext: AuthContext, input: { progress: number; generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.transition) session.transition = createContractTransitionState();
    session.transition = advanceContractTransition(session.transition, input.progress);
    if (isContractTransitionComplete(session.transition)) {
      session.navigation = completeContractTransition(session.navigation);
      session.mode = "action";
      session.summary.status = "active";
    }
    this.sessions.set(authContext.userId, session);
    return {
      transition: buildContractTransitionView(session.transition),
      screen: this.buildScreenForSession(session, "transition"),
      complete: isContractTransitionComplete(session.transition),
      next_route: "/action/active",
    };
  }

  dispatchAction(authContext: AuthContext, action: ContractAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        this.markVisitedForScreen(session, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as ContractScreenId) ?? "contract-home";
        break;
      case "section-nav":
        session.navigation = navigateToSection(session.navigation, action.sectionId);
        session.currentScreen = CONTRACT_SECTION_SCREEN_MAP[action.sectionId];
        session.visitedSections = markSectionVisited(session.visitedSections, action.sectionId);
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        this.markVisitedForScreen(session, result.screenId);
        break;
      }
      case "continue-review":
        this.repository.advanceToReviewing(authContext.userId);
        session.summary = this.repository.getOrCreate(authContext.userId);
        return this.getParties(authContext, input);
      case "continue-parties":
        return this.getTerms(authContext, input);
      case "continue-terms":
        return this.getTimeline(authContext, input);
      case "continue-timeline":
        return this.getCost(authContext, input);
      case "continue-cost":
        return this.getConfirmation(authContext, input);
      case "confirm-contract":
        return this.confirmContract(authContext, { confirmed: action.confirmed, generated_at: input?.generated_at });
      case "start-transition":
        return this.startTransition(authContext, input);
      case "advance-transition":
        return this.advanceTransition(authContext, { progress: action.progress, generated_at: input?.generated_at });
      case "return-action-home":
        return { return_route: "/action/home", current_screen: session.currentScreen };
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen) };
  }

  getFlow() {
    return {
      version: CONTRACT_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      flow: CONTRACT_EXPERIENCE_FLOW,
      prototype_map: CONTRACT_SCREEN_PROTOTYPE_MAP,
    };
  }

  validateRuntime() {
    return validateContractExperience();
  }

  private navigateTo(
    authContext: AuthContext,
    screenId: ContractScreenId,
    sectionId: ContractSectionId,
    generatedAt?: string
  ) {
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    session.currentScreen = screenId;
    session.navigation = navigateToScreen(session.navigation, screenId);
    session.visitedSections = markSectionVisited(session.visitedSections, sectionId);
    if (sectionId === "review") {
      session.summary = this.repository.advanceToReviewing(authContext.userId);
    }
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, screenId);
  }

  private markVisitedForScreen(session: ContractSessionState, screenId: ContractScreenId): void {
    const section = SECTION_FOR_SCREEN[screenId];
    if (section) session.visitedSections = markSectionVisited(session.visitedSections, section);
  }

  private getOrCreateSession(userId: string, generatedAt?: string): ContractSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      existing.summary = this.repository.getOrCreate(userId);
      return existing;
    }
    this.repository.applyHandoffs(userId);
    const session = createContractSessionState(userId, at);
    session.summary = this.repository.getOrCreate(userId);
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: ContractSessionState,
    screenId: ContractScreenId,
    reducedMotion = false
  ): ContractRuntimeScreenView {
    const summary = session.summary;
    const review = reviewContractReadiness(summary, session.visitedSections);

    switch (screenId) {
      case "contract-home":
        return buildContractHomeScreen(summary, session.navigation, session.generatedAt);
      case "contract-review":
        return buildContractReviewScreen(summary, session.navigation, session.generatedAt);
      case "parties":
        return buildContractPartiesScreen(summary, session.navigation, session.generatedAt);
      case "terms":
        return buildContractTermsScreen(summary, session.navigation, session.generatedAt);
      case "timeline":
        return buildContractTimelineScreen(summary, session.navigation, session.generatedAt);
      case "cost":
        return buildContractCostScreen(summary, session.navigation, session.generatedAt);
      case "confirmation":
        return buildContractConfirmationScreen(summary, review, session.navigation, session.generatedAt);
      case "status":
        return buildContractStatusScreen(summary, session.navigation, session.generatedAt);
      case "empty-state":
        return buildContractEmptyStateScreen(session.navigation, session.generatedAt, {
          title: "No contract available",
          message: "Contract data is not available. Return to action home to begin.",
          actionLabel: "Return to Action Home",
        });
      case "transition": {
        const transition = session.transition ?? createContractTransitionState();
        return buildContractTransitionScreen(
          buildContractTransitionView(transition),
          session.navigation,
          session.generatedAt,
          reducedMotion
        );
      }
      default:
        if (!isContractScreenId(screenId)) throw new Error(`Unknown screen: ${screenId}`);
        return buildContractHomeScreen(summary, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: ContractSessionState, reducedMotion?: boolean) {
    const review = reviewContractReadiness(session.summary, session.visitedSections);
    return {
      version: CONTRACT_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      mode: session.mode,
      screen: this.buildScreenForSession(session, session.currentScreen, reducedMotion),
      navigation: session.navigation,
      summary: session.summary,
      visited_sections: session.visitedSections,
      review,
      transition: session.transition ? buildContractTransitionView(session.transition) : undefined,
      flow: CONTRACT_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      runtime_experience: true,
    };
  }
}

export interface ContractExperienceModule {
  contractExperience: ContractExperienceService;
}

export function createContractExperienceModule(deps?: {
  repository?: ContractRepository;
}): ContractExperienceModule {
  return { contractExperience: new ContractExperienceService(deps) };
}

export function createContractExperienceService(deps?: {
  repository?: ContractRepository;
}): ContractExperienceService {
  return new ContractExperienceService(deps);
}
