import { OFFICIAL_TRANSITION_SPEC } from "../../../prototype-library/foundation/prototype-schema.js";
import {
  createTransitionEngineState,
  advanceTransitionEngine,
  TRANSITION_ENGINE_SPEC,
  type TransitionEngineState,
} from "../../../navigation-framework/transitions/transition-engine.js";
import {
  resolveBackgroundToken,
  buildBackgroundTransitionSteps,
} from "../../../navigation-framework/transitions/background-transition.js";
import { selectProgressVariant, resolveProgressValue } from "../../../navigation-framework/transitions/progress-engine.js";

export const CONTRACT_TO_ACTION_TRANSITION_STAGES = [
  "Reviewing...",
  "Building Contract...",
  "Confirming...",
  "Action Ready.",
] as const;

export type ContractTransitionStageText = (typeof CONTRACT_TO_ACTION_TRANSITION_STAGES)[number];

export interface ContractTransitionView {
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
    from: "contract";
    to: "active-action";
    complete: boolean;
  };
  components: {
    loadingComponentId: "core-ui-loading";
    progressComponentId: "core-ui-progress";
  };
}

export function createContractTransitionState(): TransitionEngineState {
  return createTransitionEngineState("need-to-action");
}

export function advanceContractTransition(
  state: TransitionEngineState,
  progress: number,
  stageIndex?: number
): TransitionEngineState {
  const clamped = Math.max(0, Math.min(1, progress));
  const stages = CONTRACT_TO_ACTION_TRANSITION_STAGES;
  const stageText = stages[stageIndex ?? Math.min(stages.length - 1, Math.floor(clamped * stages.length))] ?? stages[0]!;
  const advanced = advanceTransitionEngine(state, clamped, stageIndex);
  return { ...advanced, stageText };
}

export function resolveContractStageTextForProgress(progress: number): ContractTransitionStageText {
  const stages = CONTRACT_TO_ACTION_TRANSITION_STAGES;
  const index = Math.min(stages.length - 1, Math.floor(progress * stages.length));
  return stages[index] ?? "Reviewing...";
}

export function buildContractTransitionView(engine: TransitionEngineState): ContractTransitionView {
  const progress = engine.progress;
  const progressVariant = selectProgressVariant("transition");
  return {
    brandLine: TRANSITION_ENGINE_SPEC.brandLine,
    stageText: engine.stageText || resolveContractStageTextForProgress(progress),
    stageTexts: CONTRACT_TO_ACTION_TRANSITION_STAGES,
    progress,
    progressVariant,
    progressValue: resolveProgressValue(progress),
    phase: engine.phase,
    direction: "need-to-action",
    backgroundToken: resolveBackgroundToken(progress, "need-to-action"),
    backgroundSteps: buildBackgroundTransitionSteps("need-to-action"),
    modeTransition: {
      from: "contract",
      to: "active-action",
      complete: engine.phase === "complete",
    },
    components: {
      loadingComponentId: "core-ui-loading",
      progressComponentId: "core-ui-progress",
    },
  };
}

export function isContractTransitionComplete(engine: TransitionEngineState): boolean {
  return engine.phase === "complete" || engine.progress >= 1;
}

export function validateContractTransitionBrand(): boolean {
  return TRANSITION_ENGINE_SPEC.brandLine === OFFICIAL_TRANSITION_SPEC.brandLine;
}
