export const MOTION_DURATIONS = {
  fast: 120,
  normal: 240,
  slow: 400,
  extraSlow: 640,
} as const;

export type MotionDuration = keyof typeof MOTION_DURATIONS;

export const MOTION_EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export type MotionEasing = keyof typeof MOTION_EASING;

export interface MotionToken {
  durationMs: number;
  easing: string;
}

export const MOTION_TOKENS: Record<MotionDuration, MotionToken> = {
  fast: { durationMs: MOTION_DURATIONS.fast, easing: MOTION_EASING.standard },
  normal: { durationMs: MOTION_DURATIONS.normal, easing: MOTION_EASING.standard },
  slow: { durationMs: MOTION_DURATIONS.slow, easing: MOTION_EASING.decelerate },
  extraSlow: { durationMs: MOTION_DURATIONS.extraSlow, easing: MOTION_EASING.emphasized },
};

export function resolveMotionToken(duration: MotionDuration): MotionToken {
  return MOTION_TOKENS[duration];
}

export function motionToCss(duration: MotionDuration, properties = "all"): string {
  const token = resolveMotionToken(duration);
  return `${properties} ${token.durationMs}ms ${token.easing}`;
}
