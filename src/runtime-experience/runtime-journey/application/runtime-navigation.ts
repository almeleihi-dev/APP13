import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildInitialNavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { RuntimeStepId } from "../domain/runtime-step.js";
import { getRuntimeStep, RUNTIME_JOURNEY_STEPS } from "../domain/runtime-step.js";

export interface RuntimeJourneyNavigationView {
  currentStepId: RuntimeStepId;
  currentStepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  nextStepId?: RuntimeStepId;
  previousStepId?: RuntimeStepId;
  navigation: NavigationState;
  returnRoute: string;
}

export function buildRuntimeJourneyNavigation(stepId: RuntimeStepId): RuntimeJourneyNavigationView {
  const index = RUNTIME_JOURNEY_STEPS.findIndex((s) => s.id === stepId);
  const previous = index > 0 ? RUNTIME_JOURNEY_STEPS[index - 1] : undefined;
  const next = index < RUNTIME_JOURNEY_STEPS.length - 1 ? RUNTIME_JOURNEY_STEPS[index + 1] : undefined;
  const step = getRuntimeStep(stepId);

  return {
    currentStepId: stepId,
    currentStepIndex: index,
    totalSteps: RUNTIME_JOURNEY_STEPS.length,
    canGoBack: index > 0,
    canGoNext: index < RUNTIME_JOURNEY_STEPS.length - 1,
    nextStepId: next?.id,
    previousStepId: previous?.id,
    navigation: buildInitialNavigationState(step.route),
    returnRoute: "/need/home",
  };
}

export function buildRuntimeNavigationAccessibility() {
  return {
    minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
    supportsKeyboardNavigation: NAVIGATION_ACCESSIBILITY_SPEC.keyboardNavigation.tabOrderFollowsLayout,
    supportsScreenReader: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.announceTransitionStages,
    reducedMotion: NAVIGATION_ACCESSIBILITY_SPEC.reducedMotion.skipTransitionAnimations,
    focusRegion: "mainContent",
    landmarkRegions: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.landmarkRegions,
  };
}
