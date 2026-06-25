import type { AuthContext } from "../../../shared/auth/index.js";
import type { GeographicIntelligenceData } from "../../onboarding/domain/onboarding-context.js";

export interface GeographicProfile {
  country: string;
  city: string;
  preferredWorkRegion: string;
  languages: string[];
  currency: string;
  legalEnvironment: string;
  professionalRegulations: string[];
  governmentPrograms: string[];
  futureCountryTarget?: string;
}

export interface ProfessionalHomeContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  geographic: GeographicProfile;
  dayKey: string;
  generatedAt: string;
}

const DEFAULT_GEO_BY_TIER: Record<string, GeographicProfile> = {
  T1: {
    country: "US",
    city: "Austin",
    preferredWorkRegion: "South Central US",
    languages: ["English"],
    currency: "USD",
    legalEnvironment: "US commercial",
    professionalRegulations: ["state_licensing"],
    governmentPrograms: ["workforce_development_grant"],
  },
  T2: {
    country: "US",
    city: "Houston",
    preferredWorkRegion: "Texas Gulf Coast",
    languages: ["English", "Spanish"],
    currency: "USD",
    legalEnvironment: "US commercial",
    professionalRegulations: ["state_licensing", "safety_compliance"],
    governmentPrograms: ["apprenticeship_subsidy", "skills_voucher"],
  },
  T3: {
    country: "US",
    city: "Dallas",
    preferredWorkRegion: "North Texas",
    languages: ["English"],
    currency: "USD",
    legalEnvironment: "US commercial",
    professionalRegulations: ["advanced_trade_license"],
    governmentPrograms: ["small_business_training_grant"],
  },
};

const GOVERNMENT_PROGRAMS_BY_COUNTRY: Record<string, string[]> = {
  US: ["workforce_development_grant", "apprenticeship_subsidy", "skills_voucher"],
  CA: ["provincial_skills_fund", "trade_certification_rebate"],
  GB: ["national_skills_fund", "apprenticeship_levy_support"],
  AE: ["emiratisation_training_support", "professional_upskilling_voucher"],
  default: ["regional_workforce_program"],
};

function resolveDisplayName(userId: string, override?: string): string {
  if (override) return override;
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Professional ${suffix || "USER"}`;
}

function mapGeographicFromOnboarding(data: GeographicIntelligenceData): GeographicProfile {
  const programs =
    GOVERNMENT_PROGRAMS_BY_COUNTRY[data.country] ?? GOVERNMENT_PROGRAMS_BY_COUNTRY.default;
  return {
    country: data.country,
    city: data.city,
    preferredWorkRegion: data.preferredWorkRegion,
    languages: data.languages,
    currency: data.currency,
    legalEnvironment: data.legalEnvironment,
    professionalRegulations: data.professionalRegulations,
    governmentPrograms: programs,
    futureCountryTarget: data.futureCountryTarget,
  };
}

export function buildGeographicProfile(input: {
  tier: string;
  onboardingGeographic?: GeographicIntelligenceData;
}): GeographicProfile {
  if (input.onboardingGeographic) {
    return mapGeographicFromOnboarding(input.onboardingGeographic);
  }
  return DEFAULT_GEO_BY_TIER[input.tier] ?? DEFAULT_GEO_BY_TIER.T1;
}

export function buildProfessionalHomeContext(input: {
  authContext: AuthContext;
  displayName?: string;
  onboardingGeographic?: GeographicIntelligenceData;
  generatedAt?: string;
}): ProfessionalHomeContext {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const dayKey = generatedAt.slice(0, 10);

  return {
    userId: input.authContext.userId,
    roles: [...input.authContext.roles],
    tier: input.authContext.tier,
    displayName: resolveDisplayName(input.authContext.userId, input.displayName),
    geographic: buildGeographicProfile({
      tier: input.authContext.tier,
      onboardingGeographic: input.onboardingGeographic,
    }),
    dayKey,
    generatedAt,
  };
}

export function hashDayUser(dayKey: string, userId: string): number {
  const value = `${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
