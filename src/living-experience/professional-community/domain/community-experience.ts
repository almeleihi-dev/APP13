import {
  LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COMMUNITY_SECTIONS,
} from "./community-schema.js";
import type { LivingProfessionalCommunityContext } from "./community-context.js";
import {
  buildAllCommunitySections,
  type CommunityEngineSnapshot,
  type LivingProfessionalCommunitySection,
  toCommunitySectionView,
  toCommunitySectionsView,
} from "./community-sections.js";

export interface LivingProfessionalCommunityExperience {
  userId: string;
  headline: string;
  tagline: string;
  geographic: LivingProfessionalCommunityContext["geographic"];
  sections: LivingProfessionalCommunitySection[];
  living: true;
  generatedAt: string;
}

export interface LivingProfessionalCommunityStatistics {
  totalExperiences: number;
  averageContributionScore: number;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingProfessionalCommunityValidation {
  valid: boolean;
  communityReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingProfessionalCommunityExperience(input: {
  context: LivingProfessionalCommunityContext;
  engines: CommunityEngineSnapshot;
}): LivingProfessionalCommunityExperience {
  const sections = buildAllCommunitySections(input.context, input.engines);
  const highlight = sections.find((s) => s.sectionId === "todays_community_highlight");

  return {
    userId: input.context.userId,
    headline: highlight?.headline ?? "Your professional community",
    tagline: "Learn, teach, collaborate, and grow through verified contribution.",
    geographic: input.context.geographic,
    sections,
    living: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingProfessionalCommunityContext(
  context: LivingProfessionalCommunityContext
): LivingProfessionalCommunityValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.account) warnings.push("complete onboarding for richer community matching");

  return {
    valid: errors.length === 0,
    communityReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living professional community context is ready."
        : `Living professional community context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingProfessionalCommunityStatistics(input: {
  experiences: LivingProfessionalCommunityExperience[];
  refreshCount: number;
}): LivingProfessionalCommunityStatistics {
  const totalExperiences = input.experiences.length;
  const overviewSections = input.experiences
    .map((e) => e.sections.find((s) => s.sectionId === "community_overview"))
    .filter((s): s is Extract<LivingProfessionalCommunitySection, { sectionId: "community_overview" }> => Boolean(s));

  const averageContributionScore =
    overviewSections.length === 0
      ? 0
      : Math.round(overviewSections.reduce((sum, s) => sum + s.contributionScore, 0) / overviewSections.length);

  return {
    totalExperiences,
    averageContributionScore,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findCommunitySection(
  experience: LivingProfessionalCommunityExperience,
  sectionId: LivingProfessionalCommunitySection["sectionId"]
): LivingProfessionalCommunitySection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingProfessionalCommunityView(experience: LivingProfessionalCommunityExperience) {
  return {
    schema_version: LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION,
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
    sections: toCommunitySectionsView(experience.sections),
    section_order: [...LIVING_PROFESSIONAL_COMMUNITY_SECTIONS],
    living: experience.living,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
    not_social_network: true,
    no_likes: true,
    trust_first: true,
  };
}

export function toLivingProfessionalCommunityStatisticsView(stats: LivingProfessionalCommunityStatistics) {
  return {
    schema_version: LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION,
    total_experiences: stats.totalExperiences,
    average_contribution_score: stats.averageContributionScore,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toCommunitySectionView, toCommunitySectionsView };
