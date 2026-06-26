import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingProfessionalIdentityContext {
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

export function buildLivingProfessionalIdentityContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingProfessionalIdentityContext {
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

export function hashIdentitySeed(dayKey: string, userId: string): number {
  const value = `identity:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingProfessionalIdentityContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingProfessionalIdentityContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function resolveProfessionalTitle(context: LivingProfessionalIdentityContext): string {
  const years = context.onboarding.professionalBackground?.experienceYears ?? 0;
  const skill = resolvePrimarySkill(context);
  if (years >= 10) return `Senior ${skill} professional`;
  if (years >= 5) return `Experienced ${skill} professional`;
  return `${skill} professional`;
}

export function resolveCurrentLevel(_context: LivingProfessionalIdentityContext, readiness?: number): string {
  const score = readiness ?? 50;
  if (score >= 75) return "Expert level";
  if (score >= 60) return "Advanced level";
  if (score >= 45) return "Professional level";
  return "Foundation level";
}

export function resolveFrameStanding(context: LivingProfessionalIdentityContext): string {
  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed && iron.emailVerified) return "Trusted frame";
  return "Building frame";
}

export function resolveGovernmentPrograms(context: LivingProfessionalIdentityContext): string[] {
  const programs = context.geographic.governmentPrograms ?? [];
  if (programs.length > 0) return programs;
  return [`${context.geographic.country} professional licensing`, `${context.geographic.country} workforce programs`];
}
