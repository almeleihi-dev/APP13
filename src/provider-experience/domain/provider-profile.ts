import type { VerificationTier } from "../../identity/domain/user.js";
import type { TrustEventType } from "../../trust/domain/trust-event.js";
import { TrustEventTypes } from "../../trust/domain/trust-event.js";
import type { TrustProfileView } from "../../trust/domain/trust-profile-view.js";

export interface ProviderIdentitySummary {
  providerId: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  bio: string | null;
  primaryTrade: string | null;
  slug: string | null;
  status: string;
  verificationTier: VerificationTier;
}

export interface OfferedActionSummary {
  actionCode: string;
  actionName: string;
  confidence: number;
}

export interface CompletionSummary {
  completedContracts: number;
  cancelledContracts: number;
  completionRate: number;
  summary: string;
}

export interface DisputeSummary {
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  summary: string;
}

export interface RatingSummary {
  averageRating: number;
  evaluationCount: number;
  summary: string;
}

export interface AvailabilitySummary {
  availableNow: boolean;
  activeContracts: number;
  estimatedStartDays: number;
  statusLabel: string;
}

export interface ProviderPublicProfile {
  identity: ProviderIdentitySummary;
  offeredActions: OfferedActionSummary[];
  trust: TrustProfileView;
  completion: CompletionSummary;
  dispute: DisputeSummary;
  rating: RatingSummary;
  availability: AvailabilitySummary;
  generatedAt: Date;
}

export interface ProviderPublicProfileView {
  provider_id: string;
  user_id: string;
  display_name: string;
  business_name: string | null;
  bio: string | null;
  primary_trade: string | null;
  slug: string | null;
  status: string;
  verification_tier: VerificationTier;
  offered_actions: Array<{
    action_code: string;
    action_name: string;
    confidence: number;
  }>;
  trust_score: number;
  live_frame: TrustProfileView["live_frame"];
  badge: TrustProfileView["badge"];
  trust_breakdown: TrustProfileView["breakdown"];
  completion_summary: {
    completed_contracts: number;
    cancelled_contracts: number;
    completion_rate: number;
    summary: string;
  };
  dispute_summary: {
    issues_raised: number;
    issues_resolved: number;
    active_issues: number;
    summary: string;
  };
  rating_summary: {
    average_rating: number;
    evaluation_count: number;
    summary: string;
  };
  availability: {
    available_now: boolean;
    active_contracts: number;
    estimated_start_days: number;
    status_label: string;
  };
  generated_at: string;
}

export interface ProviderProfileMetricsInput {
  completedContracts: number;
  cancelledContracts: number;
  completionRate: number;
  averageRating: number;
  evaluationCount: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
}

export interface ProviderProfileAvailabilityInput {
  activeContracts: number;
  providerStatus: string;
}

function roundRate(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 1000) / 1000;
}

function roundRating(value: number): number {
  return Math.round(Math.max(0, Math.min(5, value)) * 10) / 10;
}

export function buildCompletionSummary(metrics: ProviderProfileMetricsInput): CompletionSummary {
  const completionRate = roundRate(metrics.completionRate);
  const summary =
    metrics.completedContracts === 0
      ? "No completed contracts recorded yet."
      : `${metrics.completedContracts} completed contract${
          metrics.completedContracts === 1 ? "" : "s"
        } with a ${Math.round(completionRate * 100)}% completion rate.`;

  return {
    completedContracts: metrics.completedContracts,
    cancelledContracts: metrics.cancelledContracts,
    completionRate,
    summary,
  };
}

export function buildDisputeSummary(metrics: ProviderProfileMetricsInput): DisputeSummary {
  let summary = "No dispute activity on record.";
  if (metrics.activeIssues > 0) {
    summary = `${metrics.activeIssues} active dispute${
      metrics.activeIssues === 1 ? "" : "s"
    } on record. Details are not shown on public profiles.`;
  } else if (metrics.issuesResolved > 0) {
    summary = `${metrics.issuesResolved} resolved dispute${
      metrics.issuesResolved === 1 ? "" : "s"
    } with no active disputes.`;
  } else if (metrics.issuesRaised > 0) {
    summary = `${metrics.issuesRaised} dispute${
      metrics.issuesRaised === 1 ? "" : "s"
    } recorded with no active disputes.`;
  }

  return {
    issuesRaised: metrics.issuesRaised,
    issuesResolved: metrics.issuesResolved,
    activeIssues: metrics.activeIssues,
    summary,
  };
}

export function buildRatingSummary(metrics: ProviderProfileMetricsInput): RatingSummary {
  const averageRating = roundRating(metrics.averageRating);
  const summary =
    metrics.evaluationCount === 0
      ? "No customer evaluations submitted yet."
      : `Average customer rating ${averageRating} from ${metrics.evaluationCount} evaluation${
          metrics.evaluationCount === 1 ? "" : "s"
        }.`;

  return {
    averageRating,
    evaluationCount: metrics.evaluationCount,
    summary,
  };
}

export function buildAvailabilitySummary(
  input: ProviderProfileAvailabilityInput
): AvailabilitySummary {
  const activeContracts = Math.max(0, input.activeContracts);
  const isActiveProvider = input.providerStatus === "active";
  const availableNow = isActiveProvider && activeContracts < 5;
  const estimatedStartDays = availableNow
    ? Math.max(0, activeContracts * 3)
    : Math.max(7, activeContracts * 7);

  let statusLabel = "Limited availability";
  if (!isActiveProvider) {
    statusLabel = "Currently unavailable";
  } else if (availableNow && activeContracts === 0) {
    statusLabel = "Available now";
  } else if (availableNow) {
    statusLabel = "Available with short start delay";
  }

  return {
    availableNow,
    activeContracts,
    estimatedStartDays,
    statusLabel,
  };
}

export function mergeOfferedActions(actions: OfferedActionSummary[]): OfferedActionSummary[] {
  const byCode = new Map<string, OfferedActionSummary>();

  for (const action of actions) {
    const existing = byCode.get(action.actionCode);
    if (!existing || action.confidence > existing.confidence) {
      byCode.set(action.actionCode, action);
    }
  }

  return [...byCode.values()].sort((left, right) => {
    if (right.confidence !== left.confidence) {
      return right.confidence - left.confidence;
    }
    return left.actionCode.localeCompare(right.actionCode);
  });
}

export function countTrustEventsByType(
  entries: Array<{ eventType: TrustEventType | string }>,
  eventType: TrustEventType
): number {
  return entries.filter((entry) => entry.eventType === eventType).length;
}

export function buildProviderProfileMetricsFromHistory(input: {
  completedContracts: number;
  cancelledContracts: number;
  completionRate: number;
  averageRating: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  historyEntries: Array<{ eventType: TrustEventType | string }>;
}): ProviderProfileMetricsInput {
  return {
    completedContracts: input.completedContracts,
    cancelledContracts: input.cancelledContracts,
    completionRate: input.completionRate,
    averageRating: input.averageRating,
    evaluationCount: countTrustEventsByType(
      input.historyEntries,
      TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED
    ),
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
    activeIssues: input.activeIssues,
  };
}

export function buildProviderPublicProfile(input: {
  identity: ProviderIdentitySummary;
  offeredActions: OfferedActionSummary[];
  trust: TrustProfileView;
  metrics: ProviderProfileMetricsInput;
  availability: ProviderProfileAvailabilityInput;
  generatedAt?: Date;
}): ProviderPublicProfile {
  return {
    identity: input.identity,
    offeredActions: mergeOfferedActions(input.offeredActions),
    trust: input.trust,
    completion: buildCompletionSummary(input.metrics),
    dispute: buildDisputeSummary(input.metrics),
    rating: buildRatingSummary(input.metrics),
    availability: buildAvailabilitySummary(input.availability),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toProviderPublicProfileView(profile: ProviderPublicProfile): ProviderPublicProfileView {
  return {
    provider_id: profile.identity.providerId,
    user_id: profile.identity.userId,
    display_name: profile.identity.displayName,
    business_name: profile.identity.businessName,
    bio: profile.identity.bio,
    primary_trade: profile.identity.primaryTrade,
    slug: profile.identity.slug,
    status: profile.identity.status,
    verification_tier: profile.identity.verificationTier,
    offered_actions: profile.offeredActions.map((action) => ({
      action_code: action.actionCode,
      action_name: action.actionName,
      confidence: action.confidence,
    })),
    trust_score: profile.trust.trust_score,
    live_frame: profile.trust.live_frame,
    badge: profile.trust.badge,
    trust_breakdown: profile.trust.breakdown,
    completion_summary: {
      completed_contracts: profile.completion.completedContracts,
      cancelled_contracts: profile.completion.cancelledContracts,
      completion_rate: profile.completion.completionRate,
      summary: profile.completion.summary,
    },
    dispute_summary: {
      issues_raised: profile.dispute.issuesRaised,
      issues_resolved: profile.dispute.issuesResolved,
      active_issues: profile.dispute.activeIssues,
      summary: profile.dispute.summary,
    },
    rating_summary: {
      average_rating: profile.rating.averageRating,
      evaluation_count: profile.rating.evaluationCount,
      summary: profile.rating.summary,
    },
    availability: {
      available_now: profile.availability.availableNow,
      active_contracts: profile.availability.activeContracts,
      estimated_start_days: profile.availability.estimatedStartDays,
      status_label: profile.availability.statusLabel,
    },
    generated_at: profile.generatedAt.toISOString(),
  };
}
