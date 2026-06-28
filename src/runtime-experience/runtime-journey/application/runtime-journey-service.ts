import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import { RUNTIME_JOURNEY_VERSION, buildRuntimeJourneyDefinition } from "../domain/runtime-journey.js";
import {
  RUNTIME_JOURNEY_STEPS,
  getRuntimeStepByIndex,
  type RuntimeStepId,
} from "../domain/runtime-step.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import {
  RuntimeOrchestrator,
  type RuntimeExperienceDeps,
} from "./runtime-orchestrator.js";
import {
  buildRuntimeJourneyNavigation,
  buildRuntimeNavigationAccessibility,
} from "./runtime-navigation.js";
import { buildRuntimeJourneyPresentation } from "../presentation/runtime-builder.js";
import {
  RuntimeJourneyRepository,
  createRuntimeJourneyRepository,
} from "../infrastructure/runtime-journey-repository.js";
import { validateRuntimeJourney } from "../validation/runtime-journey-validator.js";
import { updateSessionHandoff } from "../domain/runtime-session.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

const DEFAULT_NEED_HANDOFF: NeedRequestDraft = {
  opportunityId: "opp-journey-001",
  actionSummary: "Panel Upgrade",
  location: "Riyadh",
  schedule: "Mon 10:00",
  notes: "Runtime journey handoff",
  estimatedCost: 900,
};

export class RuntimeJourneyService {
  private readonly repository: RuntimeJourneyRepository;
  private readonly orchestrator: RuntimeOrchestrator;
  private readonly experienceDeps: RuntimeExperienceDeps;

  constructor(deps: RuntimeExperienceDeps & { repository?: RuntimeJourneyRepository }) {
    this.repository = deps.repository ?? createRuntimeJourneyRepository();
    this.experienceDeps = deps;
    this.orchestrator = new RuntimeOrchestrator(deps);
  }

  getJourney(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.repository.getSession(authContext.userId, input?.generated_at ?? new Date().toISOString());
    return this.toJourneyView(session);
  }

  launch(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.start(authContext, input);
  }

  getCurrent(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.repository.getSession(authContext.userId, input?.generated_at ?? new Date().toISOString());
    const result = this.orchestrator.resolveStep(
      authContext,
      session,
      session.state.currentStepId,
      session.generatedAt
    );
    return {
      ...this.toJourneyView(session),
      active: result,
    };
  }

  getSession(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.repository.getSession(authContext.userId, input?.generated_at ?? new Date().toISOString());
    return {
      session_id: session.sessionId,
      user_id: session.userId,
      state: session.state,
      history: session.history,
      presentation: buildRuntimeJourneyPresentation(session),
      generated_at: session.generatedAt,
    };
  }

  getHistory(authContext: AuthContext) {
    requireAuth(authContext);
    return {
      history: this.repository.getHistory(authContext.userId),
      step_count: RUNTIME_JOURNEY_STEPS.length,
    };
  }

  start(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const session = this.repository.resetSession(authContext.userId, generatedAt);
    updateSessionHandoff(session, { needRequest: DEFAULT_NEED_HANDOFF });
    this.seedNeedSession(authContext, generatedAt);
    const result = this.orchestrator.resolveStep(authContext, session, "launch", generatedAt);
    this.orchestrator.applyStepToSession(session, "launch", result);
    this.repository.saveSession(session);
    return this.toJourneyView(session, result);
  }

  next(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const session = this.repository.getSession(authContext.userId, generatedAt);
    session.generatedAt = generatedAt;

    const nextIndex = Math.min(session.state.currentStepIndex + 1, RUNTIME_JOURNEY_STEPS.length - 1);
    const nextStep = getRuntimeStepByIndex(nextIndex);
    if (!nextStep) {
      return this.toJourneyView(session);
    }

    if (nextStep.id === "need-transition") {
      this.seedNeedSession(authContext, generatedAt);
    }

    const result = this.orchestrator.resolveStep(authContext, session, nextStep.id, generatedAt);
    this.orchestrator.applyStepToSession(session, nextStep.id, result);
    this.repository.saveSession(session);
    return this.toJourneyView(session, result);
  }

  back(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const session = this.repository.getSession(authContext.userId, generatedAt);
    const prevIndex = Math.max(session.state.currentStepIndex - 1, 0);
    const prevStep = getRuntimeStepByIndex(prevIndex);
    if (!prevStep) {
      return this.toJourneyView(session);
    }
    const result = this.orchestrator.resolveStep(authContext, session, prevStep.id, generatedAt);
    this.orchestrator.applyStepToSession(session, prevStep.id, result);
    this.repository.saveSession(session);
    return this.toJourneyView(session, result);
  }

  finish(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const session = this.repository.getSession(authContext.userId, generatedAt);
    const result = this.orchestrator.resolveStep(authContext, session, "need-home-return", generatedAt);
    this.orchestrator.applyStepToSession(session, "need-home-return", result);
    session.state.finished = true;
    session.state.returnContext.completed = true;
    this.repository.saveSession(session);
    return this.toJourneyView(session, result);
  }

  reset(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.start(authContext, input);
  }

  validateRuntime() {
    return validateRuntimeJourney();
  }

  private seedNeedSession(authContext: AuthContext, generatedAt: string) {
    this.experienceDeps.needExperience.dispatchAction(
      authContext,
      { type: "update-request", fields: DEFAULT_NEED_HANDOFF },
      { generated_at: generatedAt }
    );
  }

  private toJourneyView(session: ReturnType<RuntimeJourneyRepository["getSession"]>, stepResult?: { step: { id: RuntimeStepId; route: string; label: string; experience: string }; experience: string; screen?: unknown; experienceView?: unknown; transition?: unknown }) {
    const navigation = buildRuntimeJourneyNavigation(session.state.currentStepId);
    const presentation = buildRuntimeJourneyPresentation(session);
    return {
      version: RUNTIME_JOURNEY_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      profile_experience_version: PROFILE_EXPERIENCE_VERSION,
      session_id: session.sessionId,
      current_step: session.state.currentStepId,
      current_step_index: session.state.currentStepIndex,
      lifecycle_phase: session.state.lifecyclePhase,
      finished: session.state.finished,
      navigation,
      accessibility: buildRuntimeNavigationAccessibility(),
      handoff: session.state.handoff,
      return_context: session.state.returnContext,
      history: session.history,
      presentation,
      definition: buildRuntimeJourneyDefinition(),
      active_experience: session.activeExperience,
      active_screen_id: session.activeScreenId,
      active_route: session.activeRoute,
      step_result: stepResult
        ? {
            step_id: stepResult.step.id,
            experience: stepResult.experience,
            route: stepResult.step.route,
            label: stepResult.step.label,
            screen: stepResult.screen,
            transition: stepResult.transition,
          }
        : undefined,
      generated_at: session.generatedAt,
      runtime_journey: true,
      read_only: true,
      deterministic: true,
    };
  }
}

export function createRuntimeJourneyService(deps: RuntimeExperienceDeps & { repository?: RuntimeJourneyRepository }) {
  return new RuntimeJourneyService(deps);
}
