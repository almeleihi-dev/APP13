import type { SemanticColorTokens } from "../foundation/colors.js";

/** Action Mode — black background, white typography, dark surfaces, blue highlights */
export const ACTION_MODE_COLORS: SemanticColorTokens = {
  background: {
    primary: "#000000",
    secondary: "#0A0A0A",
    tertiary: "#111111",
    inverse: "#FFFFFF",
  },
  surface: {
    primary: "#111111",
    secondary: "#1A1A1A",
    elevated: "#1F1F1F",
    muted: "#262626",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#D1D5DB",
    tertiary: "#9CA3AF",
    inverse: "#000000",
    disabled: "#6B7280",
  },
  accent: {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    highlight: "#2563EB",
  },
  border: {
    default: "#262626",
    subtle: "#1A1A1A",
    focus: "#3B82F6",
  },
  status: {
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
  },
  interactive: {
    default: "#3B82F6",
    hover: "#60A5FA",
    pressed: "#2563EB",
    disabled: "#1E3A5F",
  },
  overlay: {
    scrim: "rgba(0, 0, 0, 0.72)",
    backdrop: "rgba(0, 0, 0, 0.88)",
  },
  transition: {
    start: "#000000",
    mid: "#6B7280",
    end: "#FFFFFF",
  },
};

export const ACTION_MODE_THEME = {
  id: "action-mode" as const,
  name: "Action Mode",
  description: "Execution-oriented mode with dark surfaces and high-contrast typography.",
  colors: ACTION_MODE_COLORS,
};
