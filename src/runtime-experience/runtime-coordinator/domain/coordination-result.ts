import type { CoordinatorDelegationTarget } from "./runtime-coordinator.js";
import type { CoordinationPlan } from "./coordination-plan.js";

export interface NavigationDecision {
  delegateTo: CoordinatorDelegationTarget;
  action: "next" | "back" | "stay";
  route: string;
  reason: string;
}

export interface TransitionDecision {
  delegateTo: "runtime-state" | "runtime-journey";
  inTransition: boolean;
  route: string;
  stage?: string;
}

export interface LifecycleDecision {
  phase: string;
  delegateTo: CoordinatorDelegationTarget;
  advance: boolean;
}

export interface ContextUpdates {
  preserved: boolean;
  delegateTo: CoordinatorDelegationTarget;
  updates: Record<string, unknown>;
}

export interface CoordinationResult {
  activeExperience: CoordinatorDelegationTarget;
  navigationDecision: NavigationDecision;
  transitionDecision: TransitionDecision;
  lifecycleDecision: LifecycleDecision;
  contextUpdates: ContextUpdates;
  validationResult: { valid: boolean; delegateTo: "runtime-registry" | "runtime-coordinator" };
  plan?: CoordinationPlan;
  delegated: true;
}

export function buildCoordinationResult(input: Omit<CoordinationResult, "delegated">): CoordinationResult {
  return { ...input, delegated: true };
}
