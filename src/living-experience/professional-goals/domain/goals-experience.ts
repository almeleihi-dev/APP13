import {
  LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_GOALS_SECTIONS,
} from "./goals-schema.js";
import type { LivingProfessionalGoalsContext } from "./goals-context.js";
import {
  buildAllGoalsSections,
  GOALS_EXPERIENCE_FLAGS,
  type GoalsEngineSnapshot,
  type GoalsHistoryProfile,
  type LivingProfessionalGoalsSection,
  toGoalsSectionView,
  toGoalsSectionsView,
} from "./goals-sections.js";

export interface LivingProfessionalGoalsExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalGoalsContext["geographic"];
  sections: LivingProfessionalGoalsSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalGoalsStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalGoalsValidation {
  valid: boolean;
  goalsReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalGoalsExperience(input: {
  context: LivingProfessionalGoalsContext;
  engines: GoalsEngineSnapshot;
  history: GoalsHistoryProfile;
}): LivingProfessionalGoalsExperience {
  const sections = buildAllGoalsSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "goals_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional goals",
    tagline: "Vision to structured goals. You decide what to pursue.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalGoalsContext(
  context: LivingProfessionalGoalsContext
): LivingProfessionalGoalsValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer goal recommendations");

  return {
    valid: errors.length === 0,
    goalsReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional goals context is ready."
        : `Living professional goals context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalGoalsStatistics(input: {
  experiences: LivingProfessionalGoalsExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalGoalsStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalGoalsSection, { sectionId: "confidence_explanation" }> =>
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

export function findGoalsSection(
  experience: LivingProfessionalGoalsExperience,
  sectionId: LivingProfessionalGoalsSection["sectionId"]
): LivingProfessionalGoalsSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalGoalsView(experience: LivingProfessionalGoalsExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION,
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
    sections: toGoalsSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_GOALS_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...GOALS_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalGoalsStatisticsView(stats: LivingProfessionalGoalsStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toGoalsSectionView, toGoalsSectionsView, GOALS_EXPERIENCE_FLAGS };
