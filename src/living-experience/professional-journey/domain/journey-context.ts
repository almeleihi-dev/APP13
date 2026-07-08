import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";
import type { JourneyStage } from "./journey-schema.js";
import { JOURNEY_STAGES } from "./journey-schema.js";
import type { FrameTier } from "../../live-frame/domain/live-frame-schema.js";
import { FRAME_TIER_LABELS, FRAME_TIER_MIN_SCORES } from "../../live-frame/domain/live-frame-schema.js";

function computeJourneyTrustScore(context: LivingJourneyContext): number {
  let score = 35;
  const hash = hashJourneySeed(context.dayKey, context.userId);
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
  score += hash % 5;
  return Math.min(100, Math.max(0, score));
}

function resolveJourneyFrameTier(trustScore: number): FrameTier {
  if (trustScore >= FRAME_TIER_MIN_SCORES.PLATINUM_ELITE) return "PLATINUM_ELITE";
  if (trustScore >= FRAME_TIER_MIN_SCORES.EMERALD_PRO) return "EMERALD_PRO";
  if (trustScore >= FRAME_TIER_MIN_SCORES.TRUSTED) return "TRUSTED";
  if (trustScore >= FRAME_TIER_MIN_SCORES.STANDARD) return "STANDARD";
  return "WATCHLIST";
}

export interface LivingJourneyContext {
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

export function buildLivingJourneyContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingJourneyContext {
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

export function hashJourneySeed(dayKey: string, userId: string): number {
  const value = `journey:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolveJourneyStage(context: LivingJourneyContext): JourneyStage {
  const trust = computeJourneyTrustScore(context);
  const bg = context.onboarding.professionalBackground;
  const years = bg?.experienceYears ?? 0;

  if (years >= 15 && trust >= 75) return "industry_leader";
  if (years >= 8 && trust >= 60) return "established_professional";
  if (trust >= 55 && (bg?.licenses.length ?? 0) > 0) return "marketplace_ready";
  if (trust >= 45) return "professional_growth";
  if (context.onboarding.professionalCalibration) return "gaining_momentum";
  if (context.onboarding.account) return "building_foundation";
  return "starting";
}

export function resolveYearsActive(context: LivingJourneyContext): number {
  return Math.max(1, context.onboarding.professionalBackground?.experienceYears ?? 1);
}

export function resolveJourneyName(context: LivingJourneyContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0]?.replace(/_/g, " ") ?? "Professional";
  return `${context.displayName}'s ${industry} Journey`;
}

export function resolveCurrentLevel(context: LivingJourneyContext): string {
  const stage = resolveJourneyStage(context);
  return stage.replace(/_/g, " ");
}

export function resolveLiveFrameLabel(context: LivingJourneyContext): string {
  return FRAME_TIER_LABELS[resolveJourneyFrameTier(computeJourneyTrustScore(context))];
}

export function resolvePassportStatus(context: LivingJourneyContext): string {
  const tier = context.tier;
  if (tier === "T3") return "silver_passport";
  if (tier === "T2") return "bronze_passport";
  return "starter_passport";
}

export function resolveReadiness(context: LivingJourneyContext): number {
  return Math.min(100, computeJourneyTrustScore(context) + 5);
}

export function computeJourneyTrust(context: LivingJourneyContext): number {
  return computeJourneyTrustScore(context);
}

export function stageIndex(stage: JourneyStage): number {
  return JOURNEY_STAGES.indexOf(stage);
}
