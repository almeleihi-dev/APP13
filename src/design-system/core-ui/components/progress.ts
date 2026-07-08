import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const PROGRESS_VARIANTS = ["linear", "circular", "terminal"] as const;
export type ProgressVariant = (typeof PROGRESS_VARIANTS)[number];

export const PROGRESS_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-progress",
  name: "Progress",
  purpose: "Progress indicators including linear, circular, and terminal styles.",
  category: "feedback",
  variants: PROGRESS_VARIANTS.map((variant) => ({
    id: variant,
    name: variant.charAt(0).toUpperCase() + variant.slice(1),
    colors: {
      background: "surface.muted",
      text: "text.secondary",
      border: "border.subtle",
      accent: "accent.primary",
    },
  })),
  visualStates: [{ id: "default" }, { id: "loading" }],
  interactionStates: [{ id: "default" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, supportsKeyboardActivation: false, ariaRole: "progressbar", requiresLabel: true },
  designTokens: ["surface.muted", "accent.primary", "accent.highlight"],
  spacing: { paddingX: "space-4", paddingY: "space-4", minHeight: 4 },
  typography: { primary: "terminal", secondary: "caption" },
  radius: "pill",
  elevation: "none",
  motion: { duration: "extraSlow", properties: ["width", "stroke-dashoffset"] },
  responsive: DEFAULT_RESPONSIVE,
};
