import type { CoordinatorDelegationTarget } from "./runtime-coordinator.js";

export type CoordinationAction =
  | "resolve"
  | "navigate"
  | "transition"
  | "lifecycle-advance"
  | "return-flow"
  | "validate";

export interface CoordinationPlanStep {
  action: CoordinationAction;
  delegateTo: CoordinatorDelegationTarget;
  route?: string;
  description: string;
}

export interface CoordinationPlan {
  planId: string;
  currentRoute: string;
  requestedRoute?: string;
  activeExperience: CoordinatorDelegationTarget;
  steps: CoordinationPlanStep[];
  lifecyclePhase: string;
  inTransition: boolean;
}

export function createCoordinationPlan(input: Omit<CoordinationPlan, "planId"> & { planId?: string }): CoordinationPlan {
  return {
    planId: input.planId ?? `plan-${Date.now()}`,
    currentRoute: input.currentRoute,
    requestedRoute: input.requestedRoute,
    activeExperience: input.activeExperience,
    steps: input.steps,
    lifecyclePhase: input.lifecyclePhase,
    inTransition: input.inTransition,
  };
}
