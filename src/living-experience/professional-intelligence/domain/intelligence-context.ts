import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingProfessionalIntelligenceContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  geographic: GeographicProfile;
  onboarding: OnboardingResponses;
  dayKey: string;
  generatedAt: string;
}

const ECONOMIC_CONDITIONS_BY_COUNTRY: Record<string, string> = {
  US: "Strong regional professional services demand",
  UK: "Stable market with growth in skilled trades",
  AE: "Expanding infrastructure professional demand",
  SA: "Growing construction and supervision sector",
};

const MARKET_DEMAND_BY_COUNTRY: Record<string, string> = {
  US: "High demand for verified construction professionals",
  UK: "Steady demand for licensed project professionals",
  AE: "Strong demand for certified safety professionals",
  SA: "Rising demand for licensed supervisors",
};

function resolveDisplayName(userId: string, onboarding: OnboardingResponses): string {
  return (
    onboarding.account?.displayName ??
    `Professional ${userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`
  );
}

export function buildLivingProfessionalIntelligenceContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingProfessionalIntelligenceContext {
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

export function hashIntelligenceSeed(dayKey: string, userId: string): number {
  const value = `intelligence:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingProfessionalIntelligenceContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingProfessionalIntelligenceContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function resolveFrameStanding(context: LivingProfessionalIntelligenceContext): string {
  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed && iron.emailVerified) return "Trusted frame active";
  return "Frame building";
}

export function resolveEconomicConditions(context: LivingProfessionalIntelligenceContext): string {
  return ECONOMIC_CONDITIONS_BY_COUNTRY[context.geographic.country] ?? "Regional professional market";
}

export function resolveMarketDemand(context: LivingProfessionalIntelligenceContext): string {
  return MARKET_DEMAND_BY_COUNTRY[context.geographic.country] ?? `Demand for ${resolvePrimarySkill(context)}`;
}
