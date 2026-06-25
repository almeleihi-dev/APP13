import {
  LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COACH_SECTIONS,
} from "./coach-schema.js";
import type { LivingProfessionalCoachContext } from "./coach-context.js";
import {
  buildAllCoachSections,
  type CoachEngineSnapshot,
  type CoachMemoryProfile,
  type LivingProfessionalCoachSection,
  toCoachSectionView,
  toCoachSectionsView,
} from "./coach-sections.js";

export interface LivingProfessionalCoachExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalCoachContext["geographic"];
  sections: LivingProfessionalCoachSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalCoachStatistics {
  totalExperiences: number;
  averageConfidence: number;
  memoryProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalCoachValidation {
  valid: boolean;
  coachReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalCoachExperience(input: {
  context: LivingProfessionalCoachContext;
  engines: CoachEngineSnapshot;
  memory: CoachMemoryProfile;
}): LivingProfessionalCoachExperience {
  const sections = buildAllCoachSections(input.context, input.engines, input.memory);
  const briefing = sections.find((s) => s.sectionId === "morning_briefing");

  return {
    userId: input.context.userId,
    headline: briefing?.headline ?? "Your professional coach",
    tagline: "What should I do today? Your trusted, explainable guide.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalCoachContext(
  context: LivingProfessionalCoachContext
): LivingProfessionalCoachValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer coach guidance");

  return {
    valid: errors.length === 0,
    coachReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional coach context is ready."
        : `Living professional coach context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalCoachStatistics(input: {
  experiences: LivingProfessionalCoachExperience[];
  memoryProfiles: number;
  refreshCount: number;
}): LivingProfessionalCoachStatistics {
  const totalExperiences = input.experiences.length;
  const forecastSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "todays_achievement_forecast"))
    .filter(
      (s): s is Extract<LivingProfessionalCoachSection, { sectionId: "todays_achievement_forecast" }> => Boolean(s)
    );

  const averageConfidence =
    forecastSections.length === 0
      ? 0
      : Math.round(forecastSections.reduce((sum, s) => sum + s.confidencePercent, 0) / forecastSections.length);

  return {
    totalExperiences,
    averageConfidence,
    memoryProfiles: input.memoryProfiles,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findCoachSection(
  experience: LivingProfessionalCoachExperience,
  sectionId: LivingProfessionalCoachSection["sectionId"]
): LivingProfessionalCoachSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalCoachView(experience: LivingProfessionalCoachExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION,
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
    sections: toCoachSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_COACH_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    recommends_only: true,
    never_decides_for_user: true,
  };
}

export function toLivingProfessionalCoachStatisticsView(stats: LivingProfessionalCoachStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    memory_profiles: stats.memoryProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toCoachSectionView, toCoachSectionsView };
