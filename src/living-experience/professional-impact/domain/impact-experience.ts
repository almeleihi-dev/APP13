import {
  LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IMPACT_SECTIONS,
} from "./impact-schema.js";
import type { LivingProfessionalImpactContext } from "./impact-context.js";
import {
  buildAllImpactSections,
  type ImpactEngineSnapshot,
  type LivingProfessionalImpactSection,
  toImpactSectionView,
  toImpactSectionsView,
} from "./impact-sections.js";

export interface LivingProfessionalImpactExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalImpactContext["geographic"];
  sections: LivingProfessionalImpactSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalImpactStatistics {
  totalExperiences: number;
  averageConfidence: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalImpactValidation {
  valid: boolean;
  impactReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalImpactExperience(input: {
  context: LivingProfessionalImpactContext;
  engines: ImpactEngineSnapshot;
}): LivingProfessionalImpactExperience {
  const sections = buildAllImpactSections(input.context, input.engines);
  const summary = sections.find((s) => s.sectionId === "professional_impact_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional impact",
    tagline: "How has my professional life improved because of my actions?",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalImpactContext(
  context: LivingProfessionalImpactContext
): LivingProfessionalImpactValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer impact measurement");

  return {
    valid: errors.length === 0,
    impactReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional impact context is ready."
        : `Living professional impact context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalImpactStatistics(input: {
  experiences: LivingProfessionalImpactExperience[];
  refreshCount: number;
}): LivingProfessionalImpactStatistics {
  const totalExperiences = input.experiences.length;
  const summarySections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "professional_impact_summary"))
    .filter(
      (s): s is Extract<LivingProfessionalImpactSection, { sectionId: "professional_impact_summary" }> => Boolean(s)
    );

  const averageConfidence =
    summarySections.length === 0
      ? 0
      : Math.round(summarySections.reduce((sum, s) => sum + s.confidence, 0) / summarySections.length);

  return {
    totalExperiences,
    averageConfidence,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findImpactSection(
  experience: LivingProfessionalImpactExperience,
  sectionId: LivingProfessionalImpactSection["sectionId"]
): LivingProfessionalImpactSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalImpactView(experience: LivingProfessionalImpactExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION,
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
    sections: toImpactSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_IMPACT_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    never_manipulate_metrics: true,
    never_fabricate_achievements: true,
    measures_only: true,
  };
}

export function toLivingProfessionalImpactStatisticsView(stats: LivingProfessionalImpactStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toImpactSectionView, toImpactSectionsView };
