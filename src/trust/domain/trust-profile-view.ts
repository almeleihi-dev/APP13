import type { TrustProfile, LiveFrame, TrustHistory, TrustBreakdown, TrustBadge } from "./trust-profile.js";

export interface TrustBreakdownView {
  verification_score: number;
  customer_rating_score: number;
  completion_rate_score: number;
  clean_record_score: number;
  weights: {
    verification: number;
    customer_rating: number;
    completion_rate: number;
    clean_record: number;
  };
  total_score: number;
}

export interface TrustBadgeView {
  badge_id: string;
  label: string;
  tier: string;
  description: string;
}

export interface TrustHistoryEntryView {
  event_id: string;
  event_type: string;
  title: string;
  description: string;
  occurred_at: string;
  score_impact: string;
}

export interface TrustHistoryView {
  provider_id: string;
  entries: TrustHistoryEntryView[];
}

export interface LiveFrameView {
  provider_id: string;
  user_id: string;
  trust_score: number;
  tier: string;
  color: string;
  label: string;
  generated_at: string;
}

export interface TrustProfileView {
  provider_id: string;
  user_id: string;
  display_name: string;
  trust_score: number;
  breakdown: TrustBreakdownView;
  live_frame: LiveFrameView;
  badge: TrustBadgeView;
  history: TrustHistoryView;
  completed_contracts: number;
  average_rating: number;
  generated_at: string;
}

function toBreakdownView(breakdown: TrustBreakdown): TrustBreakdownView {
  return {
    verification_score: breakdown.verificationScore,
    customer_rating_score: breakdown.customerRatingScore,
    completion_rate_score: breakdown.completionRateScore,
    clean_record_score: breakdown.cleanRecordScore,
    weights: {
      verification: breakdown.weights.verification,
      customer_rating: breakdown.weights.customerRating,
      completion_rate: breakdown.weights.completionRate,
      clean_record: breakdown.weights.cleanRecord,
    },
    total_score: breakdown.totalScore,
  };
}

function toBadgeView(badge: TrustBadge): TrustBadgeView {
  return {
    badge_id: badge.badgeId,
    label: badge.label,
    tier: badge.tier,
    description: badge.description,
  };
}

export function toTrustHistoryView(history: TrustHistory): TrustHistoryView {
  return {
    provider_id: history.providerId,
    entries: history.entries.map((entry) => ({
      event_id: entry.eventId,
      event_type: entry.eventType,
      title: entry.title,
      description: entry.description,
      occurred_at: entry.occurredAt.toISOString(),
      score_impact: entry.scoreImpact,
    })),
  };
}

export function toLiveFrameView(profile: TrustProfile): LiveFrameView {
  return toLiveFrameViewFromFrame(profile.userId, profile.liveFrame);
}

export function toLiveFrameViewFromFrame(userId: string, frame: LiveFrame): LiveFrameView {
  return {
    provider_id: frame.providerId,
    user_id: userId,
    trust_score: frame.trustScore,
    tier: frame.tier,
    color: frame.color,
    label: frame.label,
    generated_at: frame.generatedAt.toISOString(),
  };
}

export function toTrustProfileView(profile: TrustProfile): TrustProfileView {
  return {
    provider_id: profile.providerId,
    user_id: profile.userId,
    display_name: profile.displayName,
    trust_score: profile.trustScore,
    breakdown: toBreakdownView(profile.breakdown),
    live_frame: toLiveFrameView(profile),
    badge: toBadgeView(profile.badge),
    history: toTrustHistoryView(profile.history),
    completed_contracts: profile.completedContracts,
    average_rating: profile.averageRating,
    generated_at: profile.generatedAt.toISOString(),
  };
}
