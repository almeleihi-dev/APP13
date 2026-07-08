import {
  LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IDENTITY_SECTIONS,
} from "./identity-schema.js";
import type { LivingProfessionalIdentityContext } from "./identity-context.js";
import {
  buildAllIdentitySections,
  type IdentityEngineSnapshot,
  type IdentitySharingPermissions,
  type LivingProfessionalIdentitySection,
  toIdentitySectionView,
  toIdentitySectionsView,
} from "./identity-sections.js";

export interface LivingProfessionalIdentityExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalIdentityContext["geographic"];
  sections: LivingProfessionalIdentitySection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalIdentityStatistics {
  totalExperiences: number;
  averageIdentityScore: number;
  sharingProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalIdentityValidation {
  valid: boolean;
  identityReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalIdentityExperience(input: {
  context: LivingProfessionalIdentityContext;
  engines: IdentityEngineSnapshot;
  permissions: IdentitySharingPermissions;
}): LivingProfessionalIdentityExperience {
  const sections = buildAllIdentitySections(input.context, input.engines, input.permissions);
  const summary = sections.find((s) => s.sectionId === "identity_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional identity",
    tagline: "This is my professional digital identity.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalIdentityContext(
  context: LivingProfessionalIdentityContext
): LivingProfessionalIdentityValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer identity profile");

  return {
    valid: errors.length === 0,
    identityReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional identity context is ready."
        : `Living professional identity context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalIdentityStatistics(input: {
  experiences: LivingProfessionalIdentityExperience[];
  sharingProfiles: number;
  refreshCount: number;
}): LivingProfessionalIdentityStatistics {
  const totalExperiences = input.experiences.length;
  const summarySections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "identity_summary"))
    .filter(
      (s): s is Extract<LivingProfessionalIdentitySection, { sectionId: "identity_summary" }> => Boolean(s)
    );

  const averageIdentityScore =
    summarySections.length === 0
      ? 0
      : Math.round(summarySections.reduce((sum, s) => sum + s.identityScore, 0) / summarySections.length);

  return {
    totalExperiences,
    averageIdentityScore,
    sharingProfiles: input.sharingProfiles,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findIdentitySection(
  experience: LivingProfessionalIdentityExperience,
  sectionId: LivingProfessionalIdentitySection["sectionId"]
): LivingProfessionalIdentitySection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalIdentityView(experience: LivingProfessionalIdentityExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION,
    user_id: experience.userId,
    headline: experience.headline,
    tagline: experience.tagline,
    geographic: {
      country: experience.geographic.country,
      city: experience.geographic.city,
      preferred_work_region: experience.geographic.preferredWorkRegion,
      languages: experience.geographic.languages,
      currency: experience.geographic.currency,
      legal_environment: experience.geographic.legalEnvironment,
      professional_regulations: experience.geographic.professionalRegulations,
      government_programs: experience.geographic.governmentPrograms,
    },
    sections: toIdentitySectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_IDENTITY_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    never_fabricate_achievements: true,
    never_change_identity_automatically: true,
    permission_based: true,
    unified_identity: true,
  };
}

export function toLivingProfessionalIdentityStatisticsView(stats: LivingProfessionalIdentityStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_identity_score: stats.averageIdentityScore,
    sharing_profiles: stats.sharingProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toIdentitySectionView, toIdentitySectionsView };
