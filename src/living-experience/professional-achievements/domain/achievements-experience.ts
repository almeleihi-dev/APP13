import {
  LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS,
} from "./achievements-schema.js";
import type { LivingProfessionalAchievementsContext } from "./achievements-context.js";
import {
  buildAllAchievementsSections,
  ACHIEVEMENTS_EXPERIENCE_FLAGS,
  type AchievementsEngineSnapshot,
  type AchievementHistoryProfile,
  type LivingProfessionalAchievementsSection,
  toAchievementsSectionView,
  toAchievementsSectionsView,
} from "./achievements-sections.js";

export interface LivingProfessionalAchievementsExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalAchievementsContext["geographic"];
  sections: LivingProfessionalAchievementsSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalAchievementsStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalAchievementsValidation {
  valid: boolean;
  achievementsReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalAchievementsExperience(input: {
  context: LivingProfessionalAchievementsContext;
  engines: AchievementsEngineSnapshot;
  history: AchievementHistoryProfile;
}): LivingProfessionalAchievementsExperience {
  const sections = buildAllAchievementsSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "achievements_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional achievements",
    tagline: "Living achievement portfolio. You control recognition.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalAchievementsContext(
  context: LivingProfessionalAchievementsContext
): LivingProfessionalAchievementsValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer achievement portfolio");

  return {
    valid: errors.length === 0,
    achievementsReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional achievements context is ready."
        : `Living professional achievements context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalAchievementsStatistics(input: {
  experiences: LivingProfessionalAchievementsExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalAchievementsStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalAchievementsSection, { sectionId: "confidence_explanation" }> =>
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

export function findAchievementsSection(
  experience: LivingProfessionalAchievementsExperience,
  sectionId: LivingProfessionalAchievementsSection["sectionId"]
): LivingProfessionalAchievementsSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalAchievementsView(experience: LivingProfessionalAchievementsExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION,
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
    sections: toAchievementsSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalAchievementsStatisticsView(
  stats: LivingProfessionalAchievementsStatistics
) {
  return {
    schema_version: LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toAchievementsSectionView, toAchievementsSectionsView, ACHIEVEMENTS_EXPERIENCE_FLAGS };
