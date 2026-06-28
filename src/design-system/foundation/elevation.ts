export const ELEVATION_LEVELS = ["none", "low", "medium", "high", "highest"] as const;

export type ElevationLevel = (typeof ELEVATION_LEVELS)[number];

export interface ElevationToken {
  level: ElevationLevel;
  zIndex: number;
  shadowToken: string;
}

export const ELEVATION_TOKENS: Record<ElevationLevel, ElevationToken> = {
  none: { level: "none", zIndex: 0, shadowToken: "shadow-none" },
  low: { level: "low", zIndex: 1, shadowToken: "shadow-low" },
  medium: { level: "medium", zIndex: 4, shadowToken: "shadow-medium" },
  high: { level: "high", zIndex: 8, shadowToken: "shadow-high" },
  highest: { level: "highest", zIndex: 16, shadowToken: "shadow-highest" },
};

/** Elevation must always pair with a defined shadow token — no arbitrary shadows. */
export function resolveElevation(level: ElevationLevel): ElevationToken {
  return ELEVATION_TOKENS[level];
}
