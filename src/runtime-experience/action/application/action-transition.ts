import { OFFICIAL_TRANSITION_SPEC } from "../../../prototype-library/foundation/prototype-schema.js";
import {
  createTransitionEngineState,
  advanceTransitionEngine,
  type TransitionEngineState,
} from "../../../navigation-framework/transitions/transition-engine.js";
import {
  resolveBackgroundToken,
  buildBackgroundTransitionSteps,
} from "../../../navigation-framework/transitions/background-transition.js";
import { selectProgressVariant, resolveProgressValue } from "../../../navigation-framework/transitions/progress-engine.js";
import { TRANSITION_ENGINE_SPEC } from "../../../navigation-framework/transitions/transition-engine.js";

export const ACTION_RETURN_TRANSITION_STAGES = [
  "Preparing...",
  "Building Contract...",
  "Executing...",
  "Completing...",
  "Returning...",
] as const;

export type ActionReturnStageText = (typeof ACTION_RETURN_TRANSITION_STAGES)[number];

export interface ActionTransitionView {
  brandLine: string;
  stageText: string;
  stageTexts: readonly string[];
  progress: number;
  progressVariant: "terminal" | "linear" | "circular";
  progressValue: number;
  phase: "idle" | "running" | "complete";
  direction: "action-to-need";
  backgroundToken: string;
  backgroundSteps: ReturnType<typeof buildBackgroundTransitionSteps>;
  modeTransition: {
    from: "action";
    to: "need";
    complete: boolean;
  };
  components: {
    loadingComponentId: "core-ui-loading";
    progressComponentId: "core-ui-progress";
  };
}

export function createActionReturnTransitionState(): TransitionEngineState {
  return createTransitionEngineState("action-to-need");
}

export function advanceActionReturnTransition(
  state: TransitionEngineState,
  progress: number,
  stageIndex?: number
): TransitionEngineState {
  const clamped = Math.max(0, Math.min(1, progress));
  const stages = ACTION_RETURN_TRANSITION_STAGES;
  const stageText = stages[stageIndex ?? Math.min(stages.length - 1, Math.floor(clamped * stages.length))] ?? stages[0]!;
  const advanced = advanceTransitionEngine(state, clamped, stageIndex);
  return { ...advanced, stageText };
}

export function resolveReturnStageTextForProgress(progress: number): ActionReturnStageText {
  const stages = ACTION_RETURN_TRANSITION_STAGES;
  const index = Math.min(stages.length - 1, Math.floor(progress * stages.length));
  return stages[index] ?? "Preparing...";
}

export function buildActionTransitionView(engine: TransitionEngineState): ActionTransitionView {
  const progress = engine.progress;
  const progressVariant = selectProgressVariant("transition");
  return {
    brandLine: TRANSITION_ENGINE_SPEC.brandLine,
    stageText: engine.stageText || resolveReturnStageTextForProgress(progress),
    stageTexts: ACTION_RETURN_TRANSITION_STAGES,
    progress,
    progressVariant,
    progressValue: resolveProgressValue(progress),
    phase: engine.phase,
    direction: "action-to-need",
    backgroundToken: resolveBackgroundToken(progress, "action-to-need"),
    backgroundSteps: buildBackgroundTransitionSteps("action-to-need"),
    modeTransition: {
      from: "action",
      to: "need",
      complete: engine.phase === "complete",
    },
    components: {
      loadingComponentId: "core-ui-loading",
      progressComponentId: "core-ui-progress",
    },
  };
}

export function isReturnTransitionComplete(engine: TransitionEngineState): boolean {
  return engine.phase === "complete" || engine.progress >= 1;
}

export function validateActionTransitionBrand(): boolean {
  return TRANSITION_ENGINE_SPEC.brandLine === OFFICIAL_TRANSITION_SPEC.brandLine;
}
