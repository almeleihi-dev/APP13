import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import type {
  LiveFrameView,
  TrustHistoryView,
  TrustProfileView,
} from "../../../trust/domain/trust-profile-view.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import {
  buildFrameDrivers,
  buildFrameEvolution,
  buildFrameIdentity,
  buildFrameProgress,
  buildFramePublicView,
  buildFrameSummary,
  type PlatformTrustContext,
} from "../../live-frame/domain/live-frame-experience.js";

export interface TrustReputationSnapshot {
  profile: TrustProfileView;
  history: TrustHistoryView;
  platformContext: PlatformTrustContext;
  verificationTier: string;
  inboxTrustEvents: Array<{
    eventId: string;
    eventType: string;
    title: string;
    description: string;
    occurredAt: Date;
  }>;
}

export interface TrustOverview {
  userId: string;
  providerId: string;
  displayName: string;
  verificationTier: string;
  trustScore: number;
  tier: TrustLiveFrameTier;
  tierLabel: string;
  color: string;
  badgeLabel: string;
  badgeDescription: string;
  completedContracts: number;
  averageRating: number;
  platformAverageScore: number;
  platformProvidersWithScores: number;
  headline: string;
  summary: string;
}

export interface TrustDriver {
  driverCode: string;
  title: string;
  description: string;
  score: number;
  weightPercent: number;
  impact: "positive" | "negative" | "neutral";
  summary: string;
}

export interface TrustProgress {
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

export interface TrustTimelineEntry {
  entryId: string;
  entryType: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: "trust_history" | "inbox";
  scoreImpact: "positive" | "negative" | "neutral" | null;
}

export interface TrustTimeline {
  windowDays: number;
  entries: TrustTimelineEntry[];
  positiveEventCount: number;
  negativeEventCount: number;
  neutralEventCount: number;
  netDirection: "up" | "down" | "stable";
  summary: string;
}

export interface TrustReputationSummary {
  trustScore: number;
  tierLabel: string;
  positiveDriverCount: number;
  negativeDriverCount: number;
  recentEventCount: number;
  reputationLabel: string;
  summary: string;
}

export interface TrustPublicCard {
  providerId: string;
  userId: string;
  displayName: string;
  trustScore: number;
  liveFrame: LiveFrameView;
  badgeLabel: string;
  completionSummary: ProviderPublicProfileView["completion_summary"];
  disputeSummary: ProviderPublicProfileView["dispute_summary"];
  ratingSummary: ProviderPublicProfileView["rating_summary"];
  headline: string;
  safeForPublic: boolean;
  generatedAt: string;
}

export interface TrustReputationExperience {
  userId: string;
  overview: TrustOverview;
  positiveDrivers: TrustDriver[];
  negativeDrivers: TrustDriver[];
  progress: TrustProgress;
  timeline: TrustTimeline;
  reputation: TrustReputationSummary;
  platformContext: PlatformTrustContext;
  generatedAt: Date;
}

export interface TrustOverviewView {
  user_id: string;
  provider_id: string;
  display_name: string;
  verification_tier: string;
  trust_score: number;
  tier: TrustLiveFrameTier;
  tier_label: string;
  color: string;
  badge_label: string;
  badge_description: string;
  completed_contracts: number;
  average_rating: number;
  platform_average_score: number;
  platform_providers_with_scores: number;
  headline: string;
  summary: string;
}

export interface TrustDriverView {
  driver_code: string;
  title: string;
  description: string;
  score: number;
  weight_percent: number;
  impact: "positive" | "negative" | "neutral";
  summary: string;
}

export interface TrustProgressView {
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

export interface TrustTimelineEntryView {
  entry_id: string;
  entry_type: string;
  title: string;
  description: string;
  occurred_at: string;
  source: "trust_history" | "inbox";
  score_impact: "positive" | "negative" | "neutral" | null;
}

export interface TrustTimelineView {
  window_days: number;
  entries: TrustTimelineEntryView[];
  positive_event_count: number;
  negative_event_count: number;
  neutral_event_count: number;
  net_direction: "up" | "down" | "stable";
  summary: string;
}

export interface TrustReputationSummaryView {
  trust_score: number;
  tier_label: string;
  positive_driver_count: number;
  negative_driver_count: number;
  recent_event_count: number;
  reputation_label: string;
  summary: string;
}

export interface TrustPublicCardView {
  provider_id: string;
  user_id: string;
  display_name: string;
  trust_score: number;
  live_frame: LiveFrameView;
  badge_label: string;
  completion_summary: ProviderPublicProfileView["completion_summary"];
  dispute_summary: ProviderPublicProfileView["dispute_summary"];
  rating_summary: ProviderPublicProfileView["rating_summary"];
  headline: string;
  safe_for_public: boolean;
  generated_at: string;
}

export interface TrustReputationExperienceView {
  user_id: string;
  overview: TrustOverviewView;
  positive_drivers: TrustDriverView[];
  negative_drivers: TrustDriverView[];
  progress: TrustProgressView;
  timeline: TrustTimelineView;
  reputation: TrustReputationSummaryView;
  platform_context: {
    providers_with_scores: number;
    average_trust_score: number;
    low_trust_provider_count: number;
    tier_distribution: Array<{ tier: string; count: number }>;
    trust_events_last_7_days: number;
    trust_events_last_30_days: number;
  };
  generated_at: string;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function mapDriver(driver: ReturnType<typeof buildFrameDrivers>["positiveDrivers"][number]): TrustDriver {
  return {
    driverCode: driver.driverCode,
    title: driver.title,
    description: driver.description,
    score: driver.score,
    weightPercent: driver.weightPercent,
    impact: driver.impact,
    summary: `${driver.title} contributes ${driver.weightPercent}% weight at score ${driver.score}.`,
  };
}

export function buildTrustOverview(input: {
  profile: TrustProfileView;
  platformContext: PlatformTrustContext;
  verificationTier: string;
}): TrustOverview {
  const summary = buildFrameSummary(input.profile);
  const identity = buildFrameIdentity(input.profile, input.verificationTier);

  return {
    userId: identity.userId,
    providerId: identity.providerId,
    displayName: identity.displayName,
    verificationTier: identity.verificationTier,
    trustScore: summary.trustScore,
    tier: summary.tier,
    tierLabel: summary.tierLabel,
    color: summary.color,
    badgeLabel: summary.badgeLabel,
    badgeDescription: summary.badgeDescription,
    completedContracts: input.profile.completed_contracts,
    averageRating: input.profile.average_rating,
    platformAverageScore: input.platformContext.averageTrustScore,
    platformProvidersWithScores: input.platformContext.providersWithScores,
    headline: summary.headline,
    summary: `Trust score ${summary.trustScore} with ${summary.tierLabel} tier across ${input.profile.completed_contracts} completed contract${input.profile.completed_contracts === 1 ? "" : "s"}.`,
  };
}

export function buildTrustDrivers(profile: TrustProfileView): {
  positiveDrivers: TrustDriver[];
  negativeDrivers: TrustDriver[];
} {
  const { positiveDrivers, negativeDrivers } = buildFrameDrivers(profile);
  return {
    positiveDrivers: positiveDrivers.map(mapDriver),
    negativeDrivers: negativeDrivers.map(mapDriver),
  };
}

export function buildTrustProgress(
  trustScore: number,
  currentTier: TrustLiveFrameTier
): TrustProgress {
  return buildFrameProgress(trustScore, currentTier);
}

export function buildTrustTimeline(input: {
  history: TrustHistoryView;
  inboxEvents: TrustReputationSnapshot["inboxTrustEvents"];
  windowDays?: number;
  referenceDate?: Date;
}): TrustTimeline {
  const windowDays = input.windowDays ?? 30;
  const referenceDate = input.referenceDate ?? new Date();
  const windowStart = new Date(referenceDate);
  windowStart.setUTCDate(windowStart.getUTCDate() - windowDays);

  const historyEntries: TrustTimelineEntry[] = input.history.entries
    .filter((entry) => {
      const occurredAt = new Date(entry.occurred_at);
      return occurredAt >= windowStart && occurredAt <= referenceDate;
    })
    .map((entry) => ({
      entryId: entry.event_id,
      entryType: entry.event_type,
      title: entry.title,
      description: entry.description,
      occurredAt: new Date(entry.occurred_at),
      source: "trust_history" as const,
      scoreImpact:
        entry.score_impact === "positive" || entry.score_impact === "negative"
          ? entry.score_impact
          : ("neutral" as const),
    }));

  const inboxEntries: TrustTimelineEntry[] = input.inboxEvents
    .filter((event) => event.occurredAt >= windowStart && event.occurredAt <= referenceDate)
    .map((event) => ({
      entryId: event.eventId,
      entryType: event.eventType,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      source: "inbox" as const,
      scoreImpact: null,
    }));

  const entries = [...historyEntries, ...inboxEntries].sort(
    (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime()
  );

  const evolution = buildFrameEvolution(input.history, windowDays, referenceDate);
  const positiveEventCount = evolution.positiveEventCount;
  const negativeEventCount = evolution.negativeEventCount;
  const neutralEventCount = evolution.neutralEventCount + inboxEntries.length;

  return {
    windowDays,
    entries,
    positiveEventCount,
    negativeEventCount,
    neutralEventCount,
    netDirection: evolution.netDirection,
    summary:
      entries.length === 0
        ? `No trust timeline entries recorded in the last ${windowDays} days.`
        : `${entries.length} trust timeline entr${entries.length === 1 ? "y" : "ies"} in the last ${windowDays} days with ${evolution.netDirection} net movement.`,
  };
}

export function buildTrustReputationSummary(input: {
  profile: TrustProfileView;
  positiveDrivers: TrustDriver[];
  negativeDrivers: TrustDriver[];
  timeline: TrustTimeline;
}): TrustReputationSummary {
  const tierLabel = input.profile.live_frame.label;
  const reputationLabel =
    input.profile.trust_score >= 85
      ? "Strong reputation"
      : input.profile.trust_score >= 70
        ? "Established reputation"
        : input.profile.trust_score >= 50
          ? "Developing reputation"
          : "Restricted reputation";

  return {
    trustScore: input.profile.trust_score,
    tierLabel,
    positiveDriverCount: input.positiveDrivers.length,
    negativeDriverCount: input.negativeDrivers.length,
    recentEventCount: input.timeline.entries.length,
    reputationLabel,
    summary: `${reputationLabel} at ${input.profile.trust_score} with ${input.positiveDrivers.length} positive and ${input.negativeDrivers.length} negative trust driver${input.negativeDrivers.length === 1 ? "" : "s"}.`,
  };
}

export function buildTrustPublicCard(profile: ProviderPublicProfileView): TrustPublicCard {
  const publicView = buildFramePublicView(profile);

  return {
    providerId: publicView.providerId,
    userId: publicView.userId,
    displayName: publicView.displayName,
    trustScore: publicView.trustScore,
    liveFrame: publicView.liveFrame,
    badgeLabel: publicView.badge.label,
    completionSummary: publicView.completionSummary,
    disputeSummary: publicView.disputeSummary,
    ratingSummary: publicView.ratingSummary,
    headline: publicView.headline,
    safeForPublic: true,
    generatedAt: publicView.generatedAt,
  };
}

export function buildTrustReputationExperience(input: {
  snapshot: TrustReputationSnapshot;
  generatedAt?: Date;
}): TrustReputationExperience {
  const generatedAt = input.generatedAt ?? new Date();
  const overview = buildTrustOverview({
    profile: input.snapshot.profile,
    platformContext: input.snapshot.platformContext,
    verificationTier: input.snapshot.verificationTier,
  });
  const { positiveDrivers, negativeDrivers } = buildTrustDrivers(input.snapshot.profile);
  const progress = buildTrustProgress(
    input.snapshot.profile.trust_score,
    input.snapshot.profile.live_frame.tier as TrustLiveFrameTier
  );
  const timeline = buildTrustTimeline({
    history: input.snapshot.history,
    inboxEvents: input.snapshot.inboxTrustEvents,
    referenceDate: generatedAt,
  });
  const reputation = buildTrustReputationSummary({
    profile: input.snapshot.profile,
    positiveDrivers,
    negativeDrivers,
    timeline,
  });

  return {
    userId: input.snapshot.profile.user_id,
    overview,
    positiveDrivers,
    negativeDrivers,
    progress,
    timeline,
    reputation,
    platformContext: input.snapshot.platformContext,
    generatedAt,
  };
}

export function toTrustOverviewView(overview: TrustOverview): TrustOverviewView {
  return {
    user_id: overview.userId,
    provider_id: overview.providerId,
    display_name: overview.displayName,
    verification_tier: overview.verificationTier,
    trust_score: overview.trustScore,
    tier: overview.tier,
    tier_label: overview.tierLabel,
    color: overview.color,
    badge_label: overview.badgeLabel,
    badge_description: overview.badgeDescription,
    completed_contracts: overview.completedContracts,
    average_rating: overview.averageRating,
    platform_average_score: overview.platformAverageScore,
    platform_providers_with_scores: overview.platformProvidersWithScores,
    headline: overview.headline,
    summary: overview.summary,
  };
}

export function toTrustDriverView(driver: TrustDriver): TrustDriverView {
  return {
    driver_code: driver.driverCode,
    title: driver.title,
    description: driver.description,
    score: driver.score,
    weight_percent: driver.weightPercent,
    impact: driver.impact,
    summary: driver.summary,
  };
}

export function toTrustProgressView(progress: TrustProgress): TrustProgressView {
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

export function toTrustTimelineEntryView(entry: TrustTimelineEntry): TrustTimelineEntryView {
  return {
    entry_id: entry.entryId,
    entry_type: entry.entryType,
    title: entry.title,
    description: entry.description,
    occurred_at: toIsoString(entry.occurredAt),
    source: entry.source,
    score_impact: entry.scoreImpact,
  };
}

export function toTrustTimelineView(timeline: TrustTimeline): TrustTimelineView {
  return {
    window_days: timeline.windowDays,
    entries: timeline.entries.map(toTrustTimelineEntryView),
    positive_event_count: timeline.positiveEventCount,
    negative_event_count: timeline.negativeEventCount,
    neutral_event_count: timeline.neutralEventCount,
    net_direction: timeline.netDirection,
    summary: timeline.summary,
  };
}

export function toTrustReputationSummaryView(
  summary: TrustReputationSummary
): TrustReputationSummaryView {
  return {
    trust_score: summary.trustScore,
    tier_label: summary.tierLabel,
    positive_driver_count: summary.positiveDriverCount,
    negative_driver_count: summary.negativeDriverCount,
    recent_event_count: summary.recentEventCount,
    reputation_label: summary.reputationLabel,
    summary: summary.summary,
  };
}

export function toTrustPublicCardView(card: TrustPublicCard): TrustPublicCardView {
  return {
    provider_id: card.providerId,
    user_id: card.userId,
    display_name: card.displayName,
    trust_score: card.trustScore,
    live_frame: card.liveFrame,
    badge_label: card.badgeLabel,
    completion_summary: card.completionSummary,
    dispute_summary: card.disputeSummary,
    rating_summary: card.ratingSummary,
    headline: card.headline,
    safe_for_public: card.safeForPublic,
    generated_at: card.generatedAt,
  };
}

export function toTrustReputationExperienceView(
  experience: TrustReputationExperience
): TrustReputationExperienceView {
  return {
    user_id: experience.userId,
    overview: toTrustOverviewView(experience.overview),
    positive_drivers: experience.positiveDrivers.map(toTrustDriverView),
    negative_drivers: experience.negativeDrivers.map(toTrustDriverView),
    progress: toTrustProgressView(experience.progress),
    timeline: toTrustTimelineView(experience.timeline),
    reputation: toTrustReputationSummaryView(experience.reputation),
    platform_context: {
      providers_with_scores: experience.platformContext.providersWithScores,
      average_trust_score: experience.platformContext.averageTrustScore,
      low_trust_provider_count: experience.platformContext.lowTrustProviderCount,
      tier_distribution: experience.platformContext.tierDistribution,
      trust_events_last_7_days: experience.platformContext.trustEventsLast7Days,
      trust_events_last_30_days: experience.platformContext.trustEventsLast30Days,
    },
    generated_at: toIsoString(experience.generatedAt),
  };
}
