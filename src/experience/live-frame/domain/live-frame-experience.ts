import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import type {
  LiveFrameView,
  TrustHistoryView,
  TrustProfileView,
} from "../../../trust/domain/trust-profile-view.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";

export interface PlatformTrustContext {
  providersWithScores: number;
  averageTrustScore: number;
  lowTrustProviderCount: number;
  tierDistribution: Array<{ tier: string; count: number }>;
  trustEventsLast7Days: number;
  trustEventsLast30Days: number;
}

export interface FrameIdentity {
  userId: string;
  providerId: string;
  displayName: string;
  verificationTier: string;
  liveFrame: LiveFrameView;
}

export interface FrameSummary {
  trustScore: number;
  tier: TrustLiveFrameTier;
  tierLabel: string;
  color: string;
  badgeLabel: string;
  badgeDescription: string;
  headline: string;
}

export interface FrameProgress {
  currentTier: TrustLiveFrameTier;
  currentTierLabel: string;
  nextTier: TrustLiveFrameTier | null;
  nextTierLabel: string | null;
  currentScore: number;
  nextTierMinimumScore: number | null;
  pointsToNextTier: number;
  progressPercent: number;
  atMaxTier: boolean;
  summary: string;
}

export interface FrameEvolutionPoint {
  date: string;
  positiveEvents: number;
  negativeEvents: number;
  neutralEvents: number;
  netImpact: number;
}

export interface FrameEvolution {
  windowDays: number;
  points: FrameEvolutionPoint[];
  positiveEventCount: number;
  negativeEventCount: number;
  neutralEventCount: number;
  netDirection: "up" | "down" | "stable";
  summary: string;
}

export interface FrameDriver {
  driverCode: string;
  title: string;
  description: string;
  score: number;
  weightPercent: number;
  impact: "positive" | "negative" | "neutral";
}

export interface FramePublicView {
  providerId: string;
  userId: string;
  displayName: string;
  trustScore: number;
  liveFrame: LiveFrameView;
  badge: TrustProfileView["badge"];
  trustBreakdown: TrustProfileView["breakdown"];
  completionSummary: ProviderPublicProfileView["completion_summary"];
  disputeSummary: ProviderPublicProfileView["dispute_summary"];
  ratingSummary: ProviderPublicProfileView["rating_summary"];
  headline: string;
  generatedAt: string;
}

export interface LiveFrameExperience {
  userId: string;
  identity: FrameIdentity;
  summary: FrameSummary;
  progress: FrameProgress;
  evolution: FrameEvolution;
  positiveDrivers: FrameDriver[];
  negativeDrivers: FrameDriver[];
  platformContext: PlatformTrustContext;
  generatedAt: Date;
}

export interface FrameIdentityView {
  user_id: string;
  provider_id: string;
  display_name: string;
  verification_tier: string;
  live_frame: LiveFrameView;
}

export interface FrameSummaryView {
  trust_score: number;
  tier: TrustLiveFrameTier;
  tier_label: string;
  color: string;
  badge_label: string;
  badge_description: string;
  headline: string;
}

export interface FrameProgressView {
  current_tier: TrustLiveFrameTier;
  current_tier_label: string;
  next_tier: TrustLiveFrameTier | null;
  next_tier_label: string | null;
  current_score: number;
  next_tier_minimum_score: number | null;
  points_to_next_tier: number;
  progress_percent: number;
  at_max_tier: boolean;
  summary: string;
}

export interface FrameEvolutionPointView {
  date: string;
  positive_events: number;
  negative_events: number;
  neutral_events: number;
  net_impact: number;
}

export interface FrameEvolutionView {
  window_days: number;
  points: FrameEvolutionPointView[];
  positive_event_count: number;
  negative_event_count: number;
  neutral_event_count: number;
  net_direction: "up" | "down" | "stable";
  summary: string;
}

export interface FrameDriverView {
  driver_code: string;
  title: string;
  description: string;
  score: number;
  weight_percent: number;
  impact: "positive" | "negative" | "neutral";
}

export interface PlatformTrustContextView {
  providers_with_scores: number;
  average_trust_score: number;
  low_trust_provider_count: number;
  tier_distribution: Array<{ tier: string; count: number }>;
  trust_events_last_7_days: number;
  trust_events_last_30_days: number;
}

export interface LiveFrameExperienceView {
  user_id: string;
  identity: FrameIdentityView;
  summary: FrameSummaryView;
  progress: FrameProgressView;
  evolution: FrameEvolutionView;
  positive_drivers: FrameDriverView[];
  negative_drivers: FrameDriverView[];
  platform_context: PlatformTrustContextView;
  generated_at: string;
}

const TIER_LADDER: ReadonlyArray<{
  tier: TrustLiveFrameTier;
  minScore: number;
  label: string;
}> = [
  { tier: "RESTRICTED", minScore: 0, label: "Restricted" },
  { tier: "STANDARD", minScore: 50, label: "Standard" },
  { tier: "SAPPHIRE_VERIFIED", minScore: 70, label: "Sapphire Verified" },
  { tier: "EMERALD_PRO", minScore: 85, label: "Emerald Pro" },
  { tier: "PLATINUM_ELITE", minScore: 95, label: "Platinum Elite" },
];

const POSITIVE_DRIVER_THRESHOLD = 70;
const NEGATIVE_DRIVER_THRESHOLD = 60;

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toDateKey(value: Date | string): string {
  return toIsoString(value).slice(0, 10);
}

export function buildFrameIdentity(
  profile: TrustProfileView,
  verificationTier: string
): FrameIdentity {
  return {
    userId: profile.user_id,
    providerId: profile.provider_id,
    displayName: profile.display_name,
    verificationTier,
    liveFrame: profile.live_frame,
  };
}

export function buildFrameSummary(profile: TrustProfileView): FrameSummary {
  return {
    trustScore: profile.trust_score,
    tier: profile.live_frame.tier as TrustLiveFrameTier,
    tierLabel: profile.live_frame.label,
    color: profile.live_frame.color,
    badgeLabel: profile.badge.label,
    badgeDescription: profile.badge.description,
    headline: `${profile.live_frame.label} live frame at ${profile.trust_score} trust score.`,
  };
}

export function buildFrameProgress(
  trustScore: number,
  currentTier: TrustLiveFrameTier
): FrameProgress {
  const currentIndex = TIER_LADDER.findIndex((entry) => entry.tier === currentTier);
  const current = TIER_LADDER[currentIndex >= 0 ? currentIndex : 0];
  const next = currentIndex >= 0 && currentIndex < TIER_LADDER.length - 1
    ? TIER_LADDER[currentIndex + 1]
    : null;
  const clampedScore = Math.max(0, Math.min(100, Math.round(trustScore)));

  if (!next) {
    return {
      currentTier: current.tier,
      currentTierLabel: current.label,
      nextTier: null,
      nextTierLabel: null,
      currentScore: clampedScore,
      nextTierMinimumScore: null,
      pointsToNextTier: 0,
      progressPercent: 100,
      atMaxTier: true,
      summary: `You are at the highest live frame tier (${current.label}).`,
    };
  }

  const span = next.minScore - current.minScore;
  const progressPercent =
    span <= 0 ? 100 : Math.max(0, Math.min(100, Math.round(((clampedScore - current.minScore) / span) * 100)));
  const pointsToNextTier = Math.max(0, next.minScore - clampedScore);

  return {
    currentTier: current.tier,
    currentTierLabel: current.label,
    nextTier: next.tier,
    nextTierLabel: next.label,
    currentScore: clampedScore,
    nextTierMinimumScore: next.minScore,
    pointsToNextTier,
    progressPercent,
    atMaxTier: false,
    summary:
      pointsToNextTier === 0
        ? `You reached ${next.label}. Maintain your trust signals to keep this tier.`
        : `${pointsToNextTier} point${pointsToNextTier === 1 ? "" : "s"} to reach ${next.label}.`,
  };
}

export function buildFrameEvolution(
  history: TrustHistoryView,
  windowDays = 30,
  referenceDate: Date = new Date()
): FrameEvolution {
  const windowStart = new Date(referenceDate);
  windowStart.setUTCDate(windowStart.getUTCDate() - windowDays);

  const recentEntries = history.entries.filter((entry) => {
    const occurredAt = new Date(entry.occurred_at);
    return occurredAt >= windowStart && occurredAt <= referenceDate;
  });

  const buckets = new Map<string, FrameEvolutionPoint>();
  for (const entry of recentEntries) {
    const date = toDateKey(entry.occurred_at);
    const bucket =
      buckets.get(date) ??
      ({
        date,
        positiveEvents: 0,
        negativeEvents: 0,
        neutralEvents: 0,
        netImpact: 0,
      } satisfies FrameEvolutionPoint);

    if (entry.score_impact === "positive") {
      bucket.positiveEvents += 1;
      bucket.netImpact += 1;
    } else if (entry.score_impact === "negative") {
      bucket.negativeEvents += 1;
      bucket.netImpact -= 1;
    } else {
      bucket.neutralEvents += 1;
    }

    buckets.set(date, bucket);
  }

  const points = [...buckets.values()].sort((left, right) => left.date.localeCompare(right.date));
  const positiveEventCount = points.reduce((total, point) => total + point.positiveEvents, 0);
  const negativeEventCount = points.reduce((total, point) => total + point.negativeEvents, 0);
  const neutralEventCount = points.reduce((total, point) => total + point.neutralEvents, 0);
  const netImpactTotal = points.reduce((total, point) => total + point.netImpact, 0);

  let netDirection: FrameEvolution["netDirection"] = "stable";
  if (netImpactTotal > 0) netDirection = "up";
  if (netImpactTotal < 0) netDirection = "down";

  const summary =
    recentEntries.length === 0
      ? `No trust events recorded in the last ${windowDays} days.`
      : `${recentEntries.length} trust event${recentEntries.length === 1 ? "" : "s"} in the last ${windowDays} days with ${netDirection} net movement.`;

  return {
    windowDays,
    points,
    positiveEventCount,
    negativeEventCount,
    neutralEventCount,
    netDirection,
    summary,
  };
}

export function buildFrameDrivers(profile: TrustProfileView): {
  positiveDrivers: FrameDriver[];
  negativeDrivers: FrameDriver[];
} {
  const drivers: FrameDriver[] = [
    {
      driverCode: "verification",
      title: "Verification",
      description: "Identity verification tier and credential strength.",
      score: profile.breakdown.verification_score,
      weightPercent: Math.round(profile.breakdown.weights.verification * 100),
      impact: "neutral",
    },
    {
      driverCode: "customer_rating",
      title: "Customer rating",
      description: "Average customer evaluation scores.",
      score: profile.breakdown.customer_rating_score,
      weightPercent: Math.round(profile.breakdown.weights.customer_rating * 100),
      impact: "neutral",
    },
    {
      driverCode: "completion_rate",
      title: "Completion rate",
      description: "Successful contract completion history.",
      score: profile.breakdown.completion_rate_score,
      weightPercent: Math.round(profile.breakdown.weights.completion_rate * 100),
      impact: "neutral",
    },
    {
      driverCode: "clean_record",
      title: "Clean record",
      description: "Issue and cancellation impact on trust.",
      score: profile.breakdown.clean_record_score,
      weightPercent: Math.round(profile.breakdown.weights.clean_record * 100),
      impact: "neutral",
    },
  ].map((driver) => ({
    ...driver,
    impact:
      driver.score >= POSITIVE_DRIVER_THRESHOLD
        ? ("positive" as const)
        : driver.score < NEGATIVE_DRIVER_THRESHOLD
          ? ("negative" as const)
          : ("neutral" as const),
  }));

  const positiveDrivers = drivers
    .filter((driver) => driver.impact === "positive")
    .sort((left, right) => right.score - left.score || left.driverCode.localeCompare(right.driverCode));
  const negativeDrivers = drivers
    .filter((driver) => driver.impact === "negative")
    .sort((left, right) => left.score - right.score || left.driverCode.localeCompare(right.driverCode));

  return { positiveDrivers, negativeDrivers };
}

export function buildFramePublicView(profile: ProviderPublicProfileView): FramePublicView {
  return {
    providerId: profile.provider_id,
    userId: profile.user_id,
    displayName: profile.display_name,
    trustScore: profile.trust_score,
    liveFrame: profile.live_frame,
    badge: profile.badge,
    trustBreakdown: profile.trust_breakdown,
    completionSummary: profile.completion_summary,
    disputeSummary: profile.dispute_summary,
    ratingSummary: profile.rating_summary,
    headline: `${profile.display_name} — ${profile.live_frame.label} (${profile.trust_score} trust score).`,
    generatedAt: profile.generated_at,
  };
}

export function buildLiveFrameExperience(input: {
  profile: TrustProfileView;
  history: TrustHistoryView;
  platformContext: PlatformTrustContext;
  verificationTier: string;
  generatedAt?: Date;
}): LiveFrameExperience {
  const { positiveDrivers, negativeDrivers } = buildFrameDrivers(input.profile);

  return {
    userId: input.profile.user_id,
    identity: buildFrameIdentity(input.profile, input.verificationTier),
    summary: buildFrameSummary(input.profile),
    progress: buildFrameProgress(
      input.profile.trust_score,
      input.profile.live_frame.tier as TrustLiveFrameTier
    ),
    evolution: buildFrameEvolution(input.history, 30, input.generatedAt ?? new Date()),
    positiveDrivers,
    negativeDrivers,
    platformContext: input.platformContext,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toFrameIdentityView(identity: FrameIdentity): FrameIdentityView {
  return {
    user_id: identity.userId,
    provider_id: identity.providerId,
    display_name: identity.displayName,
    verification_tier: identity.verificationTier,
    live_frame: identity.liveFrame,
  };
}

export function toFrameSummaryView(summary: FrameSummary): FrameSummaryView {
  return {
    trust_score: summary.trustScore,
    tier: summary.tier,
    tier_label: summary.tierLabel,
    color: summary.color,
    badge_label: summary.badgeLabel,
    badge_description: summary.badgeDescription,
    headline: summary.headline,
  };
}

export function toFrameProgressView(progress: FrameProgress): FrameProgressView {
  return {
    current_tier: progress.currentTier,
    current_tier_label: progress.currentTierLabel,
    next_tier: progress.nextTier,
    next_tier_label: progress.nextTierLabel,
    current_score: progress.currentScore,
    next_tier_minimum_score: progress.nextTierMinimumScore,
    points_to_next_tier: progress.pointsToNextTier,
    progress_percent: progress.progressPercent,
    at_max_tier: progress.atMaxTier,
    summary: progress.summary,
  };
}

export function toFrameEvolutionPointView(point: FrameEvolutionPoint): FrameEvolutionPointView {
  return {
    date: point.date,
    positive_events: point.positiveEvents,
    negative_events: point.negativeEvents,
    neutral_events: point.neutralEvents,
    net_impact: point.netImpact,
  };
}

export function toFrameEvolutionView(evolution: FrameEvolution): FrameEvolutionView {
  return {
    window_days: evolution.windowDays,
    points: evolution.points.map(toFrameEvolutionPointView),
    positive_event_count: evolution.positiveEventCount,
    negative_event_count: evolution.negativeEventCount,
    neutral_event_count: evolution.neutralEventCount,
    net_direction: evolution.netDirection,
    summary: evolution.summary,
  };
}

export function toFrameDriverView(driver: FrameDriver): FrameDriverView {
  return {
    driver_code: driver.driverCode,
    title: driver.title,
    description: driver.description,
    score: driver.score,
    weight_percent: driver.weightPercent,
    impact: driver.impact,
  };
}

export function toPlatformTrustContextView(
  context: PlatformTrustContext
): PlatformTrustContextView {
  return {
    providers_with_scores: context.providersWithScores,
    average_trust_score: context.averageTrustScore,
    low_trust_provider_count: context.lowTrustProviderCount,
    tier_distribution: context.tierDistribution,
    trust_events_last_7_days: context.trustEventsLast7Days,
    trust_events_last_30_days: context.trustEventsLast30Days,
  };
}

export function toLiveFrameExperienceView(
  experience: LiveFrameExperience
): LiveFrameExperienceView {
  return {
    user_id: experience.userId,
    identity: toFrameIdentityView(experience.identity),
    summary: toFrameSummaryView(experience.summary),
    progress: toFrameProgressView(experience.progress),
    evolution: toFrameEvolutionView(experience.evolution),
    positive_drivers: experience.positiveDrivers.map(toFrameDriverView),
    negative_drivers: experience.negativeDrivers.map(toFrameDriverView),
    platform_context: toPlatformTrustContextView(experience.platformContext),
    generated_at: toIsoString(experience.generatedAt),
  };
}

export function toFramePublicViewSnakeCase(view: FramePublicView) {
  return {
    provider_id: view.providerId,
    user_id: view.userId,
    display_name: view.displayName,
    trust_score: view.trustScore,
    live_frame: view.liveFrame,
    badge: view.badge,
    trust_breakdown: view.trustBreakdown,
    completion_summary: view.completionSummary,
    dispute_summary: view.disputeSummary,
    rating_summary: view.ratingSummary,
    headline: view.headline,
    generated_at: view.generatedAt,
  };
}
