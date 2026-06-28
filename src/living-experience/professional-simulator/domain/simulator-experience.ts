import {
  LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_SIMULATOR_SECTIONS,
} from "./simulator-schema.js";
import type { LivingProfessionalSimulatorContext } from "./simulator-context.js";
import {
  buildAllSimulatorSections,
  SIMULATOR_EXPERIENCE_FLAGS,
  type SimulatorEngineSnapshot,
  type SimulationHistoryProfile,
  type LivingProfessionalSimulatorSection,
  toSimulatorSectionView,
  toSimulatorSectionsView,
} from "./simulator-sections.js";

export interface LivingProfessionalSimulatorExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalSimulatorContext["geographic"];
  sections: LivingProfessionalSimulatorSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalSimulatorStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalSimulatorValidation {
  valid: boolean;
  simulatorReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalSimulatorExperience(input: {
  context: LivingProfessionalSimulatorContext;
  engines: SimulatorEngineSnapshot;
  history: SimulationHistoryProfile;
}): LivingProfessionalSimulatorExperience {
  const sections = buildAllSimulatorSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "simulation_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional simulator",
    tagline: "One what-if. One deterministic projection.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalSimulatorContext(
  context: LivingProfessionalSimulatorContext
): LivingProfessionalSimulatorValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer simulations");

  return {
    valid: errors.length === 0,
    simulatorReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional simulator context is ready."
        : `Living professional simulator context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalSimulatorStatistics(input: {
  experiences: LivingProfessionalSimulatorExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalSimulatorStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalSimulatorSection, { sectionId: "confidence_explanation" }> =>
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

export function findSimulatorSection(
  experience: LivingProfessionalSimulatorExperience,
  sectionId: LivingProfessionalSimulatorSection["sectionId"]
): LivingProfessionalSimulatorSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalSimulatorView(experience: LivingProfessionalSimulatorExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION,
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
    sections: toSimulatorSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_SIMULATOR_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...SIMULATOR_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalSimulatorStatisticsView(stats: LivingProfessionalSimulatorStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toSimulatorSectionView, toSimulatorSectionsView, SIMULATOR_EXPERIENCE_FLAGS };
