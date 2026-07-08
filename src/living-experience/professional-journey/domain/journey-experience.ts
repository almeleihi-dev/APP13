import { LIVING_JOURNEY_SCHEMA_VERSION, LIVING_JOURNEY_SECTIONS } from "./journey-schema.js";
import type { LivingJourneyContext } from "./journey-context.js";
import { resolveJourneyName } from "./journey-context.js";
import {
  buildAllJourneySections,
  type JourneyEngineSnapshot,
  type LivingJourneySection,
  toJourneySectionView,
  toJourneySectionsView,
} from "./journey-sections.js";

export interface LivingProfessionalJourney {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingJourneyContext["geographic"];
  sections: LivingJourneySection[];
  living: true;
  generatedAt: string;
}

export interface LivingJourneyStatistics {
  totalJourneys: number;
  averageCompletion: number;
  stageDistribution: Record<string, number>;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingJourneyValidation {
  valid: boolean;
  journeyReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalJourney(input: {
  context: LivingJourneyContext;
  engines: JourneyEngineSnapshot;
}): LivingProfessionalJourney {
  const sections = buildAllJourneySections(input.context, input.engines);
  const nextStep = sections.find((s) => s.sectionId === "recommended_next_step");

  return {
    userId: input.context.userId,
    headline: nextStep?.headline ?? resolveJourneyName(input.context),
    tagline: "Where you started. Where you are. Where you are going.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingJourneyContext(context: LivingJourneyContext): LivingJourneyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer journey context");

  return {
    valid: errors.length === 0,
    journeyReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living journey context is ready."
        : `Living journey context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingJourneyStatistics(input: {
  journeys: LivingProfessionalJourney[];
  refreshCount: number;
}): LivingJourneyStatistics {
  const totalJourneys = input.journeys.length;
  const progressSections = input.journeys
    .map((j) => j.sections.find((s) => s.sectionId === "journey_progress"))
    .filter((s): s is Extract<LivingJourneySection, { sectionId: "journey_progress" }> => Boolean(s));

  const averageCompletion =
    progressSections.length === 0
      ? 0
      : Math.round(progressSections.reduce((sum, s) => sum + s.overallCompletion, 0) / progressSections.length);

  const stageDistribution: Record<string, number> = {};
  for (const journey of input.journeys) {
    const overview = journey.sections.find((s) => s.sectionId === "journey_overview");
    if (overview && "currentStage" in overview) {
      stageDistribution[overview.currentStage] = (stageDistribution[overview.currentStage] ?? 0) + 1;
    }
  }

  return {
    totalJourneys,
    averageCompletion,
    stageDistribution,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findJourneySection(
  journey: LivingProfessionalJourney,
  sectionId: LivingJourneySection["sectionId"]
): LivingJourneySection | undefined {
  return journey.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingJourneyView(journey: LivingProfessionalJourney) {
  return {
    schema_version: LIVING_JOURNEY_SCHEMA_VERSION,
    user_id: journey.userId,
    headline: journey.headline,
    tagline: journey.tagline,
    geographic: {
      country: journey.geographic.country,
      city: journey.geographic.city,
      preferred_work_region: journey.geographic.preferredWorkRegion,
      languages: journey.geographic.languages,
      currency: journey.geographic.currency,
      legal_environment: journey.geographic.legalEnvironment,
      professional_regulations: journey.geographic.professionalRegulations,
      government_programs: journey.geographic.governmentPrograms,
    },
    sections: toJourneySectionsView(journey.sections),
    section_order: [...LIVING_JOURNEY_SECTIONS],
    living: journey.living,
    generated_at: journey.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
  };
}

export function toLivingJourneyStatisticsView(stats: LivingJourneyStatistics) {
  return {
    schema_version: LIVING_JOURNEY_SCHEMA_VERSION,
    total_journeys: stats.totalJourneys,
    average_completion: stats.averageCompletion,
    stage_distribution: stats.stageDistribution,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toJourneySectionView, toJourneySectionsView };
