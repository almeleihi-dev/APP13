import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  STANDARD_VISUAL_STATES,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const BUTTON_VARIANTS = [
  { id: "primary", name: "Primary", background: "interactive.default" as const, text: "text.inverse" as const, border: "interactive.default" as const },
  { id: "secondary", name: "Secondary", background: "surface.primary" as const, text: "text.primary" as const, border: "border.default" as const, accent: "accent.primary" as const },
  { id: "ghost", name: "Ghost", background: "background.primary" as const, text: "accent.primary" as const, border: "border.subtle" as const },
  { id: "danger", name: "Danger", background: "status.error" as const, text: "text.inverse" as const, border: "status.error" as const },
  { id: "success", name: "Success", background: "status.success" as const, text: "text.inverse" as const, border: "status.success" as const },
  { id: "disabled", name: "Disabled", background: "interactive.disabled" as const, text: "text.disabled" as const, border: "border.subtle" as const },
];

export const BUTTON_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-button",
  name: "Button",
  purpose: "Primary interactive control for actions across Need and Action modes.",
  category: "input",
  variants: BUTTON_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    colors: {
      background: v.background,
      text: v.text,
      border: v.border,
      accent: "accent" in v ? v.accent : undefined,
    },
  })),
  visualStates: STANDARD_VISUAL_STATES,
  interactionStates: STANDARD_VISUAL_STATES,
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "button" },
  designTokens: ["interactive.default", "interactive.hover", "interactive.pressed", "interactive.disabled", "border.focus"],
  spacing: { paddingX: "space-24", paddingY: "space-12", gap: "space-8", minHeight: 48 },
  typography: { primary: "body" },
  radius: "medium",
  elevation: "low",
  motion: { duration: "fast", properties: ["background-color", "border-color", "box-shadow"] },
  responsive: DEFAULT_RESPONSIVE,
};
