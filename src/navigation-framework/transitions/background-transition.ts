import type { SemanticColorTokenPath } from "../../design-system/foundation/colors.js";
import { interpolateTransitionBackground } from "../../design-system/foundation/transitions.js";
import { OFFICIAL_TRANSITION_SCREEN } from "../../design-system/core-ui/components/loading.js";

export type BackgroundTransitionDirection = "need-to-action" | "action-to-need";

export interface BackgroundTransitionStep {
  progress: number;
  colorToken: SemanticColorTokenPath;
}

export interface BackgroundTransitionSpec {
  id: "background-transition";
  forward: readonly SemanticColorTokenPath[];
  reverse: readonly SemanticColorTokenPath[];
  interpolation: "step" | "semantic-token";
}

export const BACKGROUND_TRANSITION_SPEC: BackgroundTransitionSpec = {
  id: "background-transition",
  forward: OFFICIAL_TRANSITION_SCREEN.backgroundInterpolation.forward,
  reverse: OFFICIAL_TRANSITION_SCREEN.backgroundInterpolation.reverse,
  interpolation: "semantic-token",
};

export function resolveBackgroundToken(
  progress: number,
  direction: BackgroundTransitionDirection
): SemanticColorTokenPath {
  const tokens = direction === "need-to-action"
    ? BACKGROUND_TRANSITION_SPEC.forward
    : BACKGROUND_TRANSITION_SPEC.reverse;
  const steps = tokens.map((colorToken, index) => ({
    progress: index / (tokens.length - 1),
    colorToken,
  }));
  return interpolateTransitionBackground(progress, steps);
}

export function buildBackgroundTransitionSteps(
  direction: BackgroundTransitionDirection
): BackgroundTransitionStep[] {
  const tokens = direction === "need-to-action"
    ? BACKGROUND_TRANSITION_SPEC.forward
    : BACKGROUND_TRANSITION_SPEC.reverse;
  return tokens.map((colorToken, index) => ({
    progress: index / (tokens.length - 1),
    colorToken,
  }));
}
