import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { CoordinationRequest } from "../domain/coordination-request.js";
import type { CoordinationPlan } from "../domain/coordination-plan.js";
import { buildCoordinationResult, type CoordinationResult } from "../domain/coordination-result.js";
import type { ExperienceResolver } from "./experience-resolver.js";
import type { ExecutionPlanner } from "./execution-planner.js";
import type { CoordinatorDelegationTarget } from "../domain/runtime-coordinator.js";

export class ExperienceCoordinator {
  constructor(
    private readonly runtimeJourney: RuntimeJourneyService,
    private readonly runtimeState: RuntimeStateService,
    private readonly runtimeRegistry: RuntimeRegistryService,
    private readonly resolver: ExperienceResolver,
    private readonly planner: ExecutionPlanner
  ) {}

  coordinate(authContext: AuthContext, request: CoordinationRequest): CoordinationResult {
    const stateView = this.runtimeState.getState(authContext, { generated_at: request.generatedAt });
    const activeExperience = this.resolver.resolveActiveFromState({
      current_step_id: stateView.current_step_id,
      active_experience: undefined,
    });

    const currentRoute =
      stateView.navigation_stack?.at(-1) ??
      request.currentRoute;
    const resolved = request.requestedRoute
      ? this.resolver.resolveByRoute(authContext, this.runtimeRegistry, request.requestedRoute)
      : undefined;

    const plan = this.planner.buildPlan(
      { ...request, currentRoute, context: { ...request.context, runtimePhase: stateView.runtime_phase } },
      activeExperience,
      resolved
    );

    return this.buildResultFromPlan(plan, stateView, resolved?.id as CoordinatorDelegationTarget ?? activeExperience);
  }

  navigate(authContext: AuthContext, request: CoordinationRequest): CoordinationResult & { stateView: unknown } {
    const action = request.action === "back" ? "back" : "next";
    const stateView = this.runtimeState.update(authContext, {
      generated_at: request.generatedAt,
      action,
    });
    const activeExperience = this.resolver.resolveActiveFromState({
      current_step_id: stateView.current_step_id,
    });
    const plan = this.planner.buildPlan(request, activeExperience);
    return {
      ...this.buildResultFromPlan(plan, stateView, activeExperience),
      stateView,
    };
  }

  transition(authContext: AuthContext, request: CoordinationRequest): CoordinationResult & { stateView: unknown } {
    const stateView = this.runtimeState.transition(authContext, { generated_at: request.generatedAt });
    const activeExperience = this.resolver.resolveActiveFromState({
      current_step_id: stateView.current_step_id,
    });
    const plan = this.planner.buildPlan({ ...request, action: "transition" }, activeExperience);
    return {
      ...this.buildResultFromPlan(plan, stateView, activeExperience, true),
      stateView,
    };
  }

  reset(authContext: AuthContext, generatedAt: string): CoordinationResult & { stateView: unknown } {
    const stateView = this.runtimeState.reset(authContext, { generated_at: generatedAt });
    this.runtimeJourney.reset(authContext, { generated_at: generatedAt });
    const plan = this.planner.buildPlan(
      {
        currentRoute: "/runtime/launch",
        action: "reset",
        context: {},
        generatedAt,
      },
      "runtime-state"
    );
    return {
      ...this.buildResultFromPlan(plan, stateView, "runtime-state"),
      stateView,
    };
  }

  private buildResultFromPlan(
    plan: CoordinationPlan,
    stateView: {
      runtime_phase?: string;
      return_destination?: string;
      context?: unknown;
      navigation_stack?: string[];
    },
    activeExperience: CoordinatorDelegationTarget,
    inTransition = plan.inTransition
  ): CoordinationResult {
    const route = plan.requestedRoute ?? plan.currentRoute;
    const registryValidation = this.runtimeRegistry.validateRuntime();

    return buildCoordinationResult({
      activeExperience,
      navigationDecision: {
        delegateTo: "runtime-state",
        action: plan.requestedRoute && plan.requestedRoute !== plan.currentRoute ? "next" : "stay",
        route,
        reason: "Navigation delegated to runtime state engine",
      },
      transitionDecision: {
        delegateTo: inTransition ? "runtime-state" : "runtime-journey",
        inTransition,
        route: inTransition ? "/system/transition" : route,
        stage: inTransition ? plan.lifecyclePhase : undefined,
      },
      lifecycleDecision: {
        phase: stateView.runtime_phase ?? plan.lifecyclePhase,
        delegateTo: "runtime-journey",
        advance: plan.steps.some((s) => s.action === "lifecycle-advance"),
      },
      contextUpdates: {
        preserved: true,
        delegateTo: "runtime-state",
        updates: {
          returnDestination: stateView.return_destination,
          context: stateView.context ?? {},
        },
      },
      validationResult: {
        valid: registryValidation.valid,
        delegateTo: "runtime-registry",
      },
      plan,
    });
  }
}

export function createExperienceCoordinator(deps: {
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  resolver: ExperienceResolver;
  planner: ExecutionPlanner;
}): ExperienceCoordinator {
  return new ExperienceCoordinator(
    deps.runtimeJourney,
    deps.runtimeState,
    deps.runtimeRegistry,
    deps.resolver,
    deps.planner
  );
}
