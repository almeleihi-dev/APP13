import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import { RUNTIME_COORDINATOR_VERSION, buildRuntimeCoordinatorDefinition } from "../domain/runtime-coordinator.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { RUNTIME_REGISTRY_VERSION } from "../../runtime-registry/domain/runtime-experience.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import {
  RuntimeCoordinatorRepository,
  createRuntimeCoordinatorRepository,
} from "../infrastructure/runtime-coordinator-repository.js";
import { ExperienceResolver, createExperienceResolver } from "./experience-resolver.js";
import { ExecutionPlanner, createExecutionPlanner } from "./execution-planner.js";
import { ExperienceCoordinator, createExperienceCoordinator } from "./experience-coordinator.js";
import { buildCoordinationRequest, type CoordinationRequestInput } from "../domain/coordination-request.js";
import { validateRuntimeCoordinator } from "../validation/runtime-coordinator-validator.js";
import { buildCoordinationSummary } from "../presentation/coordination-summary.js";
import { buildCoordinationMap } from "../presentation/coordination-map.js";
import { buildExecutionView } from "../presentation/execution-view.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeCoordinatorService {
  private readonly repository: RuntimeCoordinatorRepository;
  private readonly resolver: ExperienceResolver;
  private readonly planner: ExecutionPlanner;
  private readonly coordinator: ExperienceCoordinator;
  private readonly runtimeState: RuntimeStateService;
  private readonly runtimeRegistry: RuntimeRegistryService;

  constructor(deps: {
    runtimeJourney: RuntimeJourneyService;
    runtimeState: RuntimeStateService;
    runtimeRegistry: RuntimeRegistryService;
    repository?: RuntimeCoordinatorRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeCoordinatorRepository();
    this.runtimeState = deps.runtimeState;
    this.runtimeRegistry = deps.runtimeRegistry;
    this.resolver = createExperienceResolver();
    this.planner = createExecutionPlanner();
    this.coordinator = createExperienceCoordinator({
      runtimeJourney: deps.runtimeJourney,
      runtimeState: deps.runtimeState,
      runtimeRegistry: deps.runtimeRegistry,
      resolver: this.resolver,
      planner: this.planner,
    });
  }

  getCoordinator(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    return this.toCoordinatorView(authContext, input?.generated_at);
  }

  getStatus(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const session = this.repository.getSession(authContext.userId, generatedAt);
    const active = this.resolver.resolveActiveFromState({ current_step_id: stateView.current_step_id });
    return {
      active_experience: active,
      runtime_phase: stateView.runtime_phase,
      current_mode: stateView.current_mode,
      finished: stateView.finished,
      last_plan_id: session.lastPlanId,
      generated_at: generatedAt,
    };
  }

  getActive(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const route = stateView.navigation_stack?.at(-1) ?? "/runtime/launch";
    const resolved = this.resolver.resolveByRoute(authContext, this.runtimeRegistry, route);
    const active = this.resolver.resolveActiveFromState({ current_step_id: stateView.current_step_id });
    return {
      active_experience: active,
      resolved,
      current_route: route,
      current_step_id: stateView.current_step_id,
      generated_at: generatedAt,
    };
  }

  getPlan(authContext: AuthContext, input?: CoordinationRequestInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const request = buildCoordinationRequest(input ?? {}, {
      sessionId: stateView.session_id,
      currentStepId: stateView.current_step_id,
      currentMode: stateView.current_mode,
      runtimePhase: stateView.runtime_phase,
      returnDestination: stateView.return_destination,
    });
    const active = this.resolver.resolveActiveFromState({ current_step_id: stateView.current_step_id });
    const resolved = request.requestedRoute
      ? this.resolver.resolveByRoute(authContext, this.runtimeRegistry, request.requestedRoute)
      : undefined;
    const plan = this.planner.buildPlan(request, active, resolved);
    this.repository.saveSession({
      userId: authContext.userId,
      lastPlanId: plan.planId,
      lastActiveExperience: plan.activeExperience,
      generatedAt,
    });
    return { plan, execution: buildExecutionView(plan) };
  }

  getMap(authContext: AuthContext) {
    requireAuth(authContext);
    const registryMap = this.runtimeRegistry.getMap(authContext);
    return {
      registry_map: registryMap,
      coordination_map: buildCoordinationMap(registryMap.map),
      delegation_only: true,
    };
  }

  coordinate(authContext: AuthContext, input?: CoordinationRequestInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const request = buildCoordinationRequest(input ?? {}, {
      sessionId: stateView.session_id,
      currentStepId: stateView.current_step_id,
      currentMode: stateView.current_mode,
      runtimePhase: stateView.runtime_phase,
      returnDestination: stateView.return_destination,
      handoff: stateView.context as unknown as Record<string, unknown> | undefined,
    });
    const result = this.coordinator.coordinate(authContext, request);
    this.repository.saveSession({
      userId: authContext.userId,
      lastPlanId: result.plan?.planId,
      lastActiveExperience: result.activeExperience,
      generatedAt,
    });
    return this.wrapResult(result, generatedAt);
  }

  navigate(authContext: AuthContext, input?: CoordinationRequestInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const request = buildCoordinationRequest(
      { ...input, action: input?.action ?? "next" },
      {
        currentStepId: stateView.current_step_id,
        runtimePhase: stateView.runtime_phase,
        returnDestination: stateView.return_destination,
      }
    );
    const result = this.coordinator.navigate(authContext, request);
    return this.wrapResult(result, generatedAt, result.stateView);
  }

  transition(authContext: AuthContext, input?: CoordinationRequestInput) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const stateView = this.depsState(authContext, generatedAt);
    const request = buildCoordinationRequest(
      { ...input, action: "transition" },
      {
        currentStepId: stateView.current_step_id,
        runtimePhase: stateView.runtime_phase,
        returnDestination: stateView.return_destination,
      }
    );
    const result = this.coordinator.transition(authContext, request);
    return this.wrapResult(result, generatedAt, result.stateView);
  }

  reset(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const result = this.coordinator.reset(authContext, generatedAt);
    this.repository.resetSession(authContext.userId, generatedAt);
    return this.wrapResult(result, generatedAt, result.stateView);
  }

  validateRuntime() {
    return validateRuntimeCoordinator();
  }

  private depsState(authContext: AuthContext, generatedAt: string) {
    return this.runtimeState.getState(authContext, { generated_at: generatedAt });
  }

  private wrapResult(result: ReturnType<ExperienceCoordinator["coordinate"]>, generatedAt: string, stateView?: unknown) {
    return {
      ...result,
      summary: buildCoordinationSummary(result),
      state_view: stateView,
      generated_at: generatedAt,
    };
  }

  private toCoordinatorView(authContext: AuthContext, generatedAt?: string) {
    const at = generatedAt ?? new Date().toISOString();
    const stateView = this.depsState(authContext, at);
    const definition = buildRuntimeCoordinatorDefinition();
    return {
      version: RUNTIME_COORDINATOR_VERSION,
      runtime_journey_version: RUNTIME_JOURNEY_VERSION,
      runtime_state_version: RUNTIME_STATE_VERSION,
      runtime_registry_version: RUNTIME_REGISTRY_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      profile_experience_version: PROFILE_EXPERIENCE_VERSION,
      definition,
      current_phase: stateView.runtime_phase,
      current_mode: stateView.current_mode,
      active_step: stateView.current_step_id,
      summary: buildCoordinationSummary({
        activeExperience: this.resolver.resolveActiveFromState({ current_step_id: stateView.current_step_id }),
        navigationDecision: {
          delegateTo: "runtime-state",
          action: "stay",
          route: stateView.navigation_stack?.at(-1) ?? "/runtime/launch",
          reason: "Current coordinator view",
        },
        transitionDecision: { delegateTo: "runtime-state", inTransition: false, route: "/system/transition" },
        lifecycleDecision: { phase: stateView.runtime_phase ?? "launch", delegateTo: "runtime-journey", advance: false },
        contextUpdates: { preserved: true, delegateTo: "runtime-state", updates: {} },
        validationResult: { valid: true, delegateTo: "runtime-registry" },
      }),
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        supportsKeyboardNavigation: NAVIGATION_ACCESSIBILITY_SPEC.keyboardNavigation.tabOrderFollowsLayout,
      },
      generated_at: at,
      runtime_coordinator: true,
      delegation_only: true,
      read_only: true,
      deterministic: true,
    };
  }
}

export function createRuntimeCoordinatorService(deps: {
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  repository?: RuntimeCoordinatorRepository;
}) {
  return new RuntimeCoordinatorService(deps);
}
