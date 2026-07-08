import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingProfessionalCoachContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  geographic: GeographicProfile;
  onboarding: OnboardingResponses;
  dayKey: string;
  generatedAt: string;
}

const WORKING_WEEK_BY_COUNTRY: Record<string, string> = {
  US: "Monday–Friday",
  UK: "Monday–Friday",
  AE: "Sunday–Thursday",
  SA: "Sunday–Thursday",
};

function resolveDisplayName(userId: string, onboarding: OnboardingResponses): string {
  return (
    onboarding.account?.displayName ??
    `Professional ${userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`
  );
}

export function buildLivingProfessionalCoachContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingProfessionalCoachContext {
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

export function hashCoachSeed(dayKey: string, userId: string): number {
  const value = `coach:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingProfessionalCoachContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingProfessionalCoachContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function resolveWorkingWeek(context: LivingProfessionalCoachContext): string {
  return WORKING_WEEK_BY_COUNTRY[context.geographic.country] ?? "Monday–Friday";
}

export function resolveMomentum(_context: LivingProfessionalCoachContext, readiness?: number): string {
  const score = readiness ?? 50;
  if (score >= 70) return "Strong momentum";
  if (score >= 50) return "Steady progress";
  return "Building momentum";
}

export function resolveFrameStatus(context: LivingProfessionalCoachContext): string {
  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed && iron.emailVerified) return "Trusted frame active";
  return "Frame building — complete verification";
}

export function resolveJourneyStatus(context: LivingProfessionalCoachContext): string {
  const years = context.onboarding.professionalBackground?.experienceYears ?? 0;
  if (years >= 10) return "Established journey";
  if (years >= 5) return "Growing journey";
  return "Foundation building";
}
