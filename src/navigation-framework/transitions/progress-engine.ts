import { PROGRESS_COMPONENT } from "../../design-system/core-ui/components/progress.js";
import { OFFICIAL_TRANSITION_SCREEN } from "../../design-system/core-ui/components/loading.js";

export type ProgressEngineVariant = "linear" | "circular" | "terminal";

export interface ProgressEngineSpec {
  id: "progress-engine";
  variants: ProgressEngineVariant[];
  defaultVariant: ProgressEngineVariant;
  component: typeof PROGRESS_COMPONENT;
  terminalSpec: typeof OFFICIAL_TRANSITION_SCREEN.progressBar;
  behavior: {
    determinate: true;
    animateOnReducedMotion: false;
    syncWithTransitionEngine: true;
  };
}

export const PROGRESS_ENGINE_SPEC: ProgressEngineSpec = {
  id: "progress-engine",
  variants: ["linear", "circular", "terminal"],
  defaultVariant: "terminal",
  component: PROGRESS_COMPONENT,
  terminalSpec: OFFICIAL_TRANSITION_SCREEN.progressBar,
  behavior: {
    determinate: true,
    animateOnReducedMotion: false,
    syncWithTransitionEngine: true,
  },
};

export function resolveProgressValue(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress * 100)));
}

export function selectProgressVariant(context: "transition" | "loading" | "inline"): ProgressEngineVariant {
  if (context === "transition") return "terminal";
  if (context === "loading") return "linear";
  return "circular";
}
