export const RADIUS_TOKENS = {
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  pill: 9999,
  circle: "50%",
} as const;

export type RadiusToken = keyof typeof RADIUS_TOKENS;

export type RadiusValue = (typeof RADIUS_TOKENS)[RadiusToken];
