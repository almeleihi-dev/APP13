import {
  LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_TIMELINE_SECTIONS,
} from "./timeline-schema.js";
import type { LivingProfessionalTimelineContext } from "./timeline-context.js";
import {
  buildAllTimelineSections,
  TIMELINE_EXPERIENCE_FLAGS,
  type TimelineEngineSnapshot,
  type TimelineHistoryProfile,
  type LivingProfessionalTimelineSection,
  toTimelineSectionView,
  toTimelineSectionsView,
} from "./timeline-sections.js";

export interface LivingProfessionalTimelineExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalTimelineContext["geographic"];
  sections: LivingProfessionalTimelineSection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalTimelineStatistics {
  totalExperiences: number;
  averageConfidence: number;
  historyProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalTimelineValidation {
  valid: boolean;
  timelineReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalTimelineExperience(input: {
  context: LivingProfessionalTimelineContext;
  engines: TimelineEngineSnapshot;
  history: TimelineHistoryProfile;
}): LivingProfessionalTimelineExperience {
  const sections = buildAllTimelineSections(input.context, input.engines, input.history);
  const summary = sections.find((s) => s.sectionId === "timeline_summary");

  return {
    userId: input.context.userId,
    headline: summary?.headline ?? "Your professional timeline",
    tagline: "Your journey organized. You interpret every chapter.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalTimelineContext(
  context: LivingProfessionalTimelineContext
): LivingProfessionalTimelineValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer timeline");

  return {
    valid: errors.length === 0,
    timelineReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional timeline context is ready."
        : `Living professional timeline context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalTimelineStatistics(input: {
  experiences: LivingProfessionalTimelineExperience[];
  historyProfiles: number;
  refreshCount: number;
}): LivingProfessionalTimelineStatistics {
  const totalExperiences = input.experiences.length;
  const confidenceSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "confidence_explanation"))
    .filter(
      (s): s is Extract<LivingProfessionalTimelineSection, { sectionId: "confidence_explanation" }> =>
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

export function findTimelineSection(
  experience: LivingProfessionalTimelineExperience,
  sectionId: LivingProfessionalTimelineSection["sectionId"]
): LivingProfessionalTimelineSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalTimelineView(experience: LivingProfessionalTimelineExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION,
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
    sections: toTimelineSectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_TIMELINE_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    ...TIMELINE_EXPERIENCE_FLAGS,
  };
}

export function toLivingProfessionalTimelineStatisticsView(stats: LivingProfessionalTimelineStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_confidence: stats.averageConfidence,
    history_profiles: stats.historyProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toTimelineSectionView, toTimelineSectionsView, TIMELINE_EXPERIENCE_FLAGS };
