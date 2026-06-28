import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";
import type { RuntimeApplicationPhase } from "./runtime-phase.js";
import { resolveApplicationPhase, resolveRuntimeMode } from "./runtime-phase.js";
import type { RuntimeApplicationContext } from "./runtime-context.js";
import { createInitialRuntimeContext } from "./runtime-context.js";

export const RUNTIME_STATE_VERSION = "an-act-runtime-state-v1" as const;

export interface ApplicationRuntimeState {
  currentScreen?: string;
  previousScreen?: string;
  currentStepId: RuntimeStepId;
  currentMode: "Need" | "Action" | "Transition";
  navigationStack: string[];
  runtimePhase: RuntimeApplicationPhase;
  context: RuntimeApplicationContext;
  transitionProgress: {
    stage: string;
    inProgress: boolean;
    route: string;
  };
  returnDestination: string;
  launchTimestamp: string;
  lastActivityTimestamp: string;
  finished: boolean;
}

export function createInitialApplicationRuntimeState(generatedAt: string): ApplicationRuntimeState {
  return {
    currentStepId: "launch",
    currentMode: "Need",
    navigationStack: ["/runtime/launch"],
    runtimePhase: "launch",
    context: createInitialRuntimeContext(),
    transitionProgress: { stage: "idle", inProgress: false, route: "/system/transition" },
    returnDestination: "/need/home",
    launchTimestamp: generatedAt,
    lastActivityTimestamp: generatedAt,
    finished: false,
  };
}

export function pushNavigationStack(stack: string[], route: string): string[] {
  if (stack.length > 0 && stack[stack.length - 1] === route) return stack;
  return [...stack, route];
}

export interface JourneyViewSnapshot {
  current_step: RuntimeStepId;
  active_screen_id?: string;
  active_route?: string;
  active_experience?: string;
  lifecycle_phase?: string;
  finished?: boolean;
  handoff?: {
    needRequest?: RuntimeApplicationContext["needRequest"];
    contractId?: string;
    actionId?: string;
    conversationId?: string;
  };
  return_context?: {
    returnRoute?: string;
    completed?: boolean;
  };
  generated_at?: string;
}

export function syncApplicationStateFromJourney(
  state: ApplicationRuntimeState,
  journey: JourneyViewSnapshot
): ApplicationRuntimeState {
  const stepId = journey.current_step;
  const route = journey.active_route ?? state.navigationStack[state.navigationStack.length - 1] ?? "/runtime/launch";
  const screenId = journey.active_screen_id ?? stepId;
  const phase = resolveApplicationPhase(stepId);
  const mode = resolveRuntimeMode(stepId);
  const inTransition = phase === "transition" || phase === "return-transition";

  const context = { ...state.context };
  if (journey.handoff?.needRequest) context.needRequest = journey.handoff.needRequest;
  if (journey.handoff?.contractId) {
    context.contract = {
      contractId: journey.handoff.contractId,
      actionId: journey.handoff.actionId,
      route: "/contract/home",
    };
  }
  if (journey.handoff?.actionId) {
    context.contract = {
      ...context.contract,
      actionId: journey.handoff.actionId,
    };
    context.conversation = {
      ...context.conversation,
      actionId: journey.handoff.actionId,
      contractId: journey.handoff.contractId,
    };
  }
  if (journey.handoff?.conversationId) {
    context.conversation = {
      ...context.conversation,
      conversationId: journey.handoff.conversationId,
      contractId: journey.handoff.contractId,
      actionId: journey.handoff.actionId,
    };
  }
  context.transition = {
    stage: inTransition ? stepId : "idle",
    inProgress: inTransition,
    route: inTransition ? route : "/system/transition",
  };
  context.returnDestination = journey.return_context?.returnRoute ?? context.returnDestination;

  const transitionProgress = { ...context.transition };

  return {
    ...state,
    previousScreen: state.currentScreen,
    currentScreen: screenId,
    currentStepId: stepId,
    currentMode: mode,
    navigationStack: pushNavigationStack(state.navigationStack, route),
    runtimePhase: phase,
    context,
    transitionProgress,
    returnDestination: context.returnDestination,
    lastActivityTimestamp: journey.generated_at ?? state.lastActivityTimestamp,
    finished: journey.finished ?? state.finished,
  };
}
