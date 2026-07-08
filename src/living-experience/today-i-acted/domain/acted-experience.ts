import { LIVING_TODAY_I_ACTED_SCHEMA_VERSION, LIVING_TODAY_I_ACTED_SECTIONS } from "./acted-schema.js";
import type { LivingTodayIActedContext } from "./acted-context.js";
import {
  buildAllActedSections,
  type ActedEngineSnapshot,
  type LivingTodayIActedSection,
  type ProfessionalMemoryEntry,
  toActedSectionView,
  toActedSectionsView,
} from "./acted-sections.js";

export interface LivingTodayIActedExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingTodayIActedContext["geographic"];
  sections: LivingTodayIActedSection[];
  living: true;
  generatedAt: string;
}

export interface LivingTodayIActedStatistics {
  totalExperiences: number;
  averageProfessionalScore: number;
  totalMemoriesStored: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingTodayIActedValidation {
  valid: boolean;
  experienceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingTodayIActedExperience(input: {
  context: LivingTodayIActedContext;
  engines: ActedEngineSnapshot;
  memoryEntries?: ProfessionalMemoryEntry[];
}): LivingTodayIActedExperience {
  const sections = buildAllActedSections(input.context, input.engines, input.memoryEntries ?? []);
  const story = sections.find((s) => s.sectionId === "todays_story");

  return {
    userId: input.context.userId,
    headline: story?.headline ?? "Today I Acted",
    tagline: "Every action becomes part of your professional story.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingTodayIActedContext(context: LivingTodayIActedContext): LivingTodayIActedValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer daily experience");

  return {
    valid: errors.length === 0,
    experienceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living daily experience context is ready."
        : `Living daily experience context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingTodayIActedStatistics(input: {
  experiences: LivingTodayIActedExperience[];
  memoryCount: number;
  refreshCount: number;
}): LivingTodayIActedStatistics {
  const totalExperiences = input.experiences.length;
  const summarySections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "todays_summary"))
    .filter((s): s is Extract<LivingTodayIActedSection, { sectionId: "todays_summary" }> => Boolean(s));

  const averageProfessionalScore =
    summarySections.length === 0
      ? 0
      : Math.round(summarySections.reduce((sum, s) => sum + s.professionalScore, 0) / summarySections.length);

  return {
    totalExperiences,
    averageProfessionalScore,
    totalMemoriesStored: input.memoryCount,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findActedSection(
  experience: LivingTodayIActedExperience,
  sectionId: LivingTodayIActedSection["sectionId"]
): LivingTodayIActedSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function searchProfessionalMemories(
  entries: ProfessionalMemoryEntry[],
  query: string
): ProfessionalMemoryEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...entries].sort((a, b) => b.dayKey.localeCompare(a.dayKey));

  return entries
    .filter((entry) => entry.searchableText.includes(normalized) || entry.dayKey.includes(normalized))
    .sort((a, b) => b.dayKey.localeCompare(a.dayKey));
}

export function toLivingTodayIActedView(experience: LivingTodayIActedExperience) {
  return {
    schema_version: LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
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
    sections: toActedSectionsView(experience.sections),
    section_order: [...LIVING_TODAY_I_ACTED_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
  };
}

export function toLivingTodayIActedStatisticsView(stats: LivingTodayIActedStatistics) {
  return {
    schema_version: LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_professional_score: stats.averageProfessionalScore,
    total_memories_stored: stats.totalMemoriesStored,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toActedSectionView, toActedSectionsView };
