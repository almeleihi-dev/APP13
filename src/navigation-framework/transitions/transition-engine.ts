import {
  AN_ACT_TRANSITION_FLOW,
  resolveTransitionSpec,
  type TransitionDirection,
} from "../../design-system/foundation/transitions.js";
import { OFFICIAL_TRANSITION_SCREEN } from "../../design-system/core-ui/components/loading.js";
import { MOTION_DURATIONS } from "../../design-system/foundation/motion.js";

export type TransitionEnginePhase = "idle" | "running" | "complete";

export interface TransitionEngineState {
  direction: TransitionDirection;
  phase: TransitionEnginePhase;
  progress: number;
  stageText: string;
  brandLine: string;
}

export const TRANSITION_ENGINE_SPEC = {
  id: "transition-engine",
  brandLine: OFFICIAL_TRANSITION_SCREEN.brandLine,
  stageTexts: OFFICIAL_TRANSITION_SCREEN.stageTexts,
  durationMs: MOTION_DURATIONS.extraSlow,
  flow: AN_ACT_TRANSITION_FLOW,
  supportsReverse: true,
};

export function createTransitionEngineState(direction: TransitionDirection): TransitionEngineState {
  const spec = resolveTransitionSpec(direction);
  return {
    direction,
    phase: "idle",
    progress: 0,
    stageText: spec.statusLine,
    brandLine: spec.brandLine,
  };
}

export function advanceTransitionEngine(
  state: TransitionEngineState,
  progress: number,
  stageIndex?: number
): TransitionEngineState {
  const clamped = Math.max(0, Math.min(1, progress));
  const stages = TRANSITION_ENGINE_SPEC.stageTexts;
  const stageText = stages[stageIndex ?? Math.min(stages.length - 1, Math.floor(clamped * stages.length))] ?? stages[0]!;
  return {
    ...state,
    progress: clamped,
    phase: clamped >= 1 ? "complete" : "running",
    stageText,
  };
}

export function resolveStageTextForProgress(progress: number): string {
  const stages = TRANSITION_ENGINE_SPEC.stageTexts;
  const index = Math.min(stages.length - 1, Math.floor(progress * stages.length));
  return stages[index] ?? "Preparing...";
}
