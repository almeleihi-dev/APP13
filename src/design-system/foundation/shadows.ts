import type { ElevationLevel } from "./elevation.js";

export interface ShadowToken {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export const SHADOW_TOKENS: Record<
  "shadow-none" | "shadow-low" | "shadow-medium" | "shadow-high" | "shadow-highest",
  ShadowToken
> = {
  "shadow-none": { offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: "transparent" },
  "shadow-low": { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: "rgba(0, 0, 0, 0.06)" },
  "shadow-medium": { offsetX: 0, offsetY: 4, blur: 8, spread: -2, color: "rgba(0, 0, 0, 0.08)" },
  "shadow-high": { offsetX: 0, offsetY: 8, blur: 16, spread: -4, color: "rgba(0, 0, 0, 0.12)" },
  "shadow-highest": { offsetX: 0, offsetY: 16, blur: 32, spread: -8, color: "rgba(0, 0, 0, 0.16)" },
};

export function shadowTokenToCss(token: ShadowToken): string {
  if (token.color === "transparent") return "none";
  return `${token.offsetX}px ${token.offsetY}px ${token.blur}px ${token.spread}px ${token.color}`;
}

export function elevationToShadow(level: ElevationLevel, mode: "need" | "action"): string {
  const key = {
    none: "shadow-none",
    low: "shadow-low",
    medium: "shadow-medium",
    high: "shadow-high",
    highest: "shadow-highest",
  }[level] as keyof typeof SHADOW_TOKENS;
  const token = SHADOW_TOKENS[key];
  const actionAlpha = mode === "action";
  return shadowTokenToCss({
    ...token,
    blur: actionAlpha ? Math.round(token.blur * 1.4) : token.blur,
    color: actionAlpha ? "rgba(0, 0, 0, 0.32)" : token.color,
  });
}
