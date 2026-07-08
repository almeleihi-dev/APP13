import {
  LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
  LIVING_PARTNER_ECOSYSTEM_SECTIONS,
} from "./partner-schema.js";
import type { LivingPartnerEcosystemContext } from "./partner-context.js";
import {
  buildAllPartnerEcosystemSections,
  type PartnerEngineSnapshot,
  type LivingPartnerEcosystemSection,
  type ConnectedPartner,
  type PermissionHistoryEntry,
  toPartnerSectionView,
  toPartnerSectionsView,
} from "./partner-sections.js";

export interface LivingPartnerEcosystemExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingPartnerEcosystemContext["geographic"];
  sections: LivingPartnerEcosystemSection[];
  living: true;
  generatedAt: string;
}

export interface LivingPartnerEcosystemStatistics {
  totalExperiences: number;
  averageEligibilityScore: number;
  connectedCount: number;
  pendingCount: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingPartnerEcosystemValidation {
  valid: boolean;
  ecosystemReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingPartnerEcosystemExperience(input: {
  context: LivingPartnerEcosystemContext;
  engines: PartnerEngineSnapshot;
  connected?: {
    approved: ConnectedPartner[];
    pending: ConnectedPartner[];
    expired: ConnectedPartner[];
    permissionHistory: PermissionHistoryEntry[];
  };
}): LivingPartnerEcosystemExperience {
  const connected = input.connected ?? {
    approved: [],
    pending: [],
    expired: [],
    permissionHistory: [],
  };
  const sections = buildAllPartnerEcosystemSections(input.context, input.engines, connected);
  const best = sections.find((s) => s.sectionId === "todays_best_partner");

  return {
    userId: input.context.userId,
    headline: best?.headline ?? "Your partner ecosystem",
    tagline: "Who is the best partner for you right now?",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingPartnerEcosystemContext(
  context: LivingPartnerEcosystemContext
): LivingPartnerEcosystemValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer partner matching");

  return {
    valid: errors.length === 0,
    ecosystemReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living partner ecosystem context is ready."
        : `Living partner ecosystem context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingPartnerEcosystemStatistics(input: {
  experiences: LivingPartnerEcosystemExperience[];
  connectedCount: number;
  pendingCount: number;
  refreshCount: number;
}): LivingPartnerEcosystemStatistics {
  const totalExperiences = input.experiences.length;
  const eligibilitySections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "eligibility_analysis"))
    .filter(
      (s): s is Extract<LivingPartnerEcosystemSection, { sectionId: "eligibility_analysis" }> => Boolean(s)
    );

  const averageEligibilityScore =
    eligibilitySections.length === 0
      ? 0
      : Math.round(
          eligibilitySections.reduce((sum, s) => sum + s.eligibilityScore, 0) / eligibilitySections.length
        );

  return {
    totalExperiences,
    averageEligibilityScore,
    connectedCount: input.connectedCount,
    pendingCount: input.pendingCount,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findPartnerSection(
  experience: LivingPartnerEcosystemExperience,
  sectionId: LivingPartnerEcosystemSection["sectionId"]
): LivingPartnerEcosystemSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingPartnerEcosystemView(experience: LivingPartnerEcosystemExperience) {
  return {
    schema_version: LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
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
    sections: toPartnerSectionsView(experience.sections),
    section_order: [...LIVING_PARTNER_ECOSYSTEM_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    recommendations_only: true,
    partners_execute: true,
    neutral_ecosystem: true,
  };
}

export function toLivingPartnerEcosystemStatisticsView(stats: LivingPartnerEcosystemStatistics) {
  return {
    schema_version: LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_eligibility_score: stats.averageEligibilityScore,
    connected_count: stats.connectedCount,
    pending_count: stats.pendingCount,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toPartnerSectionView, toPartnerSectionsView };
