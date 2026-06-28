import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

const OVERLAY_BASE: CoreUiComponentDefinition = {
  id: "core-ui-overlay-base",
  name: "Overlay Base",
  purpose: "Base overlay surface for modal patterns.",
  category: "overlay",
  variants: [
    {
      id: "default",
      name: "Default",
      colors: { background: "surface.elevated", text: "text.primary", border: "border.subtle", accent: "accent.primary" },
    },
  ],
  visualStates: [{ id: "default" }, { id: "focused" }],
  interactionStates: [{ id: "default" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "dialog" },
  designTokens: ["surface.elevated", "overlay.scrim", "overlay.backdrop", "text.primary"],
  spacing: { paddingX: "space-24", paddingY: "space-24", gap: "space-16", minHeight: 0 },
  typography: { primary: "title", secondary: "body" },
  radius: "large",
  elevation: "highest",
  motion: { duration: "normal", properties: ["opacity", "transform"] },
  responsive: DEFAULT_RESPONSIVE,
};

export const MODAL_COMPONENT: CoreUiComponentDefinition = {
  ...OVERLAY_BASE,
  id: "core-ui-modal",
  name: "Modal",
  purpose: "Centered modal overlay for focused tasks and confirmations.",
};

export const DIALOG_COMPONENT: CoreUiComponentDefinition = {
  ...OVERLAY_BASE,
  id: "core-ui-dialog",
  name: "Dialog",
  purpose: "Compact dialog for decisions requiring explicit user confirmation.",
  spacing: { paddingX: "space-20", paddingY: "space-20", gap: "space-12", minHeight: 0 },
  radius: "medium",
  elevation: "high",
};

export const SHEET_COMPONENT: CoreUiComponentDefinition = {
  ...OVERLAY_BASE,
  id: "core-ui-sheet",
  name: "Bottom Sheet",
  purpose: "Bottom sheet overlay for contextual actions and secondary flows.",
  spacing: { paddingX: "space-16", paddingY: "space-24", gap: "space-16", minHeight: 0 },
  radius: "extraLarge",
  motion: { duration: "slow", properties: ["transform"] },
};

export const TOAST_COMPONENT: CoreUiComponentDefinition = {
  ...OVERLAY_BASE,
  id: "core-ui-toast",
  name: "Toast",
  purpose: "Transient notification toast for non-blocking feedback.",
  spacing: { paddingX: "space-16", paddingY: "space-12", gap: "space-8", minHeight: 44 },
  typography: { primary: "body", secondary: "caption" },
  radius: "medium",
  elevation: "high",
  motion: { duration: "fast", properties: ["opacity", "transform"] },
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "status", supportsKeyboardActivation: false },
};
