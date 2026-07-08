import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustProfileView } from "../../../trust/domain/trust-profile-view.js";
import {
  buildPassportLevelAssessment,
  isLicenseCredential,
  toPassportLevelAssessmentView,
  type PassportLevel,
  type PassportLevelAssessment,
  type PassportLevelAssessmentView,
} from "../../professional-passport/domain/professional-passport.js";
import {
  buildProfessionalSealsProfile,
  toVerificationEconomyView,
  type ProfessionalSealsSnapshot,
  type VerificationEconomy,
  type VerificationEconomyView,
} from "../../professional-seals/domain/professional-seals.js";
import {
  buildTrustOverview,
  toTrustOverviewView,
  type TrustOverview,
  type TrustOverviewView,
} from "../../trust-reputation/domain/trust-reputation-experience.js";
import type { PlatformTrustContext } from "../../live-frame/domain/live-frame-experience.js";

export type FrameLevel = "bronze" | "silver" | "gold" | "platinum" | "elite";

export const FRAME_LEVEL_ORDER: FrameLevel[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "elite",
];

export const FRAME_LEVEL_LABELS: Record<FrameLevel, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  elite: "Elite",
};

export const FRAME_SCORE_WEIGHTS = {
  trust: 0.4,
  passport: 0.25,
  economy: 0.15,
  completion: 0.1,
  rating: 0.1,
} as const;

export const PASSPORT_LEVEL_SCORES: Record<PassportLevel, number> = {
  bronze: 40,
  silver: 55,
  gold: 70,
  platinum: 85,
  elite: 95,
};

export const ECONOMY_TIER_SCORES = {
  starter: 35,
  professional: 50,
  advanced: 65,
  expert: 80,
  elite: 95,
} as const;

export const FRAME_LEVEL_THRESHOLDS: Array<{ level: FrameLevel; minScore: number }> = [
  { level: "elite", minScore: 90 },
  { level: "platinum", minScore: 80 },
  { level: "gold", minScore: 65 },
  { level: "silver", minScore: 50 },
  { level: "bronze", minScore: 0 },
];

export interface LiveTrustFrameSnapshot {
  publicProfile: ProviderPublicProfileView;
  trustProfile: TrustProfileView;
  trustOverview: TrustOverview;
  passportLevel: PassportLevelAssessment;
  economy: VerificationEconomy;
  sealPointsTotal: number;
  platformContext: PlatformTrustContext;
  sealsSnapshot: ProfessionalSealsSnapshot;
}

export interface FrameScoreComponents {
  trust: number;
  passport: number;
  economy: number;
  completion: number;
  rating: number;
}

export interface FrameScoreBreakdown {
  totalScore: number;
  rawTotalScore: number;
  components: FrameScoreComponents;
  weights: typeof FRAME_SCORE_WEIGHTS;
  disputePenalty: number;
  summary: string;
}

export interface FrameSignal {
  signalCode: string;
  label: string;
  category: "trust" | "passport" | "economy" | "completion" | "rating" | "dispute";
  impact: "positive" | "negative" | "neutral";
  strength: number;
  summary: string;
}

export interface DisputeDowngrade {
  applied: boolean;
  levelSteps: number;
  scorePenalty: number;
  activeIssues: number;
  unresolvedIssues: number;
  summary: string;
}

export interface FrameLevelAssessment {
  level: FrameLevel;
  label: string;
  rawLevel: FrameLevel;
  totalScore: number;
  downgrade: DisputeDowngrade;
  nextLevel: FrameLevel | null;
  nextLevelLabel: string | null;
  progressPercent: number;
  summary: string;
}

export interface LiveTrustFrameExperience {
  userId: string;
  providerId: string;
  displayName: string;
  trustOverview: TrustOverview;
  passportLevel: PassportLevelAssessment;
  economy: VerificationEconomy;
  frameScore: FrameScoreBreakdown;
  frameLevel: FrameLevelAssessment;
  signals: FrameSignal[];
  generatedAt: Date;
}

export interface FrameScoreBreakdownView {
  total_score: number;
  raw_total_score: number;
  trust_component: number;
  passport_component: number;
  economy_component: number;
  completion_component: number;
  rating_component: number;
  weights: typeof FRAME_SCORE_WEIGHTS;
  dispute_penalty: number;
  summary: string;
}

export interface FrameSignalView {
  signal_code: string;
  label: string;
  category: FrameSignal["category"];
  impact: FrameSignal["impact"];
  strength: number;
  summary: string;
}

export interface DisputeDowngradeView {
  applied: boolean;
  level_steps: number;
  score_penalty: number;
  active_issues: number;
  unresolved_issues: number;
  summary: string;
}

export interface FrameLevelAssessmentView {
  level: FrameLevel;
  label: string;
  raw_level: FrameLevel;
  total_score: number;
  downgrade: DisputeDowngradeView;
  next_level: FrameLevel | null;
  next_level_label: string | null;
  progress_percent: number;
  summary: string;
}

export interface LiveTrustFrameExperienceView {
  user_id: string;
  provider_id: string;
  display_name: string;
  trust_overview: TrustOverviewView;
  passport_level: PassportLevelAssessmentView;
  economy: VerificationEconomyView;
  frame_score: FrameScoreBreakdownView;
  frame_level: FrameLevelAssessmentView;
  signals: FrameSignalView[];
  generated_at: string;
}

export interface PublicLiveTrustFrameView {
  provider_id: string;
  user_id: string;
  display_name: string;
  frame_level: FrameLevel;
  frame_level_label: string;
  frame_score: number;
  trust_score: number;
  passport_level: PassportLevel;
  economy_tier: VerificationEconomy["tier"];
  top_signals: FrameSignalView[];
  safe_for_public: boolean;
  generated_at: string;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreCompletionComponent(completionRate: number): number {
  return clampScore(completionRate * 100);
}

export function scoreRatingComponent(averageRating: number): number {
  const rating = Math.max(0, Math.min(5, averageRating));
  return clampScore((rating / 5) * 100);
}

export function buildFrameScoreComponents(input: {
  trustScore: number;
  passportLevel: PassportLevel;
  economyTier: VerificationEconomy["tier"];
  completionRate: number;
  averageRating: number;
}): FrameScoreComponents {
  return {
    trust: clampScore(input.trustScore),
    passport: PASSPORT_LEVEL_SCORES[input.passportLevel],
    economy: ECONOMY_TIER_SCORES[input.economyTier],
    completion: scoreCompletionComponent(input.completionRate),
    rating: scoreRatingComponent(input.averageRating),
  };
}

export function calculateFrameTotalScore(components: FrameScoreComponents): number {
  const weighted =
    components.trust * FRAME_SCORE_WEIGHTS.trust +
    components.passport * FRAME_SCORE_WEIGHTS.passport +
    components.economy * FRAME_SCORE_WEIGHTS.economy +
    components.completion * FRAME_SCORE_WEIGHTS.completion +
    components.rating * FRAME_SCORE_WEIGHTS.rating;

  return clampScore(weighted);
}

export function computeFrameLevelFromScore(score: number): FrameLevel {
  for (const threshold of FRAME_LEVEL_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.level;
    }
  }
  return "bronze";
}

export function applyDisputeDowngrade(input: {
  frameLevel: FrameLevel;
  frameScore: number;
  activeIssues: number;
  issuesRaised: number;
  issuesResolved: number;
}): { frameLevel: FrameLevel; frameScore: number; downgrade: DisputeDowngrade } {
  const unresolvedIssues = Math.max(0, input.issuesRaised - input.issuesResolved);
  let levelSteps = 0;
  let scorePenalty = 0;

  if (input.activeIssues >= 2) {
    levelSteps = 2;
    scorePenalty += 20;
  } else if (input.activeIssues === 1) {
    levelSteps = 1;
    scorePenalty += 10;
  }

  if (unresolvedIssues > 0) {
    scorePenalty += Math.min(15, unresolvedIssues * 5);
    if (levelSteps === 0 && unresolvedIssues >= 2) {
      levelSteps = 1;
    }
  }

  const currentIndex = FRAME_LEVEL_ORDER.indexOf(input.frameLevel);
  const downgradedIndex = Math.max(0, currentIndex - levelSteps);
  const downgradedLevel = FRAME_LEVEL_ORDER[downgradedIndex]!;
  const downgradedScore = clampScore(input.frameScore - scorePenalty);

  return {
    frameLevel: downgradedLevel,
    frameScore: downgradedScore,
    downgrade: {
      applied: levelSteps > 0 || scorePenalty > 0,
      levelSteps,
      scorePenalty,
      activeIssues: input.activeIssues,
      unresolvedIssues,
      summary:
        levelSteps > 0 || scorePenalty > 0
          ? `Dispute downgrade applied: ${levelSteps} level step${levelSteps === 1 ? "" : "s"} and ${scorePenalty} score penalty.`
          : "No dispute downgrade applied.",
    },
  };
}

export function buildFrameScoreBreakdown(input: {
  components: FrameScoreComponents;
  activeIssues: number;
  issuesRaised: number;
  issuesResolved: number;
}): FrameScoreBreakdown {
  const rawTotalScore = calculateFrameTotalScore(input.components);
  const rawLevel = computeFrameLevelFromScore(rawTotalScore);
  const downgraded = applyDisputeDowngrade({
    frameLevel: rawLevel,
    frameScore: rawTotalScore,
    activeIssues: input.activeIssues,
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
  });

  return {
    totalScore: downgraded.frameScore,
    rawTotalScore,
    components: input.components,
    weights: FRAME_SCORE_WEIGHTS,
    disputePenalty: downgraded.downgrade.scorePenalty,
    summary: `Live trust frame score ${downgraded.frameScore} (raw ${rawTotalScore}) with trust ${input.components.trust}, passport ${input.components.passport}, economy ${input.components.economy}, completion ${input.components.completion}, and rating ${input.components.rating}.`,
  };
}

export function buildFrameLevelAssessment(input: {
  frameScore: FrameScoreBreakdown;
  activeIssues: number;
  issuesRaised: number;
  issuesResolved: number;
}): FrameLevelAssessment {
  const rawLevel = computeFrameLevelFromScore(input.frameScore.rawTotalScore);
  const downgraded = applyDisputeDowngrade({
    frameLevel: rawLevel,
    frameScore: input.frameScore.rawTotalScore,
    activeIssues: input.activeIssues,
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
  });

  const currentIndex = FRAME_LEVEL_ORDER.indexOf(downgraded.frameLevel);
  const nextLevel =
    currentIndex < FRAME_LEVEL_ORDER.length - 1
      ? FRAME_LEVEL_ORDER[currentIndex + 1]!
      : null;
  const progressPercent =
    nextLevel === null
      ? 100
      : clampPercent(((currentIndex + 1) / FRAME_LEVEL_ORDER.length) * 100);

  return {
    level: downgraded.frameLevel,
    label: FRAME_LEVEL_LABELS[downgraded.frameLevel],
    rawLevel,
    totalScore: downgraded.frameScore,
    downgrade: downgraded.downgrade,
    nextLevel,
    nextLevelLabel: nextLevel ? FRAME_LEVEL_LABELS[nextLevel] : null,
    progressPercent,
    summary: `${FRAME_LEVEL_LABELS[downgraded.frameLevel]} live trust frame at score ${downgraded.frameScore}.`,
  };
}

export function buildFrameSignals(input: {
  trustOverview: TrustOverview;
  passportLevel: PassportLevelAssessment;
  economy: VerificationEconomy;
  components: FrameScoreComponents;
  downgrade: DisputeDowngrade;
  publicProfile: ProviderPublicProfileView;
}): FrameSignal[] {
  const signals: FrameSignal[] = [
    {
      signalCode: "trust_score",
      label: "Trust Score Signal",
      category: "trust",
      impact: input.components.trust >= 70 ? "positive" : input.components.trust >= 50 ? "neutral" : "negative",
      strength: input.components.trust,
      summary: `Trust component ${input.components.trust} (${input.trustOverview.tierLabel}).`,
    },
    {
      signalCode: "passport_level",
      label: "Passport Level Signal",
      category: "passport",
      impact: input.components.passport >= 70 ? "positive" : "neutral",
      strength: input.components.passport,
      summary: `${input.passportLevel.label} passport contributes ${input.components.passport} points.`,
    },
    {
      signalCode: "economy_tier",
      label: "Verification Economy Signal",
      category: "economy",
      impact: input.components.economy >= 65 ? "positive" : "neutral",
      strength: input.components.economy,
      summary: `${input.economy.tierLabel} economy tier contributes ${input.components.economy} points.`,
    },
    {
      signalCode: "completion_rate",
      label: "Completion Signal",
      category: "completion",
      impact: input.components.completion >= 80 ? "positive" : "neutral",
      strength: input.components.completion,
      summary: `Completion rate signal at ${input.components.completion} with ${input.publicProfile.completion_summary.completed_contracts} contracts.`,
    },
    {
      signalCode: "customer_rating",
      label: "Customer Rating Signal",
      category: "rating",
      impact: input.components.rating >= 80 ? "positive" : input.components.rating >= 60 ? "neutral" : "negative",
      strength: input.components.rating,
      summary: `Average rating ${input.publicProfile.rating_summary.average_rating} contributes ${input.components.rating} points.`,
    },
  ];

  if (input.downgrade.applied) {
    signals.push({
      signalCode: "dispute_downgrade",
      label: "Dispute Downgrade Signal",
      category: "dispute",
      impact: "negative",
      strength: Math.min(100, input.downgrade.scorePenalty + input.downgrade.levelSteps * 10),
      summary: input.downgrade.summary,
    });
  } else if (input.publicProfile.dispute_summary.active_issues === 0) {
    signals.push({
      signalCode: "clean_dispute_record",
      label: "Clean Dispute Record",
      category: "dispute",
      impact: "positive",
      strength: 80,
      summary: "No active disputes affecting the live trust frame.",
    });
  }

  if (input.economy.trustBonusPercent > 0) {
    signals.push({
      signalCode: "economy_trust_bonus",
      label: "Economy Trust Bonus",
      category: "economy",
      impact: "positive",
      strength: input.economy.trustBonusPercent * 5,
      summary: `${input.economy.trustBonusPercent}% trust bonus from verification economy tier.`,
    });
  }

  return signals.sort((left, right) => right.strength - left.strength);
}

export function buildLiveTrustFrameSnapshot(input: {
  sealsSnapshot: ProfessionalSealsSnapshot;
  platformContext: PlatformTrustContext;
}): LiveTrustFrameSnapshot {
  const trustOverview = buildTrustOverview({
    profile: input.sealsSnapshot.trustProfile,
    platformContext: input.platformContext,
    verificationTier: input.sealsSnapshot.verificationTier,
  });

  const verifiedCredentials = input.sealsSnapshot.credentials.filter(
    (credential) => credential.status === "verified"
  );

  const passportLevel = buildPassportLevelAssessment({
    trustScore: input.sealsSnapshot.trustProfile.trust_score,
    verificationTier: input.sealsSnapshot.verificationTier,
    completedContracts: input.sealsSnapshot.publicProfile.completion_summary.completed_contracts,
    averageRating: input.sealsSnapshot.publicProfile.rating_summary.average_rating,
    activeIssues: input.sealsSnapshot.publicProfile.dispute_summary.active_issues,
    verifiedCredentialCount: verifiedCredentials.length,
    verifiedLicenseCount: verifiedCredentials.filter(isLicenseCredential).length,
  });

  const sealsProfile = buildProfessionalSealsProfile({ snapshot: input.sealsSnapshot });

  return {
    publicProfile: input.sealsSnapshot.publicProfile,
    trustProfile: input.sealsSnapshot.trustProfile,
    trustOverview,
    passportLevel,
    economy: sealsProfile.economy,
    sealPointsTotal: sealsProfile.sealPoints.totalPoints,
    platformContext: input.platformContext,
    sealsSnapshot: input.sealsSnapshot,
  };
}

export function buildLiveTrustFrameExperience(input: {
  snapshot: LiveTrustFrameSnapshot;
  generatedAt?: Date;
}): LiveTrustFrameExperience {
  const components = buildFrameScoreComponents({
    trustScore: input.snapshot.trustOverview.trustScore,
    passportLevel: input.snapshot.passportLevel.level,
    economyTier: input.snapshot.economy.tier,
    completionRate: input.snapshot.publicProfile.completion_summary.completion_rate,
    averageRating: input.snapshot.publicProfile.rating_summary.average_rating,
  });

  const frameScore = buildFrameScoreBreakdown({
    components,
    activeIssues: input.snapshot.publicProfile.dispute_summary.active_issues,
    issuesRaised: input.snapshot.publicProfile.dispute_summary.issues_raised,
    issuesResolved: input.snapshot.publicProfile.dispute_summary.issues_resolved,
  });

  const frameLevel = buildFrameLevelAssessment({
    frameScore,
    activeIssues: input.snapshot.publicProfile.dispute_summary.active_issues,
    issuesRaised: input.snapshot.publicProfile.dispute_summary.issues_raised,
    issuesResolved: input.snapshot.publicProfile.dispute_summary.issues_resolved,
  });

  const signals = buildFrameSignals({
    trustOverview: input.snapshot.trustOverview,
    passportLevel: input.snapshot.passportLevel,
    economy: input.snapshot.economy,
    components,
    downgrade: frameLevel.downgrade,
    publicProfile: input.snapshot.publicProfile,
  });

  return {
    userId: input.snapshot.publicProfile.user_id,
    providerId: input.snapshot.publicProfile.provider_id,
    displayName: input.snapshot.publicProfile.display_name,
    trustOverview: input.snapshot.trustOverview,
    passportLevel: input.snapshot.passportLevel,
    economy: input.snapshot.economy,
    frameScore,
    frameLevel,
    signals,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildPublicLiveTrustFrame(
  experience: LiveTrustFrameExperience
): PublicLiveTrustFrameView {
  return {
    provider_id: experience.providerId,
    user_id: experience.userId,
    display_name: experience.displayName,
    frame_level: experience.frameLevel.level,
    frame_level_label: experience.frameLevel.label,
    frame_score: experience.frameScore.totalScore,
    trust_score: experience.trustOverview.trustScore,
    passport_level: experience.passportLevel.level,
    economy_tier: experience.economy.tier,
    top_signals: experience.signals.slice(0, 5).map(toFrameSignalView),
    safe_for_public: true,
    generated_at: experience.generatedAt.toISOString(),
  };
}

export function toFrameScoreBreakdownView(
  breakdown: FrameScoreBreakdown
): FrameScoreBreakdownView {
  return {
    total_score: breakdown.totalScore,
    raw_total_score: breakdown.rawTotalScore,
    trust_component: breakdown.components.trust,
    passport_component: breakdown.components.passport,
    economy_component: breakdown.components.economy,
    completion_component: breakdown.components.completion,
    rating_component: breakdown.components.rating,
    weights: breakdown.weights,
    dispute_penalty: breakdown.disputePenalty,
    summary: breakdown.summary,
  };
}

export function toFrameSignalView(signal: FrameSignal): FrameSignalView {
  return {
    signal_code: signal.signalCode,
    label: signal.label,
    category: signal.category,
    impact: signal.impact,
    strength: signal.strength,
    summary: signal.summary,
  };
}

export function toDisputeDowngradeView(downgrade: DisputeDowngrade): DisputeDowngradeView {
  return {
    applied: downgrade.applied,
    level_steps: downgrade.levelSteps,
    score_penalty: downgrade.scorePenalty,
    active_issues: downgrade.activeIssues,
    unresolved_issues: downgrade.unresolvedIssues,
    summary: downgrade.summary,
  };
}

export function toFrameLevelAssessmentView(
  assessment: FrameLevelAssessment
): FrameLevelAssessmentView {
  return {
    level: assessment.level,
    label: assessment.label,
    raw_level: assessment.rawLevel,
    total_score: assessment.totalScore,
    downgrade: toDisputeDowngradeView(assessment.downgrade),
    next_level: assessment.nextLevel,
    next_level_label: assessment.nextLevelLabel,
    progress_percent: assessment.progressPercent,
    summary: assessment.summary,
  };
}

export function toLiveTrustFrameExperienceView(
  experience: LiveTrustFrameExperience
): LiveTrustFrameExperienceView {
  return {
    user_id: experience.userId,
    provider_id: experience.providerId,
    display_name: experience.displayName,
    trust_overview: toTrustOverviewView(experience.trustOverview),
    passport_level: toPassportLevelAssessmentView(experience.passportLevel),
    economy: toVerificationEconomyView(experience.economy),
    frame_score: toFrameScoreBreakdownView(experience.frameScore),
    frame_level: toFrameLevelAssessmentView(experience.frameLevel),
    signals: experience.signals.map(toFrameSignalView),
    generated_at: experience.generatedAt.toISOString(),
  };
}

export function toPublicLiveTrustFrameView(
  profile: PublicLiveTrustFrameView
): PublicLiveTrustFrameView {
  return profile;
}
