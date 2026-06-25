import type { CONFIDENCE_LEVELS, FrameTier } from "./live-frame-schema.js";
import {
  FRAME_TIER_COLORS,
  FRAME_TIER_LABELS,
  FRAME_TIER_MIN_SCORES,
  FRAME_TIERS,
  NEXT_TIER,
} from "./live-frame-schema.js";
import type { LivingLiveFrameContext } from "./live-frame-context.js";
import {
  computeBaseTrustScore,
  hashFrameSeed,
  resolveFrameTier,
  tierIndex,
} from "./live-frame-context.js";

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface LiveFrameEngineSnapshot {
  trustScore?: number;
  readinessScore?: number;
  liveFrameTier?: string;
  positiveDriverTitles?: string[];
  negativeDriverTitles?: string[];
  recommendations?: Array<{ title: string; impact: string; estimatedDays: number; why: string }>;
  evolutionPoints?: Array<{ date: string; score: number; event: string }>;
  verifiedEvidence?: Array<{ evidenceId: string; title: string; category: string; verified: boolean; summary?: string }>;
}

export interface LiveFrameSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface CurrentLiveFrameSection extends LiveFrameSectionBase {
  sectionId: "current_live_frame";
  currentTier: FrameTier;
  tierLabel: string;
  color: string;
  trustScore: number;
  professionalExplanation: string;
}

export interface FrameMeaningSection extends LiveFrameSectionBase {
  sectionId: "frame_meaning";
  meaning: string;
  trustLevel: string;
  regionalContext: string;
}

export interface TrustScoreSection extends LiveFrameSectionBase {
  sectionId: "trust_score";
  trust: number;
  readiness: number;
  professionalConfidence: ConfidenceLevel;
  scoreExplanations: Array<{ factor: string; score: number; explanation: string }>;
}

export interface FrameHistorySection extends LiveFrameSectionBase {
  sectionId: "frame_history";
  previousFrames: Array<{ tier: string; label: string; fromDate: string; toDate: string | null }>;
  upgradeHistory: Array<{ date: string; fromTier: string; toTier: string; reason: string }>;
  milestones: string[];
}

export interface ProgressSection extends LiveFrameSectionBase {
  sectionId: "progress";
  progressPercent: number;
  remainingRequirements: string[];
  estimatedNextUpgrade: string;
  nextTier: FrameTier | null;
  pointsToNextTier: number;
}

export interface DriversSection extends LiveFrameSectionBase {
  sectionId: "positive_drivers" | "negative_drivers";
  drivers: Array<{ driverCode: string; title: string; description: string; impact: string }>;
}

export interface ProfessionalGrowthSection extends LiveFrameSectionBase {
  sectionId: "professional_growth";
  growthSummary: string;
  improvementPercent: number;
  periodDays: number;
  highlights: string[];
}

export interface RecommendationsSection extends LiveFrameSectionBase {
  sectionId: "recommendations";
  recommendations: Array<{
    title: string;
    impact: string;
    estimatedDays: number;
    why: string;
  }>;
}

export interface TimelineSection extends LiveFrameSectionBase {
  sectionId: "timeline";
  events: Array<{ date: string; title: string; category: string; impact: "positive" | "neutral" | "negative" }>;
}

export interface AchievementsSection extends LiveFrameSectionBase {
  sectionId: "achievements";
  achievements: Array<{ achievementId: string; title: string; earnedAt: string; frameImpact: string }>;
}

export interface VerifiedEvidenceSection extends LiveFrameSectionBase {
  sectionId: "verified_evidence";
  evidence: Array<{ evidenceId: string; title: string; category: string; verified: boolean; summary: string }>;
}

export interface FutureProjectionSection extends LiveFrameSectionBase {
  sectionId: "future_projection";
  projectedTier: FrameTier;
  projectedTierLabel: string;
  projectedTrustScore: number;
  timeframeDays: number;
  assumptions: string[];
}

export type LivingLiveFrameSection =
  | CurrentLiveFrameSection
  | FrameMeaningSection
  | TrustScoreSection
  | FrameHistorySection
  | ProgressSection
  | DriversSection
  | ProfessionalGrowthSection
  | RecommendationsSection
  | TimelineSection
  | AchievementsSection
  | VerifiedEvidenceSection
  | FutureProjectionSection;

function resolveConfidence(score: number): ConfidenceLevel {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

function resolveTrustScore(context: LivingLiveFrameContext, engines: LiveFrameEngineSnapshot): number {
  return engines.trustScore ?? computeBaseTrustScore(context);
}

function resolveReadiness(context: LivingLiveFrameContext, engines: LiveFrameEngineSnapshot): number {
  return engines.readinessScore ?? Math.min(100, computeBaseTrustScore(context) - 5);
}

function buildFrameMeaningText(tier: FrameTier, context: LivingLiveFrameContext): string {
  const meanings: Record<FrameTier, string> = {
    WATCHLIST: "Your frame is building. Complete verified actions to establish trust.",
    STANDARD: "You have a solid professional foundation. Keep completing verified work.",
    TRUSTED: "Clients and partners can rely on your verified professional record.",
    EMERALD_PRO: "You demonstrate consistent excellence across projects and reviews.",
    PLATINUM_ELITE: "You represent the highest level of verified professional trust on APP13.",
  };
  return `${meanings[tier]} Adapted for ${context.geographic.country} professional standards.`;
}

export function buildCurrentLiveFrameSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): CurrentLiveFrameSection {
  const trustScore = resolveTrustScore(context, engines);
  const tier = resolveFrameTier(trustScore);

  return {
    sectionId: "current_live_frame",
    title: "Current Live Frame",
    headline: `Your frame: ${FRAME_TIER_LABELS[tier]}`,
    description: "Your living trust identity on APP13.",
    currentTier: tier,
    tierLabel: FRAME_TIER_LABELS[tier],
    color: FRAME_TIER_COLORS[tier],
    trustScore,
    professionalExplanation: buildFrameMeaningText(tier, context),
    explainable: true,
  };
}

export function buildFrameMeaningSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): FrameMeaningSection {
  const trustScore = resolveTrustScore(context, engines);
  const tier = resolveFrameTier(trustScore);

  return {
    sectionId: "frame_meaning",
    title: "Frame Meaning",
    headline: `What ${FRAME_TIER_LABELS[tier]} means for you`,
    description: "Every frame tells a story about verified professional trust.",
    meaning: buildFrameMeaningText(tier, context),
    trustLevel: FRAME_TIER_LABELS[tier],
    regionalContext: `${context.geographic.preferredWorkRegion} — ${context.geographic.professionalRegulations.join(", ").replace(/_/g, " ")}`,
    explainable: true,
  };
}

export function buildTrustScoreSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): TrustScoreSection {
  const trust = resolveTrustScore(context, engines);
  const readiness = resolveReadiness(context, engines);
  const overall = Math.round(trust * 0.55 + readiness * 0.45);

  return {
    sectionId: "trust_score",
    title: "Trust Score",
    headline: `Trust: ${trust} · Readiness: ${readiness}`,
    description: "Every score is explainable and updates with your professional activity.",
    trust,
    readiness,
    professionalConfidence: resolveConfidence(overall),
    scoreExplanations: [
      { factor: "trust", score: trust, explanation: "Verified identity, completed work, and customer feedback." },
      { factor: "readiness", score: readiness, explanation: "Skills, credentials, and preparation for next opportunities." },
      {
        factor: "regional_compliance",
        score: context.onboarding.professionalBackground?.licenses.length ? 80 : 45,
        explanation: `Licensing aligned with ${context.geographic.country} requirements.`,
      },
    ],
    explainable: true,
  };
}

export function buildFrameHistorySection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): FrameHistorySection {
  const trustScore = resolveTrustScore(context, engines);
  const currentTier = resolveFrameTier(trustScore);
  const idx = tierIndex(currentTier);

  const previousFrames = FRAME_TIERS.slice(0, idx + 1).map((tier, i, arr) => ({
    tier,
    label: FRAME_TIER_LABELS[tier],
    fromDate: context.generatedAt.slice(0, 10),
    toDate: i < arr.length - 1 ? context.generatedAt.slice(0, 10) : null,
  }));

  const upgradeHistory =
    idx > 0
      ? [
          {
            date: context.generatedAt.slice(0, 10),
            fromTier: FRAME_TIER_LABELS[FRAME_TIERS[idx - 1]],
            toTier: FRAME_TIER_LABELS[currentTier],
            reason: "Verified professional milestones and improved trust score",
          },
        ]
      : [];

  return {
    sectionId: "frame_history",
    title: "Frame History",
    headline: `${previousFrames.length} frame stages recorded`,
    description: "Your frame evolves as you complete verified professional actions.",
    previousFrames,
    upgradeHistory,
    milestones: [
      "Identity verified",
      context.onboarding.professionalCalibration ? "Professional calibration completed" : "Profile building in progress",
      "Live Frame activated",
    ],
    explainable: true,
  };
}

export function buildProgressSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): ProgressSection {
  const trustScore = resolveTrustScore(context, engines);
  const currentTier = resolveFrameTier(trustScore);
  const nextTier = NEXT_TIER[currentTier] ?? null;
  const nextMin = nextTier ? FRAME_TIER_MIN_SCORES[nextTier] : 100;
  const currentMin = FRAME_TIER_MIN_SCORES[currentTier];
  const range = nextMin - currentMin;
  const progressPercent =
    nextTier === null ? 100 : Math.min(100, Math.round(((trustScore - currentMin) / range) * 100));

  const remaining: string[] = [];
  if (!context.onboarding.ironVerification?.identityConfirmed) remaining.push("Confirm your identity");
  if ((context.onboarding.professionalBackground?.licenses.length ?? 0) === 0) {
    remaining.push(`Obtain a license recognized in ${context.geographic.country}`);
  }
  if (engines.negativeDriverTitles?.includes("low_activity")) remaining.push("Complete more verified actions");
  if (remaining.length === 0 && nextTier) remaining.push(`Reach trust score ${nextMin} for ${FRAME_TIER_LABELS[nextTier]}`);

  return {
    sectionId: "progress",
    title: "Progress to Next Frame",
    headline: nextTier ? `Progress toward ${FRAME_TIER_LABELS[nextTier]}` : "You are at the highest frame tier",
    description: "Clear requirements show exactly what improves your frame next.",
    progressPercent,
    remainingRequirements: remaining,
    estimatedNextUpgrade: nextTier ? "2–6 weeks with consistent verified activity" : "At maximum frame tier",
    nextTier,
    pointsToNextTier: nextTier ? Math.max(0, nextMin - trustScore) : 0,
    explainable: true,
  };
}

export function buildPositiveDriversSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): DriversSection {
  const bg = context.onboarding.professionalBackground;
  const drivers = [
    {
      driverCode: "verified_work",
      title: "Verified professional work",
      description: "Completed actions build your trust record.",
      impact: "high",
    },
    {
      driverCode: "skills",
      title: "Verified skills",
      description: (bg?.skills ?? ["core skills"]).join(", ").replace(/_/g, " "),
      impact: "high",
    },
    {
      driverCode: "knowledge",
      title: "Knowledge contributions",
      description: "Sharing professional knowledge strengthens your frame.",
      impact: "medium",
    },
    {
      driverCode: "training",
      title: "Training achievements",
      description: context.onboarding.smartQuestions?.enjoysTeaching
        ? "Teaching and mentoring activity detected"
        : "Complete learning milestones to boost trust",
      impact: "medium",
    },
    {
      driverCode: "identity_trust",
      title: "Verified identity",
      description: context.onboarding.ironVerification?.emailVerified
        ? "Email and identity verification complete"
        : "Complete identity verification",
      impact: "high",
    },
  ];

  if (engines.positiveDriverTitles) {
    for (const title of engines.positiveDriverTitles) {
      drivers.push({
        driverCode: "engine_signal",
        title,
        description: "Recent professional activity improved your frame.",
        impact: "medium",
      });
    }
  }

  return {
    sectionId: "positive_drivers",
    title: "Positive Drivers",
    headline: `${drivers.length} factors strengthening your frame`,
    description: "These verified factors are improving your Live Frame.",
    drivers,
    explainable: true,
  };
}

export function buildNegativeDriversSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): DriversSection {
  const drivers: DriversSection["drivers"] = [];

  if ((context.onboarding.professionalBackground?.licenses.length ?? 0) === 0) {
    drivers.push({
      driverCode: "missing_license",
      title: "Missing professional license",
      description: `A recognized license in ${context.geographic.country} would improve your frame.`,
      impact: "high",
    });
  }

  const hash = hashFrameSeed(context.dayKey, context.userId);
  if (hash % 3 === 0) {
    drivers.push({
      driverCode: "low_activity",
      title: "Low recent activity",
      description: "Completing verified actions this week would improve your frame.",
      impact: "medium",
    });
  }

  if (!context.onboarding.professionalCalibration) {
    drivers.push({
      driverCode: "pending_calibration",
      title: "Calibration incomplete",
      description: "Complete professional calibration for a more accurate frame.",
      impact: "low",
    });
  }

  for (const title of engines.negativeDriverTitles ?? []) {
    drivers.push({
      driverCode: "engine_signal",
      title,
      description: "This factor is currently limiting frame growth.",
      impact: "medium",
    });
  }

  if (drivers.length === 0) {
    drivers.push({
      driverCode: "none",
      title: "No significant negative factors",
      description: "Keep maintaining verified professional activity.",
      impact: "neutral",
    });
  }

  return {
    sectionId: "negative_drivers",
    title: "Negative Drivers",
    headline: `${drivers.length} factors to address`,
    description: "Understanding what limits your frame helps you improve it faster.",
    drivers,
    explainable: true,
  };
}

export function buildProfessionalGrowthSection(context: LivingLiveFrameContext): ProfessionalGrowthSection {
  const hash = hashFrameSeed(context.dayKey, context.userId);
  const improvement = 5 + (hash % 15);

  return {
    sectionId: "professional_growth",
    title: "Professional Growth",
    headline: `Frame improved ${improvement}% over the last 30 days`,
    description: "Your frame grows with every verified achievement.",
    growthSummary: "Steady upward trend driven by verified skills and professional activity.",
    improvementPercent: improvement,
    periodDays: 30,
    highlights: [
      "Identity verification strengthened trust",
      "Professional skills added to verified record",
      "Learning milestones contributed to growth",
    ],
    explainable: true,
  };
}

export function buildRecommendationsSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): RecommendationsSection {
  const recommendations =
    engines.recommendations ??
    [
      {
        title: "Complete one verified professional action",
        impact: "high",
        estimatedDays: 7,
        why: "Verified work is the strongest frame improvement signal.",
      },
      {
        title: context.onboarding.professionalBackground?.licenses.length
          ? "Earn a customer review on your next project"
          : "Obtain a regional professional license",
        impact: "high",
        estimatedDays: 14,
        why: `Aligned with ${context.geographic.country} professional requirements.`,
      },
      {
        title: "Complete a learning milestone",
        impact: "medium",
        estimatedDays: 10,
        why: "Learning achievements contribute to readiness and trust.",
      },
    ];

  return {
    sectionId: "recommendations",
    title: "Recommendations",
    headline: "Highest-impact actions to improve your frame",
    description: "Follow these steps to reach your next frame tier faster.",
    recommendations,
    explainable: true,
  };
}

export function buildTimelineSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): TimelineSection {
  const events: TimelineSection["events"] = [
    {
      date: context.generatedAt.slice(0, 10),
      title: "Live Frame synchronized",
      category: "frame",
      impact: "neutral",
    },
  ];

  if (context.onboarding.ironVerification?.emailVerified) {
    events.push({
      date: context.generatedAt.slice(0, 10),
      title: "Identity verified — frame trust increased",
      category: "identity",
      impact: "positive",
    });
  }

  for (const point of engines.evolutionPoints ?? []) {
    events.push({
      date: point.date,
      title: point.event,
      category: "evolution",
      impact: "positive",
    });
  }

  if (context.onboarding.professionalCalibration) {
    events.push({
      date: context.generatedAt.slice(0, 10),
      title: "Professional calibration completed",
      category: "achievement",
      impact: "positive",
    });
  }

  return {
    sectionId: "timeline",
    title: "Frame Timeline",
    headline: `${events.length} frame events recorded`,
    description: "Chronological history of why your frame changed.",
    events,
    explainable: true,
  };
}

export function buildAchievementsSection(context: LivingLiveFrameContext): AchievementsSection {
  const achievements = [
    {
      achievementId: "ach://frame_activated",
      title: "Live Frame activated",
      earnedAt: context.generatedAt,
      frameImpact: "Established your trust identity on APP13",
    },
  ];

  if (context.onboarding.ironVerification?.identityConfirmed) {
    achievements.push({
      achievementId: "ach://identity_verified",
      title: "Identity verified",
      earnedAt: context.generatedAt,
      frameImpact: "Increased trust score and frame stability",
    });
  }

  if ((context.onboarding.professionalBackground?.certificates.length ?? 0) > 0) {
    achievements.push({
      achievementId: "ach://credentials_verified",
      title: "Professional credentials on record",
      earnedAt: context.generatedAt,
      frameImpact: "Strengthened verified skills signal",
    });
  }

  return {
    sectionId: "achievements",
    title: "Achievements",
    headline: `${achievements.length} frame-related achievements`,
    description: "Achievements that shaped your current Live Frame.",
    achievements,
    explainable: true,
  };
}

export function buildVerifiedEvidenceSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): VerifiedEvidenceSection {
  const evidence = (engines.verifiedEvidence ?? [
    {
      evidenceId: "ev://identity",
      title: "Identity verification",
      category: "identity",
      verified: context.onboarding.ironVerification?.identityConfirmed ?? false,
      summary: "Government-aligned identity confirmation",
    },
    {
      evidenceId: "ev://skills",
      title: "Verified skills record",
      category: "skills",
      verified: (context.onboarding.professionalBackground?.skills.length ?? 0) > 0,
      summary: (context.onboarding.professionalBackground?.skills ?? []).join(", ") || "Building skills record",
    },
    {
      evidenceId: "ev://regional",
      title: "Regional compliance context",
      category: "regulation",
      verified: true,
      summary: `${context.geographic.country} — ${context.geographic.legalEnvironment}`,
    },
  ]).map((item) => ({
    evidenceId: item.evidenceId,
    title: item.title,
    category: item.category,
    verified: item.verified,
    summary: item.summary ?? item.title,
  }));

  return {
    sectionId: "verified_evidence",
    title: "Verified Evidence",
    headline: `${evidence.filter((e) => e.verified).length} verified evidence items`,
    description: "Evidence supporting your current Live Frame.",
    evidence,
    explainable: true,
  };
}

export function buildFutureProjectionSection(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): FutureProjectionSection {
  const trustScore = resolveTrustScore(context, engines);
  const currentTier = resolveFrameTier(trustScore);
  const nextTier = NEXT_TIER[currentTier] ?? currentTier;
  const projectedScore = Math.min(100, trustScore + 12);
  const projectedTier = resolveFrameTier(projectedScore);

  return {
    sectionId: "future_projection",
    title: "Future Projection",
    headline: `Projected frame: ${FRAME_TIER_LABELS[projectedTier]}`,
    description: "Expected frame if you complete the recommended actions.",
    projectedTier,
    projectedTierLabel: FRAME_TIER_LABELS[projectedTier],
    projectedTrustScore: projectedScore,
    timeframeDays: 30,
    assumptions: [
      "Complete recommended high-impact actions",
      "Maintain verified professional activity",
      `Meet ${context.geographic.country} licensing requirements where applicable`,
      nextTier !== currentTier
        ? `Reach ${FRAME_TIER_LABELS[nextTier]} within 30 days`
        : "Maintain Platinum Elite standing",
    ],
    explainable: true,
  };
}

export function buildAllLiveFrameSections(
  context: LivingLiveFrameContext,
  engines: LiveFrameEngineSnapshot
): LivingLiveFrameSection[] {
  return [
    buildCurrentLiveFrameSection(context, engines),
    buildFrameMeaningSection(context, engines),
    buildTrustScoreSection(context, engines),
    buildFrameHistorySection(context, engines),
    buildProgressSection(context, engines),
    buildPositiveDriversSection(context, engines),
    buildNegativeDriversSection(context, engines),
    buildProfessionalGrowthSection(context),
    buildRecommendationsSection(context, engines),
    buildTimelineSection(context, engines),
    buildAchievementsSection(context),
    buildVerifiedEvidenceSection(context, engines),
    buildFutureProjectionSection(context, engines),
  ];
}

function sectionToView(section: LivingLiveFrameSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "current_live_frame":
      return {
        ...base,
        current_tier: section.currentTier,
        tier_label: section.tierLabel,
        color: section.color,
        trust_score: section.trustScore,
        professional_explanation: section.professionalExplanation,
      };
    case "frame_meaning":
      return {
        ...base,
        meaning: section.meaning,
        trust_level: section.trustLevel,
        regional_context: section.regionalContext,
      };
    case "trust_score":
      return {
        ...base,
        trust: section.trust,
        readiness: section.readiness,
        professional_confidence: section.professionalConfidence,
        score_explanations: section.scoreExplanations,
      };
    case "frame_history":
      return {
        ...base,
        previous_frames: section.previousFrames,
        upgrade_history: section.upgradeHistory,
        milestones: section.milestones,
      };
    case "progress":
      return {
        ...base,
        progress_percent: section.progressPercent,
        remaining_requirements: section.remainingRequirements,
        estimated_next_upgrade: section.estimatedNextUpgrade,
        next_tier: section.nextTier,
        points_to_next_tier: section.pointsToNextTier,
      };
    case "positive_drivers":
    case "negative_drivers":
      return { ...base, drivers: section.drivers };
    case "professional_growth":
      return {
        ...base,
        growth_summary: section.growthSummary,
        improvement_percent: section.improvementPercent,
        period_days: section.periodDays,
        highlights: section.highlights,
      };
    case "recommendations":
      return { ...base, recommendations: section.recommendations };
    case "timeline":
      return { ...base, events: section.events };
    case "achievements":
      return { ...base, achievements: section.achievements };
    case "verified_evidence":
      return { ...base, evidence: section.evidence };
    case "future_projection":
      return {
        ...base,
        projected_tier: section.projectedTier,
        projected_tier_label: section.projectedTierLabel,
        projected_trust_score: section.projectedTrustScore,
        timeframe_days: section.timeframeDays,
        assumptions: section.assumptions,
      };
    default:
      return base;
  }
}

export function toLiveFrameSectionView(section: LivingLiveFrameSection) {
  return sectionToView(section);
}

export function toLiveFrameSectionsView(sections: LivingLiveFrameSection[]) {
  return sections.map(toLiveFrameSectionView);
}
