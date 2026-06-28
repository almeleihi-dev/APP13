export const SPACING_SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export type SpacingToken = (typeof SPACING_SCALE)[number];

export const SPACING_TOKENS: Record<`space-${SpacingToken}`, number> = {
  "space-4": 4,
  "space-8": 8,
  "space-12": 12,
  "space-16": 16,
  "space-20": 20,
  "space-24": 24,
  "space-32": 32,
  "space-40": 40,
  "space-48": 48,
  "space-64": 64,
};

export type SpacingTokenName = keyof typeof SPACING_TOKENS;
