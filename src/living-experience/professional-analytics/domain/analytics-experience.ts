import {
  LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_ANALYTICS_SECTIONS,
} from "./analytics-schema.js";
import type { LivingProfessionalAnalyticsContext } from "./analytics-context.js";
import {
  buildAllAnalyticsSections,
  ANALYTICS_EXPERIENCE_FLAGS,
  type AnalyticsEngineSnapshot,
  type AnalyticsHistoryProfile,
  type LivingProfessionalAnalyticsSection,
  toAnalyticsSectionView,
  toAnalyticsSectionsView,
} from "./analytics-sections.js";

export interface LivingProfessionalAnalyticsExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalAnalyticsContext["geographic"];
  sections: LivingProfessionalAnalyticsSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalAnalyticsStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalAnalyticsValidation {
  valid: boolean;
  analyticsReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalAnalyticsExperience(input: {
  context: LivingProfessionalAnalyticsContext;
  engines: AnalyticsEngineSnapshot;
  history: AnalyticsHistoryProfile;
}): LivingProfessionalAnalyticsExperience {
  const sections = buildAllAnalyticsSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "analytics_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional analytics",
    tagline: "Meaningful insights. You interpret and decide.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalAnalyticsContext(
  context: LivingProfessionalAnalyticsContext
): LivingProfessionalAnalyticsValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer analytics");

  return {
    valid: errors.length === 0,
    analyticsReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional analytics context is ready."
        : `Living professional analytics context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalAnalyticsStatistics(input: {
  experiences: LivingProfessionalAnalyticsExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalAnalyticsStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalAnalyticsSection, { sectionId: "confidence_explanation" }> =>
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

export function findAnalyticsSection(
  experience: LivingProfessionalAnalyticsExperience,
  sectionId: LivingProfessionalAnalyticsSection["sectionId"]
): LivingProfessionalAnalyticsSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalAnalyticsView(experience: LivingProfessionalAnalyticsExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION,
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
    sections: toAnalyticsSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_ANALYTICS_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...ANALYTICS_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalAnalyticsStatisticsView(stats: LivingProfessionalAnalyticsStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toAnalyticsSectionView, toAnalyticsSectionsView, ANALYTICS_EXPERIENCE_FLAGS };
