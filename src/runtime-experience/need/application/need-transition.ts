import { OFFICIAL_TRANSITION_SPEC } from "../../../prototype-library/foundation/prototype-schema.js";
import {
  createTransitionEngineState,
  advanceTransitionEngine,
  resolveStageTextForProgress,
  TRANSITION_ENGINE_SPEC,
  type TransitionEngineState,
} from "../../../navigation-framework/transitions/transition-engine.js";
import {
  resolveBackgroundToken,
  buildBackgroundTransitionSteps,
} from "../../../navigation-framework/transitions/background-transition.js";
import { selectProgressVariant, resolveProgressValue } from "../../../navigation-framework/transitions/progress-engine.js";

export interface NeedTransitionView {
  brandLine: string;
  stageText: string;
  stageTexts: readonly string[];
  progress: number;
  progressVariant: "terminal" | "linear" | "circular";
  progressValue: number;
  phase: "idle" | "running" | "complete";
  direction: "need-to-action";
  backgroundToken: string;
  backgroundSteps: ReturnType<typeof buildBackgroundTransitionSteps>;
  modeTransition: {
    from: "need";
    to: "action";
    complete: boolean;
  };
  components: {
    loadingComponentId: "core-ui-loading";
    progressComponentId: "core-ui-progress";
  };
}

export function createNeedTransitionState(): TransitionEngineState {
  return createTransitionEngineState("need-to-action");
}

export function advanceNeedTransition(
  state: TransitionEngineState,
  progress: number,
  stageIndex?: number
): TransitionEngineState {
  return advanceTransitionEngine(state, progress, stageIndex);
}

export function buildNeedTransitionView(
  engine: TransitionEngineState,
  _reducedMotion = false
): NeedTransitionView {
  const progress = engine.progress;
  const progressVariant = selectProgressVariant("transition");
  return {
    brandLine: TRANSITION_ENGINE_SPEC.brandLine,
    stageText: engine.stageText || resolveStageTextForProgress(progress),
    stageTexts: OFFICIAL_TRANSITION_SPEC.stageTexts,
    progress,
    progressVariant,
    progressValue: resolveProgressValue(progress),
    phase: engine.phase,
    direction: "need-to-action",
    backgroundToken: resolveBackgroundToken(progress, "need-to-action"),
    backgroundSteps: buildBackgroundTransitionSteps("need-to-action"),
    modeTransition: {
      from: "need",
      to: "action",
      complete: engine.phase === "complete",
    },
    components: {
      loadingComponentId: "core-ui-loading",
      progressComponentId: "core-ui-progress",
    },
  };
}

export function isTransitionComplete(engine: TransitionEngineState): boolean {
  return engine.phase === "complete" || engine.progress >= 1;
}
