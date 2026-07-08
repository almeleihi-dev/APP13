import {
  LIVING_OPPORTUNITIES_SCHEMA_VERSION,
  LIVING_OPPORTUNITIES_SECTIONS,
} from "./opportunities-schema.js";
import type { LivingOpportunitiesContext } from "./opportunities-context.js";
import {
  buildAllOpportunitiesSections,
  type OpportunityEngineSnapshot,
  type LivingOpportunitiesSection,
  type OpportunityHistoryEntry,
  type SavedOpportunity,
  toOpportunitiesSectionView,
  toOpportunitiesSectionsView,
} from "./opportunities-sections.js";

export interface LivingOpportunitiesExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingOpportunitiesContext["geographic"];
  sections: LivingOpportunitiesSection[];
  living: true;
  generatedAt: string;
}

export interface LivingOpportunitiesStatistics {
  totalExperiences: number;
  averageMatchScore: number;
  savedCount: number;
  historyCount: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingOpportunitiesValidation {
  valid: boolean;
  experienceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingOpportunitiesExperience(input: {
  context: LivingOpportunitiesContext;
  engines: OpportunityEngineSnapshot;
  history?: OpportunityHistoryEntry[];
  saved?: SavedOpportunity[];
}): LivingOpportunitiesExperience {
  const sections = buildAllOpportunitiesSections(
    input.context,
    input.engines,
    input.history ?? [],
    input.saved ?? []
  );
  const best = sections.find((s) => s.sectionId === "todays_best_opportunity");

  return {
    userId: input.context.userId,
    headline: best?.headline ?? "Your opportunities today",
    tagline: "What opportunity is best for you today?",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingOpportunitiesContext(
  context: LivingOpportunitiesContext
): LivingOpportunitiesValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer opportunity matching");

  return {
    valid: errors.length === 0,
    experienceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living opportunities context is ready."
        : `Living opportunities context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingOpportunitiesStatistics(input: {
  experiences: LivingOpportunitiesExperience[];
  savedCount: number;
  historyCount: number;
  refreshCount: number;
}): LivingOpportunitiesStatistics {
  const totalExperiences = input.experiences.length;
  const bestSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "todays_best_opportunity"))
    .filter(
      (s): s is Extract<LivingOpportunitiesSection, { sectionId: "todays_best_opportunity" }> => Boolean(s)
    );

  const averageMatchScore =
    bestSections.length === 0
      ? 0
      : Math.round(
          bestSections.reduce((sum, s) => sum + s.opportunity.matchScore, 0) / bestSections.length
        );

  return {
    totalExperiences,
    averageMatchScore,
    savedCount: input.savedCount,
    historyCount: input.historyCount,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findOpportunitiesSection(
  experience: LivingOpportunitiesExperience,
  sectionId: LivingOpportunitiesSection["sectionId"]
): LivingOpportunitiesSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingOpportunitiesView(experience: LivingOpportunitiesExperience) {
  return {
    schema_version: LIVING_OPPORTUNITIES_SCHEMA_VERSION,
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
    sections: toOpportunitiesSectionsView(experience.sections),
    section_order: [...LIVING_OPPORTUNITIES_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    recommendations_only: true,
  };
}

export function toLivingOpportunitiesStatisticsView(stats: LivingOpportunitiesStatistics) {
  return {
    schema_version: LIVING_OPPORTUNITIES_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_match_score: stats.averageMatchScore,
    saved_count: stats.savedCount,
    history_count: stats.historyCount,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toOpportunitiesSectionView, toOpportunitiesSectionsView };
