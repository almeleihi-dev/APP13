import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingActionPlannerContext {
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

const PUBLIC_HOLIDAYS_HINT_BY_COUNTRY: Record<string, string> = {
  US: "Federal holidays may affect government service availability",
  UK: "Bank holidays may affect professional scheduling",
  AE: "National holidays follow the local working week",
  SA: "National holidays follow the local working week",
};

function resolveDisplayName(userId: string, onboarding: OnboardingResponses): string {
  return (
    onboarding.account?.displayName ??
    `Professional ${userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`
  );
}

export function buildLivingActionPlannerContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingActionPlannerContext {
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

export function hashPlannerSeed(dayKey: string, userId: string): number {
  const value = `planner:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingActionPlannerContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingActionPlannerContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function resolveWorkingWeek(context: LivingActionPlannerContext): string {
  return WORKING_WEEK_BY_COUNTRY[context.geographic.country] ?? "Monday–Friday";
}

export function resolvePublicHolidayHint(context: LivingActionPlannerContext): string {
  return PUBLIC_HOLIDAYS_HINT_BY_COUNTRY[context.geographic.country] ?? "Check local public holidays for scheduling";
}

export function resolveGovernmentServices(context: LivingActionPlannerContext): string[] {
  const country = context.geographic.country;
  const programs = context.geographic.governmentPrograms ?? [];
  if (programs.length > 0) return programs;
  return [`${country} professional licensing portal`, `${country} business registration services`];
}
