import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";
import type { FrameTier } from "./live-frame-schema.js";
import { FRAME_TIER_MIN_SCORES, FRAME_TIERS } from "./live-frame-schema.js";

export interface LivingLiveFrameContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  geographic: GeographicProfile;
  onboarding: OnboardingResponses;
  dayKey: string;
  generatedAt: string;
}

function resolveDisplayName(userId: string, onboarding: OnboardingResponses): string {
  return (
    onboarding.account?.displayName ??
    `Professional ${userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`
  );
}

export function buildLivingLiveFrameContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingLiveFrameContext {
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  return {
    userId: input.authContext.userId,
    roles: [...input.authContext.roles],
    tier: input.authContext.tier,
    displayName: resolveDisplayName(input.authContext.userId, input.onboarding),
    geographic: buildGeographicProfile({
      tier: input.authContext.tier,
      onboardingGeographic: input.onboarding.geographicIntelligence,
    }),
    onboarding: input.onboarding,
    dayKey: generatedAt.slice(0, 10),
    generatedAt,
  };
}

export function hashFrameSeed(dayKey: string, userId: string): number {
  const value = `live-frame:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolveFrameTier(trustScore: number): FrameTier {
  if (trustScore >= FRAME_TIER_MIN_SCORES.PLATINUM_ELITE) return "PLATINUM_ELITE";
  if (trustScore >= FRAME_TIER_MIN_SCORES.EMERALD_PRO) return "EMERALD_PRO";
  if (trustScore >= FRAME_TIER_MIN_SCORES.TRUSTED) return "TRUSTED";
  if (trustScore >= FRAME_TIER_MIN_SCORES.STANDARD) return "STANDARD";
  return "WATCHLIST";
}

export function computeBaseTrustScore(context: LivingLiveFrameContext): number {
  let score = 35;
  const hash = hashFrameSeed(context.dayKey, context.userId);

  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed) score += 8;
  if (iron?.emailVerified) score += 5;
  if (iron?.phoneVerified) score += 3;

  const bg = context.onboarding.professionalBackground;
  if (bg) {
    score += Math.min(12, bg.skills.length * 2);
    score += Math.min(10, bg.certificates.length * 3);
    score += Math.min(12, bg.licenses.length * 4);
    score += Math.min(8, bg.experienceYears);
  }

  const calibration = context.onboarding.professionalCalibration?.missions ?? [];
  if (calibration.length > 0) {
    const avg = calibration.reduce((sum, m) => sum + m.score, 0) / calibration.length;
    score += Math.round(avg * 0.1);
  }

  score += hash % 5;
  return Math.min(100, Math.max(0, score));
}

export function tierIndex(tier: FrameTier): number {
  return FRAME_TIERS.indexOf(tier);
}
