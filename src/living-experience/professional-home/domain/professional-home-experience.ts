import { PROFESSIONAL_HOME_SCHEMA_VERSION, PROFESSIONAL_HOME_SECTIONS } from "./professional-home-schema.js";
import type { ProfessionalHomeContext } from "./professional-home-context.js";
import {
  buildAllHomeSections,
  type EngineSnapshot,
  type ProfessionalHomeSection,
  toHomeSectionsView,
  toHomeSectionView,
} from "./professional-home-sections.js";

export interface ProfessionalHomeExperience {
  userId: string;
  headline: string;
  primaryQuestion: string;
  geographic: ProfessionalHomeContext["geographic"];
  sections: ProfessionalHomeSection[];
  living: true;
  dayKey: string;
  generatedAt: string;
}

export interface ProfessionalHomeStatistics {
  totalUsers: number;
  averageSections: number;
  refreshCount: number;
  geographicRegions: string[];
  generatedAt: string;
}

export interface ProfessionalHomeValidation {
  valid: boolean;
  guidanceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildProfessionalHomeExperience(input: {
  context: ProfessionalHomeContext;
  engines: EngineSnapshot;
}): ProfessionalHomeExperience {
  const sections = buildAllHomeSections(input.context, input.engines);
  const bestStep = sections.find((s) => s.sectionId === "todays_best_step");

  return {
    userId: input.context.userId,
    headline: bestStep?.headline ?? "What is the best thing I should do right now?",
    primaryQuestion: "What is the best thing I should do right now?",
    geographic: input.context.geographic,
    sections,
    living: true,
    dayKey: input.context.dayKey,
    generatedAt: input.context.generatedAt,
  };
}

export function validateProfessionalHomeContext(context: ProfessionalHomeContext): ProfessionalHomeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.geographic.city) errors.push("city is required");
  if (context.geographic.languages.length === 0) warnings.push("languages improve personalization");

  return {
    valid: errors.length === 0,
    guidanceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Professional home context is ready."
        : `Professional home context incomplete: ${errors.join("; ")}`,
  };
}

export function buildProfessionalHomeStatistics(input: {
  experiences: ProfessionalHomeExperience[];
  refreshCount: number;
}): ProfessionalHomeStatistics {
  const totalUsers = input.experiences.length;
  const averageSections =
    totalUsers === 0
      ? 0
      : Math.round(
          input.experiences.reduce((sum, exp) => sum + exp.sections.length, 0) / totalUsers
        );
  const geographicRegions = [
    ...new Set(input.experiences.map((exp) => exp.geographic.preferredWorkRegion)),
  ];

  return {
    totalUsers,
    averageSections,
    refreshCount: input.refreshCount,
    geographicRegions,
    generatedAt: new Date().toISOString(),
  };
}

export function findHomeSection(
  experience: ProfessionalHomeExperience,
  sectionId: ProfessionalHomeSection["sectionId"]
): ProfessionalHomeSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toProfessionalHomeView(experience: ProfessionalHomeExperience) {
  return {
    schema_version: PROFESSIONAL_HOME_SCHEMA_VERSION,
    user_id: experience.userId,
    headline: experience.headline,
    primary_question: experience.primaryQuestion,
    geographic: {
      country: experience.geographic.country,
      city: experience.geographic.city,
      preferred_work_region: experience.geographic.preferredWorkRegion,
      languages: experience.geographic.languages,
      currency: experience.geographic.currency,
      legal_environment: experience.geographic.legalEnvironment,
      professional_regulations: experience.geographic.professionalRegulations,
      government_programs: experience.geographic.governmentPrograms,
      future_country_target: experience.geographic.futureCountryTarget,
    },
    sections: toHomeSectionsView(experience.sections),
    section_order: [...PROFESSIONAL_HOME_SECTIONS],
    living: experience.living,
    day_key: experience.dayKey,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
  };
}

export function toProfessionalHomeStatisticsView(stats: ProfessionalHomeStatistics) {
  return {
    schema_version: PROFESSIONAL_HOME_SCHEMA_VERSION,
    total_users: stats.totalUsers,
    average_sections: stats.averageSections,
    refresh_count: stats.refreshCount,
    geographic_regions: stats.geographicRegions,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toHomeSectionView, toHomeSectionsView };
