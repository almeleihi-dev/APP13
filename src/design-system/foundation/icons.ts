export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

export const ICON_NAMES = [
  "home",
  "search",
  "profile",
  "settings",
  "timeline",
  "achievement",
  "analytics",
  "live-frame",
  "action",
  "navigation",
  "chevron",
  "close",
  "check",
  "progress",
  "badge",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconToken {
  name: IconName;
  size: IconSize;
  strokeWidth: number;
}

export const DEFAULT_ICON_STROKE = 1.75;

export function resolveIconSize(size: IconSize): number {
  return ICON_SIZES[size];
}
