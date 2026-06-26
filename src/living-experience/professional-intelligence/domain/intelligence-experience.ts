import {
  LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS,
} from "./intelligence-schema.js";
import type { LivingProfessionalIntelligenceContext } from "./intelligence-context.js";
import {
  buildAllIntelligenceSections,
  type IntelligenceEngineSnapshot,
  type IntelligenceHistoryProfile,
  type LivingProfessionalIntelligenceSection,
  toIntelligenceSectionView,
  toIntelligenceSectionsView,
} from "./intelligence-sections.js";

export interface LivingProfessionalIntelligenceExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalIntelligenceContext["geographic"];
  sections: LivingProfessionalIntelligenceSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalIntelligenceStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalIntelligenceValidation {
  valid: boolean;
  intelligenceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalIntelligenceExperience(input: {
  context: LivingProfessionalIntelligenceContext;
  engines: IntelligenceEngineSnapshot;
  history: IntelligenceHistoryProfile;
}): LivingProfessionalIntelligenceExperience {
  const sections = buildAllIntelligenceSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "intelligence_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional intelligence",
    tagline: "One question. One intelligent answer.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalIntelligenceContext(
  context: LivingProfessionalIntelligenceContext
): LivingProfessionalIntelligenceValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer intelligence");

  return {
    valid: errors.length === 0,
    intelligenceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional intelligence context is ready."
        : `Living professional intelligence context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalIntelligenceStatistics(input: {
  experiences: LivingProfessionalIntelligenceExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalIntelligenceStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalIntelligenceSection, { sectionId: "confidence_explanation" }> =>
        Boolean(s)
    );

  const averageConfidence =
    confidenceSections.length === 0
      ? 0
      : Math.round(
          confidenceSections.reduce((sum, s) => sum + s.confidenceScore, 0) / confidenceSections.length
        );

  return {
    totalExperiences,
    averageConfidence,
    historyProfiles: input.historyProfiles,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findIntelligenceSection(
  experience: LivingProfessionalIntelligenceExperience,
  sectionId: LivingProfessionalIntelligenceSection["sectionId"]
): LivingProfessionalIntelligenceSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalIntelligenceView(experience: LivingProfessionalIntelligenceExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION,
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
    sections: toIntelligenceSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    recommends_only: true,
    never_decides_for_user: true,
    never_fabricate_reasoning: true,
    never_fabricate_data: true,
  };
}

export function toLivingProfessionalIntelligenceStatisticsView(stats: LivingProfessionalIntelligenceStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toIntelligenceSectionView, toIntelligenceSectionsView };
