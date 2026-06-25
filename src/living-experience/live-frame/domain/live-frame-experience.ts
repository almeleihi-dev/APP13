import { LIVING_LIVE_FRAME_SCHEMA_VERSION, LIVING_LIVE_FRAME_SECTIONS } from "./live-frame-schema.js";
import type { LivingLiveFrameContext } from "./live-frame-context.js";
import {
  buildAllLiveFrameSections,
  type LiveFrameEngineSnapshot,
  type LivingLiveFrameSection,
  toLiveFrameSectionView,
  toLiveFrameSectionsView,
} from "./live-frame-sections.js";
import { resolveFrameTier, computeBaseTrustScore } from "./live-frame-context.js";
import { FRAME_TIER_LABELS } from "./live-frame-schema.js";

export interface LivingLiveFrameExperience {
  userId: string;
  headline: string;
  tagline: string;
  currentTier: string;
  trustScore: number;
  geographic: LivingLiveFrameContext["geographic"];
  sections: LivingLiveFrameSection[];
  living: true;
  trustFirst: true;
  generatedAt: string;
}

export interface LivingLiveFrameStatistics {
  totalUsers: number;
  averageTrustScore: number;
  tierDistribution: Record<string, number>;
  refreshCount: number;
  generatedAt: string;
}

export interface LivingLiveFrameValidation {
  valid: boolean;
  frameReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function buildLivingLiveFrameExperience(input: {
  context: LivingLiveFrameContext;
  engines: LiveFrameEngineSnapshot;
}): LivingLiveFrameExperience {
  const sections = buildAllLiveFrameSections(input.context, input.engines);
  const current = sections.find((s) => s.sectionId === "current_live_frame");
  const trustScore = current && "trustScore" in current ? current.trustScore : computeBaseTrustScore(input.context);
  const tier = resolveFrameTier(trustScore);

  return {
    userId: input.context.userId,
    headline: current?.headline ?? `Your Live Frame: ${FRAME_TIER_LABELS[tier]}`,
    tagline: "Your living trust identity — always explainable.",
    currentTier: tier,
    trustScore,
    geographic: input.context.geographic,
    sections,
    living: true,
    trustFirst: true,
    generatedAt: input.context.generatedAt,
  };
}

export function validateLivingLiveFrameContext(context: LivingLiveFrameContext): LivingLiveFrameValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.geographic.country) errors.push("country is required");
  if (!context.onboarding.ironVerification?.identityConfirmed) {
    warnings.push("identity verification improves frame accuracy");
  }

  return {
    valid: errors.length === 0,
    frameReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Living Live Frame context is ready."
        : `Living Live Frame context incomplete: ${errors.join("; ")}`,
  };
}

export function buildLivingLiveFrameStatistics(input: {
  experiences: LivingLiveFrameExperience[];
  refreshCount: number;
}): LivingLiveFrameStatistics {
  const totalUsers = input.experiences.length;
  const averageTrustScore =
    totalUsers === 0
      ? 0
      : Math.round(input.experiences.reduce((sum, e) => sum + e.trustScore, 0) / totalUsers);

  const tierDistribution: Record<string, number> = {};
  for (const exp of input.experiences) {
    tierDistribution[exp.currentTier] = (tierDistribution[exp.currentTier] ?? 0) + 1;
  }

  return {
    totalUsers,
    averageTrustScore,
    tierDistribution,
    refreshCount: input.refreshCount,
    generatedAt: new Date().toISOString(),
  };
}

export function findLiveFrameSection(
  experience: LivingLiveFrameExperience,
  sectionId: LivingLiveFrameSection["sectionId"]
): LivingLiveFrameSection | undefined {
  return experience.sections.find((section) => section.sectionId === sectionId);
}

export function toLivingLiveFrameView(experience: LivingLiveFrameExperience) {
  return {
    schema_version: LIVING_LIVE_FRAME_SCHEMA_VERSION,
    user_id: experience.userId,
    headline: experience.headline,
    tagline: experience.tagline,
    current_tier: experience.currentTier,
    trust_score: experience.trustScore,
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
    sections: toLiveFrameSectionsView(experience.sections),
    section_order: [...LIVING_LIVE_FRAME_SECTIONS],
    living: experience.living,
    trust_first: experience.trustFirst,
    generated_at: experience.generatedAt,
    experience_only: true,
    read_only: true,
    explainable: true,
  };
}

export function toLivingLiveFrameStatisticsView(stats: LivingLiveFrameStatistics) {
  return {
    schema_version: LIVING_LIVE_FRAME_SCHEMA_VERSION,
    total_users: stats.totalUsers,
    average_trust_score: stats.averageTrustScore,
    tier_distribution: stats.tierDistribution,
    refresh_count: stats.refreshCount,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}

export { toLiveFrameSectionView, toLiveFrameSectionsView };
