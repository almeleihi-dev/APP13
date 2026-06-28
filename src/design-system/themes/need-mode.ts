import type { SemanticColorTokens } from "../foundation/colors.js";

/** Need Mode — white background, black typography, subtle gray surfaces, blue accents */
export const NEED_MODE_COLORS: SemanticColorTokens = {
  background: {
    primary: "#FFFFFF",
    secondary: "#FAFAFA",
    tertiary: "#F5F5F5",
    inverse: "#000000",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F3F4F6",
    elevated: "#FFFFFF",
    muted: "#E5E7EB",
  },
  text: {
    primary: "#000000",
    secondary: "#374151",
    tertiary: "#6B7280",
    inverse: "#FFFFFF",
    disabled: "#9CA3AF",
  },
  accent: {
    primary: "#2563EB",
    secondary: "#3B82F6",
    highlight: "#1D4ED8",
  },
  border: {
    default: "#E5E7EB",
    subtle: "#F3F4F6",
    focus: "#2563EB",
  },
  status: {
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
  },
  interactive: {
    default: "#2563EB",
    hover: "#1D4ED8",
    pressed: "#1E40AF",
    disabled: "#93C5FD",
  },
  overlay: {
    scrim: "rgba(0, 0, 0, 0.4)",
    backdrop: "rgba(255, 255, 255, 0.8)",
  },
  transition: {
    start: "#FFFFFF",
    mid: "#6B7280",
    end: "#000000",
  },
};

export const NEED_MODE_THEME = {
  id: "need-mode" as const,
  name: "Need Mode",
  description: "Reflective, planning-oriented mode with light surfaces and dark typography.",
  colors: NEED_MODE_COLORS,
};
