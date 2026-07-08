import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import { RUNTIME_STATE_VERSION } from "../domain/runtime-state.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import {
  RuntimeStateRepository,
  createRuntimeStateRepository,
} from "../infrastructure/runtime-state-repository.js";
import { SessionManager, createSessionManager } from "./session-manager.js";
import { ContextManager, createContextManager } from "./context-manager.js";
import { LifecycleManager, createLifecycleManager } from "./lifecycle-manager.js";
import { validateRuntimeState } from "../validation/runtime-state-validator.js";
import { buildRuntimeStateSummary } from "../presentation/runtime-state-summary.js";
import { buildSessionInspector } from "../presentation/session-inspector.js";
import { buildLifecycleViewPresentation } from "../presentation/lifecycle-view.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export interface RuntimeStateUpdateInput {
  generated_at?: string;
  action?: "next" | "back";
}

export interface RuntimeStateTransitionInput {
  generated_at?: string;
}

export class RuntimeStateService {
  private readonly repository: RuntimeStateRepository;
  private readonly sessionManager: SessionManager;
  private readonly contextManager: ContextManager;
  private readonly lifecycleManager: LifecycleManager;

  constructor(private readonly runtimeJourney: RuntimeJourneyService, repository?: RuntimeStateRepository) {
    this.repository = repository ?? createRuntimeStateRepository();
    this.sessionManager = createSessionManager(this.repository);
    this.contextManager = createContextManager();
    this.lifecycleManager = createLifecycleManager();
  }

  getState(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.sessionManager.getSession(
      authContext.userId,
      input?.generated_at ?? new Date().toISOString()
    );
    return this.toStateView(session);
  }

  getSession(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.sessionManager.getSession(
      authContext.userId,
      input?.generated_at ?? new Date().toISOString()
    );
    return {
      session_id: session.sessionId,
      journey_session_id: session.journeySessionId,
      user_id: session.userId,
      state: session.state,
      inspector: buildSessionInspector(session),
      generated_at: session.generatedAt,
    };
  }

  getHistory(authContext: AuthContext) {
    requireAuth(authContext);
    return {
      history: this.repository.getHistory(authContext.userId),
      authoritative: true,
    };
  }

  getContext(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.sessionManager.getSession(
      authContext.userId,
      input?.generated_at ?? new Date().toISOString()
    );
    return {
      context: this.contextManager.extractContext(session),
      active_contract: this.contextManager.extractActiveContract(session),
      active_conversation: this.contextManager.extractActiveConversation(session),
      active_timeline: this.contextManager.extractActiveTimeline(session),
      active_notification: this.contextManager.extractActiveNotification(session),
      active_profile: this.contextManager.extractActiveProfile(session),
      transition_progress: this.contextManager.extractTransitionProgress(session),
      return_destination: this.contextManager.extractReturnDestination(session),
      generated_at: session.generatedAt,
    };
  }

  getPhase(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.sessionManager.getSession(
      authContext.userId,
      input?.generated_at ?? new Date().toISOString()
    );
    const lifecycle = this.lifecycleManager.buildLifecycleView(session);
    return {
      ...lifecycle,
      presentation: buildLifecycleViewPresentation(session, lifecycle),
      generated_at: session.generatedAt,
    };
  }

  start(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    this.sessionManager.resetSession(authContext.userId, generatedAt);
    const journeyView = this.runtimeJourney.start(authContext, { generated_at: generatedAt });
    const session = this.sessionManager.getSession(authContext.userId, generatedAt);
    this.sessionManager.syncFromJourney(session, this.toJourneySnapshot(journeyView));
    return this.toStateView(this.sessionManager.getSession(authContext.userId, generatedAt), journeyView);
  }

  update(authContext: AuthContext, input?: RuntimeStateUpdateInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const journeyView =
      input?.action === "back"
        ? this.runtimeJourney.back(authContext, { generated_at: generatedAt })
        : this.runtimeJourney.next(authContext, { generated_at: generatedAt });
    const session = this.sessionManager.getSession(authContext.userId, generatedAt);
    this.sessionManager.syncFromJourney(session, this.toJourneySnapshot(journeyView));
    return this.toStateView(this.sessionManager.getSession(authContext.userId, generatedAt), journeyView);
  }

  transition(authContext: AuthContext, input?: RuntimeStateTransitionInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const session = this.sessionManager.getSession(authContext.userId, generatedAt);
    const phase = this.lifecycleManager.getPhase(session);
    const journeyView =
      phase === "return-transition"
        ? this.runtimeJourney.next(authContext, { generated_at: generatedAt })
        : this.runtimeJourney.next(authContext, { generated_at: generatedAt });
    this.sessionManager.syncFromJourney(session, this.toJourneySnapshot(journeyView));
    return this.toStateView(this.sessionManager.getSession(authContext.userId, generatedAt), journeyView);
  }

  finish(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const journeyView = this.runtimeJourney.finish(authContext, { generated_at: generatedAt });
    const session = this.sessionManager.getSession(authContext.userId, generatedAt);
    this.sessionManager.syncFromJourney(session, this.toJourneySnapshot(journeyView));
    return this.toStateView(this.sessionManager.getSession(authContext.userId, generatedAt), journeyView);
  }

  reset(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.start(authContext, input);
  }

  validateRuntime() {
    return validateRuntimeState();
  }

  private toJourneySnapshot(journeyView: {
    current_step: RuntimeStepId;
    active_screen_id?: string;
    active_route?: string;
    active_experience?: string;
    lifecycle_phase?: string;
    finished?: boolean;
    handoff?: {
      needRequest?: NeedRequestDraft;
      contractId?: string;
      actionId?: string;
      conversationId?: string;
    };
    return_context?: { returnRoute?: string; completed?: boolean };
    generated_at?: string;
    session_id?: string;
  }) {
    return {
      current_step: journeyView.current_step,
      active_screen_id: journeyView.active_screen_id,
      active_route: journeyView.active_route,
      active_experience: journeyView.active_experience,
      lifecycle_phase: journeyView.lifecycle_phase,
      finished: journeyView.finished,
      handoff: journeyView.handoff,
      return_context: journeyView.return_context,
      generated_at: journeyView.generated_at,
      session_id: journeyView.session_id,
    };
  }

  private toStateView(
    session: ReturnType<SessionManager["getSession"]>,
    journeyView?: ReturnType<RuntimeJourneyService["start"]>
  ) {
    return {
      version: RUNTIME_STATE_VERSION,
      runtime_journey_version: RUNTIME_JOURNEY_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      profile_experience_version: PROFILE_EXPERIENCE_VERSION,
      session_id: session.sessionId,
      journey_session_id: session.journeySessionId,
      current_screen: session.state.currentScreen,
      previous_screen: session.state.previousScreen,
      current_step_id: session.state.currentStepId,
      current_mode: session.state.currentMode,
      navigation_stack: session.state.navigationStack,
      runtime_phase: session.state.runtimePhase,
      context: session.state.context,
      transition_progress: session.state.transitionProgress,
      return_destination: session.state.returnDestination,
      launch_timestamp: session.state.launchTimestamp,
      last_activity_timestamp: session.state.lastActivityTimestamp,
      finished: session.state.finished,
      history_count: session.history.length,
      summary: buildRuntimeStateSummary(session),
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        supportsKeyboardNavigation: NAVIGATION_ACCESSIBILITY_SPEC.keyboardNavigation.tabOrderFollowsLayout,
        supportsScreenReader: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.announceTransitionStages,
      },
      journey_step: journeyView?.current_step,
      generated_at: session.generatedAt,
      runtime_state: true,
      authoritative: true,
      read_only: true,
      deterministic: true,
    };
  }
}

export function createRuntimeStateService(
  runtimeJourney: RuntimeJourneyService,
  repository?: RuntimeStateRepository
) {
  return new RuntimeStateService(runtimeJourney, repository);
}
