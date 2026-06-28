import {
  DEFAULT_ACCESSIBILITY,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";
import { AN_ACT_TRANSITION_FLOW } from "../../foundation/transitions.js";
import { TERMINAL_TYPOGRAPHY_USAGE } from "../../foundation/typography.js";

export const TRANSITION_STAGE_TEXTS = [
  "Preparing...",
  "Matching...",
  "Building Contract...",
  "Securing...",
  "Action Ready.",
] as const;

export type TransitionStageText = (typeof TRANSITION_STAGE_TEXTS)[number];

export const LOADING_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-loading",
  name: "Official Transition Screen",
  purpose: "Official AN ACT loading and mode transition screen with terminal typography and dynamic stage text.",
  category: "feedback",
  variants: [
    {
      id: "need-to-action",
      name: "Need to Action",
      colors: {
        background: "transition.start",
        text: "text.primary",
        border: "border.subtle",
        accent: "accent.primary",
      },
    },
    {
      id: "action-to-need",
      name: "Action to Need",
      colors: {
        background: "transition.end",
        text: "text.inverse",
        border: "border.subtle",
        accent: "accent.highlight",
      },
    },
  ],
  visualStates: [{ id: "default" }, { id: "loading" }],
  interactionStates: [{ id: "default" }],
  accessibility: {
    ...DEFAULT_ACCESSIBILITY,
    supportsKeyboardActivation: false,
    ariaRole: "status",
    requiresLabel: true,
  },
  designTokens: [
    "transition.start",
    "transition.mid",
    "transition.end",
    "accent.primary",
    "surface.muted",
    "text.primary",
    "text.inverse",
  ],
  spacing: { paddingX: "space-24", paddingY: "space-32", gap: "space-16", minHeight: 0 },
  typography: { primary: "terminal", secondary: "terminal" },
  radius: "medium",
  elevation: "none",
  motion: { duration: "extraSlow", properties: ["background-color", "opacity"] },
  responsive: {
    compact: { paddingX: "space-16", paddingY: "space-24" },
    regular: { paddingX: "space-24", paddingY: "space-32" },
    expanded: { paddingX: "space-32", paddingY: "space-48" },
  },
};

export const OFFICIAL_TRANSITION_SCREEN = {
  brandLine: TERMINAL_TYPOGRAPHY_USAGE.transitionBrandLine,
  stageTexts: TRANSITION_STAGE_TEXTS,
  defaultStageText: "Preparing..." as TransitionStageText,
  flow: AN_ACT_TRANSITION_FLOW,
  backgroundInterpolation: {
    forward: ["transition.start", "transition.mid", "transition.end"] as const,
    reverse: ["transition.end", "transition.mid", "transition.start"] as const,
  },
  progressBar: AN_ACT_TRANSITION_FLOW.forward.progressBar,
  component: LOADING_COMPONENT,
} as const;
