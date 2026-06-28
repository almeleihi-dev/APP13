import type { SemanticColorTokenPath } from "./colors.js";
import { MOTION_DURATIONS, MOTION_EASING } from "./motion.js";
import { TERMINAL_TYPOGRAPHY_USAGE } from "./typography.js";

export type AnActMode = "need" | "action";

export type TransitionDirection = "need-to-action" | "action-to-need";

export interface TransitionBackgroundStep {
  progress: number;
  colorToken: SemanticColorTokenPath;
}

export interface AnActTransitionSpec {
  direction: TransitionDirection;
  brandLine: string;
  statusLine: string;
  typographyStyle: "terminal";
  durationMs: number;
  easing: string;
  backgroundSteps: TransitionBackgroundStep[];
  progressBar: {
    enabled: true;
    height: number;
    trackColorToken: SemanticColorTokenPath;
    fillColorToken: SemanticColorTokenPath;
    radiusToken: "pill";
  };
}

/** Official AN ACT transition: Need Mode → Transition Screen → Action Mode */
export const NEED_TO_ACTION_TRANSITION: AnActTransitionSpec = {
  direction: "need-to-action",
  brandLine: TERMINAL_TYPOGRAPHY_USAGE.transitionBrandLine,
  statusLine: TERMINAL_TYPOGRAPHY_USAGE.transitionStatusLine,
  typographyStyle: "terminal",
  durationMs: MOTION_DURATIONS.extraSlow,
  easing: MOTION_EASING.emphasized,
  backgroundSteps: [
    { progress: 0, colorToken: "transition.start" },
    { progress: 0.5, colorToken: "transition.mid" },
    { progress: 1, colorToken: "transition.end" },
  ],
  progressBar: {
    enabled: true,
    height: 4,
    trackColorToken: "surface.muted",
    fillColorToken: "accent.primary",
    radiusToken: "pill",
  },
};

/** Reverse transition: Action Mode → Transition Screen → Need Mode */
export const ACTION_TO_NEED_TRANSITION: AnActTransitionSpec = {
  direction: "action-to-need",
  brandLine: TERMINAL_TYPOGRAPHY_USAGE.transitionBrandLine,
  statusLine: TERMINAL_TYPOGRAPHY_USAGE.transitionStatusLine,
  typographyStyle: "terminal",
  durationMs: MOTION_DURATIONS.extraSlow,
  easing: MOTION_EASING.decelerate,
  backgroundSteps: [
    { progress: 0, colorToken: "transition.start" },
    { progress: 0.5, colorToken: "transition.mid" },
    { progress: 1, colorToken: "transition.end" },
  ],
  progressBar: {
    enabled: true,
    height: 4,
    trackColorToken: "surface.muted",
    fillColorToken: "accent.highlight",
    radiusToken: "pill",
  },
};

export const AN_ACT_TRANSITION_FLOW = {
  needMode: "need" as const,
  transitionScreen: "transition" as const,
  actionMode: "action" as const,
  forward: NEED_TO_ACTION_TRANSITION,
  reverse: ACTION_TO_NEED_TRANSITION,
};

export function resolveTransitionSpec(direction: TransitionDirection): AnActTransitionSpec {
  return direction === "need-to-action" ? NEED_TO_ACTION_TRANSITION : ACTION_TO_NEED_TRANSITION;
}

export function interpolateTransitionBackground(
  progress: number,
  steps: TransitionBackgroundStep[]
): SemanticColorTokenPath {
  const clamped = Math.max(0, Math.min(1, progress));
  let selected = steps[0]!;
  for (const step of steps) {
    if (clamped >= step.progress) selected = step;
  }
  return selected.colorToken;
}
