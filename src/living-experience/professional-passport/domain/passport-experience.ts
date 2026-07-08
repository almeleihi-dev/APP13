import { LIVING_PASSPORT_SCHEMA_VERSION, LIVING_PASSPORT_SECTIONS } from "./passport-schema.js";
import type { LivingPassportContext } from "./passport-context.js";
import {
  buildAllPassportSections,
  type LivingPassportSection,
  type PartnerShareRequest,
  type PassportEngineSnapshot,
  toPassportSectionsView,
  toPassportSectionView,
} from "./passport-sections.js";

export interface LivingProfessionalPassport {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingPassportContext["geographic"];
  sections: LivingPassportSection[];
  living: true;
  lifetimeEvolution: true;
  generatedAt: string;
}

export interface LivingPassportStatistics {
  totalPassports: number;
  averageScore: number;
  partnerSharesApproved: number;
  geographicCountries: string[];
  generatedAt: string;
}

export interface LivingPassportValidation {
  valid: boolean;
  identityReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalPassport(input: {
  context: LivingPassportContext;
  engines: PassportEngineSnapshot;
  approvedPartners: PartnerShareRequest[];
}): LivingProfessionalPassport {
  const sections = buildAllPassportSections(input.context, input.engines, input.approvedPartners);
  const identity = sections.find((s) => s.sectionId === "professional_identity");

  return {
    userId: input.context.userId,
    headline: identity?.headline ?? "Your Living Professional Passport",
    tagline: "One professional. One passport. Lifetime evolution.",
    geographic: input.context.geographic,
    sections,
    living: true,
    lifetimeEvolution: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingPassportContext(context: LivingPassportContext): LivingPassportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.displayName) errors.push("display name is required");
  if (!context.onboarding.account) warnings.push("complete onboarding account step for richer identity");

  return {
    valid: errors.length === 0,
    identityReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living passport context is ready."
        : `Living passport context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingPassportStatistics(input: {
  passports: LivingProfessionalPassport[];
  partnerSharesApproved: number;
}): LivingPassportStatistics {
  const totalPassports = input.passports.length;
  const scores = input.passports
    .map((p) => p.sections.find((s) => s.sectionId === "professional_score"))
    .filter((s): s is Extract<LivingPassportSection, { sectionId: "professional_score" }> => Boolean(s));

  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length);

  return {
    totalPassports,
    averageScore,
    partnerSharesApproved: input.partnerSharesApproved,
    geographicCountries: [...new Set(input.passports.map((p) => p.geographic.country))],
    generatedAt: new Date().toISOString(),
  };
}

export function findPassportSection(
  passport: LivingProfessionalPassport,
  sectionId: LivingPassportSection["sectionId"]
): LivingPassportSection | undefined {
  return passport.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingPassportView(passport: LivingProfessionalPassport) {
  return {
    schema_version: LIVING_PASSPORT_SCHEMA_VERSION,
    user_id: passport.userId,
    headline: passport.headline,
    tagline: passport.tagline,
    geographic: {
      country: passport.geographic.country,
      city: passport.geographic.city,
      preferred_work_region: passport.geographic.preferredWorkRegion,
      languages: passport.geographic.languages,
      currency: passport.geographic.currency,
      legal_environment: passport.geographic.legalEnvironment,
      professional_regulations: passport.geographic.professionalRegulations,
      government_programs: passport.geographic.governmentPrograms,
    },
    sections: toPassportSectionsView(passport.sections),
    section_order: [...LIVING_PASSPORT_SECTIONS],
    living: passport.living,
    lifetime_evolution: passport.lifetimeEvolution,
    generated_at: passport.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    trust_first: true,
  };
}

export function toLivingPassportStatisticsView(stats: LivingPassportStatistics) {
  return {
    schema_version: LIVING_PASSPORT_SCHEMA_VERSION,
    total_passports: stats.totalPassports,
    average_score: stats.averageScore,
    partner_shares_approved: stats.partnerSharesApproved,
    geographic_countries: stats.geographicCountries,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toPassportSectionView, toPassportSectionsView };
