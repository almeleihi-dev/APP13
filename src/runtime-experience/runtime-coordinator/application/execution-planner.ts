import type { CoordinationPlan, CoordinationPlanStep } from "../domain/coordination-plan.js";
import { createCoordinationPlan } from "../domain/coordination-plan.js";
import type { CoordinationRequest } from "../domain/coordination-request.js";
import type { CoordinatorDelegationTarget } from "../domain/runtime-coordinator.js";
import type { ResolvedExperience } from "./experience-resolver.js";

export class ExecutionPlanner {
  buildPlan(
    request: CoordinationRequest,
    activeExperience: CoordinatorDelegationTarget,
    resolvedTarget?: ResolvedExperience
  ): CoordinationPlan {
    const steps: CoordinationPlanStep[] = [
      {
        action: "resolve",
        delegateTo: "runtime-registry",
        route: request.currentRoute,
        description: "Resolve experience from registry catalog",
      },
    ];

    if (request.requestedRoute && request.requestedRoute !== request.currentRoute) {
      steps.push({
        action: "navigate",
        delegateTo: "runtime-state",
        route: request.requestedRoute,
        description: "Delegate navigation to runtime state engine",
      });
    }

    if (request.action === "transition") {
      steps.push({
        action: "transition",
        delegateTo: "runtime-state",
        route: request.requestedRoute ?? "/system/transition",
        description: "Delegate transition to runtime state engine",
      });
    }

    if (request.action === "next" || request.action === "back") {
      steps.push({
        action: "lifecycle-advance",
        delegateTo: "runtime-journey",
        description: `Delegate lifecycle ${request.action} to runtime journey`,
      });
      steps.push({
        action: "navigate",
        delegateTo: "runtime-state",
        description: "Sync authoritative state after journey step",
      });
    }

    if (request.action === "finish") {
      steps.push({
        action: "return-flow",
        delegateTo: "runtime-state",
        route: request.context.returnDestination ?? "/need/home",
        description: "Delegate return flow completion to runtime state",
      });
    }

    steps.push({
      action: "validate",
      delegateTo: "runtime-registry",
      description: "Validate registry and coordinator delegation",
    });

    const inTransition =
      request.context.runtimePhase === "transition" ||
      request.context.runtimePhase === "return-transition" ||
      request.action === "transition";

    return createCoordinationPlan({
      currentRoute: request.currentRoute,
      requestedRoute: request.requestedRoute,
      activeExperience: resolvedTarget?.id as CoordinatorDelegationTarget ?? activeExperience,
      steps,
      lifecyclePhase: request.context.runtimePhase ?? "launch",
      inTransition,
    });
  }
}

export function createExecutionPlanner(): ExecutionPlanner {
  return new ExecutionPlanner();
}
