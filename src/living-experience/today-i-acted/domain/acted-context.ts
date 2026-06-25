import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingTodayIActedContext {
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

export function buildLivingTodayIActedContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingTodayIActedContext {
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

export function hashActedSeed(dayKey: string, userId: string): number {
  const value = `acted:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolveProfessionalScore(context: LivingTodayIActedContext, actionsCompleted: number): number {
  const hash = hashActedSeed(context.dayKey, context.userId);
  const base = 40 + Math.min(30, actionsCompleted * 8);
  const bg = context.onboarding.professionalBackground;
  const skillBonus = Math.min(15, (bg?.skills.length ?? 0) * 2);
  const variance = hash % 10;
  return Math.min(100, base + skillBonus + variance);
}

export function resolveHoursInvested(context: LivingTodayIActedContext, actionsCompleted: number): number {
  const hash = hashActedSeed(context.dayKey, context.userId);
  return Math.max(1, actionsCompleted * 1.5 + (hash % 3));
}
