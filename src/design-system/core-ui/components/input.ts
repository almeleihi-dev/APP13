import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  STANDARD_INPUT_STATES,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const INPUT_TYPES = ["text", "email", "password", "number", "search", "phone", "multiline"] as const;
export type InputType = (typeof INPUT_TYPES)[number];

export const INPUT_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-input",
  name: "Input",
  purpose: "Text entry field supporting multiple input types with validation states.",
  category: "input",
  variants: INPUT_TYPES.map((type) => ({
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    colors: {
      background: "surface.primary",
      text: "text.primary",
      border: "border.default",
      accent: "border.focus",
    },
  })),
  visualStates: STANDARD_INPUT_STATES,
  interactionStates: STANDARD_INPUT_STATES,
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "textbox" },
  designTokens: ["surface.primary", "text.primary", "border.default", "border.focus", "status.error", "status.success"],
  spacing: { paddingX: "space-16", paddingY: "space-12", minHeight: 48 },
  typography: { primary: "body", secondary: "caption" },
  radius: "medium",
  elevation: "none",
  motion: { duration: "fast", properties: ["border-color", "box-shadow"] },
  responsive: DEFAULT_RESPONSIVE,
};
