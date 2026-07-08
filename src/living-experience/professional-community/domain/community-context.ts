import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingProfessionalCommunityContext {
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

export function buildLivingProfessionalCommunityContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingProfessionalCommunityContext {
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

export function hashCommunitySeed(dayKey: string, userId: string): number {
  const value = `community:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingProfessionalCommunityContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingProfessionalCommunityContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function computeContributionScore(context: LivingProfessionalCommunityContext, base?: number): number {
  const hash = hashCommunitySeed(context.dayKey, context.userId);
  let score = base ?? 30;
  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed) score += 15;
  if (context.onboarding.professionalCalibration) score += 10;
  score += hash % 12;
  return Math.min(100, score);
}
