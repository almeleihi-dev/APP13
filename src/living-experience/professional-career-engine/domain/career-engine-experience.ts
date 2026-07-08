import {
  LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS,
} from "./career-engine-schema.js";
import type { LivingProfessionalCareerEngineContext } from "./career-engine-context.js";
import {
  buildAllCareerEngineSections,
  CAREER_ENGINE_EXPERIENCE_FLAGS,
  type CareerEngineSnapshot,
  type CareerEngineHistoryProfile,
  type LivingProfessionalCareerEngineSection,
  toCareerEngineSectionView,
  toCareerEngineSectionsView,
} from "./career-engine-sections.js";

export interface LivingProfessionalCareerEngineExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalCareerEngineContext["geographic"];
  sections: LivingProfessionalCareerEngineSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalCareerEngineStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalCareerEngineValidation {
  valid: boolean;
  careerEngineReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalCareerEngineExperience(input: {
  context: LivingProfessionalCareerEngineContext;
  engines: CareerEngineSnapshot;
  history: CareerEngineHistoryProfile;
}): LivingProfessionalCareerEngineExperience {
  const sections = buildAllCareerEngineSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "career_engine_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your career reasoning engine",
    tagline: "Recommendations only. You decide every career move.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalCareerEngineContext(
  context: LivingProfessionalCareerEngineContext
): LivingProfessionalCareerEngineValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer career reasoning");

  return {
    valid: errors.length === 0,
    careerEngineReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living career engine context is ready."
        : `Living career engine context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalCareerEngineStatistics(input: {
  experiences: LivingProfessionalCareerEngineExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalCareerEngineStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalCareerEngineSection, { sectionId: "confidence_explanation" }> =>
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

export function findCareerEngineSection(
  experience: LivingProfessionalCareerEngineExperience,
  sectionId: LivingProfessionalCareerEngineSection["sectionId"]
): LivingProfessionalCareerEngineSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalCareerEngineView(experience: LivingProfessionalCareerEngineExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION,
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
    sections: toCareerEngineSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...CAREER_ENGINE_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalCareerEngineStatisticsView(
  stats: LivingProfessionalCareerEngineStatistics
) {
  return {
    schema_version: LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toCareerEngineSectionView, toCareerEngineSectionsView, CAREER_ENGINE_EXPERIENCE_FLAGS };
