import {
  LIVING_ACTION_PLANNER_SCHEMA_VERSION,
  LIVING_ACTION_PLANNER_SECTIONS,
} from "./planner-schema.js";
import type { LivingActionPlannerContext } from "./planner-context.js";
import {
  buildAllPlannerSections,
  type LivingActionPlannerSection,
  type PlannerEngineSnapshot,
  type PlannerExecutionState,
  toPlannerSectionView,
  toPlannerSectionsView,
} from "./planner-sections.js";

export interface LivingActionPlannerExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingActionPlannerContext["geographic"];
  sections: LivingActionPlannerSection[];
  living: true;
  generatedAt: string;
}

export interface LivingActionPlannerStatistics {
  totalExperiences: number;
  averageCompletionPercent: number;
  executionProfiles: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingActionPlannerValidation {
  valid: boolean;
  plannerReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingActionPlannerExperience(input: {
  context: LivingActionPlannerContext;
  engines: PlannerEngineSnapshot;
  execution: PlannerExecutionState;
}): LivingActionPlannerExperience {
  const sections = buildAllPlannerSections(input.context, input.engines, input.execution);
  const mission = sections.find((s) => s.sectionId === "todays_mission");

  return {
    userId: input.context.userId,
    headline: mission?.headline ?? "Your action planner",
    tagline: "Clear daily execution plans — you always decide.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingActionPlannerContext(
  context: LivingActionPlannerContext
): LivingActionPlannerValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer planner guidance");

  return {
    valid: errors.length === 0,
    plannerReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living action planner context is ready."
        : `Living action planner context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingActionPlannerStatistics(input: {
  experiences: LivingActionPlannerExperience[];
  executionProfiles: number;
  refreshCount: number;
}): LivingActionPlannerStatistics {
  const totalExperiences = input.experiences.length;
  const progressSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "progress_tracker"))
    .filter(
      (s): s is Extract<LivingActionPlannerSection, { sectionId: "progress_tracker" }> => Boolean(s)
    );

  const averageCompletionPercent =
    progressSections.length === 0
      ? 0
      : Math.round(
          progressSections.reduce((sum, s) => sum + s.overallCompletionPercent, 0) / progressSections.length
        );

  return {
    totalExperiences,
    averageCompletionPercent,
    executionProfiles: input.executionProfiles,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findPlannerSection(
  experience: LivingActionPlannerExperience,
  sectionId: LivingActionPlannerSection["sectionId"]
): LivingActionPlannerSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingActionPlannerView(experience: LivingActionPlannerExperience) {
  return {
    schema_version: LIVING_ACTION_PLANNER_SCHEMA_VERSION,
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
    sections: toPlannerSectionsView(experience.sections),
    section_order: [...LIVING_ACTION_PLANNER_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    never_executes_automatically: true,
    never_decides_for_user: true,
    never_execute_contracts: true,
    never_spend_money: true,
    never_approve_applications: true,
  };
}

export function toLivingActionPlannerStatisticsView(stats: LivingActionPlannerStatistics) {
  return {
    schema_version: LIVING_ACTION_PLANNER_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_completion_percent: stats.averageCompletionPercent,
    execution_profiles: stats.executionProfiles,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toPlannerSectionView, toPlannerSectionsView };
