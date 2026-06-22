import type { VerificationTier } from "../../identity/domain/user.js";
import type { TrustEvent, TrustEventType } from "./trust-event.js";
import { TrustEventTypes } from "./trust-event.js";

export const S5_TRUST_SCORE_WEIGHTS = {
  verification: 0.4,
  customerRating: 0.3,
  completionRate: 0.2,
  cleanRecord: 0.1,
} as const;

export type TrustLiveFrameTier =
  | "PLATINUM_ELITE"
  | "EMERALD_PRO"
  | "SAPPHIRE_VERIFIED"
  | "STANDARD"
  | "RESTRICTED";

export type TrustLiveFrameColor =
  | "platinum_gold"
  | "emerald"
  | "sapphire"
  | "gray"
  | "red";

export interface TrustBreakdown {
  verificationScore: number;
  customerRatingScore: number;
  completionRateScore: number;
  cleanRecordScore: number;
  weights: typeof S5_TRUST_SCORE_WEIGHTS;
  totalScore: number;
}

export interface TrustBadge {
  badgeId: string;
  label: string;
  tier: TrustLiveFrameTier;
  description: string;
}

export interface TrustHistoryEntry {
  eventId: string;
  eventType: TrustEventType;
  title: string;
  description: string;
  occurredAt: Date;
  scoreImpact: "positive" | "neutral" | "negative";
}

export interface TrustHistory {
  providerId: string;
  entries: TrustHistoryEntry[];
}

export interface LiveFrame {
  providerId: string;
  trustScore: number;
  tier: TrustLiveFrameTier;
  color: TrustLiveFrameColor;
  label: string;
  generatedAt: Date;
}

export interface TrustProfile {
  providerId: string;
  userId: string;
  displayName: string;
  trustScore: number;
  breakdown: TrustBreakdown;
  liveFrame: LiveFrame;
  badge: TrustBadge;
  history: TrustHistory;
  completedContracts: number;
  averageRating: number;
  generatedAt: Date;
}

export interface S5TrustMetrics {
  verificationTier: VerificationTier;
  averageRating: number;
  completionRate: number;
  cleanRecordRate: number;
  completedContracts: number;
  cancelledContracts: number;
  activeIssues: number;
}

const VERIFICATION_TIER_SCORES: Record<VerificationTier, number> = {
  T0: 20,
  T1: 50,
  T2: 70,
  T3: 85,
  T4: 100,
};

const SUPPORTED_S5_EVENT_TYPES: ReadonlySet<TrustEventType> = new Set([
  TrustEventTypes.CONTRACT_COMPLETED,
  TrustEventTypes.CONTRACT_CANCELLED,
  TrustEventTypes.ISSUE_RAISED,
  TrustEventTypes.ISSUE_RESOLVED,
  TrustEventTypes.ESCROW_RELEASED,
  TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
]);

export function isSupportedS5EventType(eventType: TrustEventType): boolean {
  return SUPPORTED_S5_EVENT_TYPES.has(eventType);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countEvents(events: TrustEvent[], eventType: TrustEventType): number {
  return events.filter((event) => event.eventType === eventType).length;
}

function uniqueContractIds(events: TrustEvent[]): Set<string> {
  const ids = new Set<string>();
  for (const event of events) {
    if (event.contractId) ids.add(event.contractId);
  }
  return ids;
}

function averageEvaluationRating(events: TrustEvent[]): number {
  const ratings = events
    .filter((event) => event.eventType === TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED)
    .map((event) => {
      const rating = event.payload.rating;
      return typeof rating === "number" ? rating : null;
    })
    .filter((rating): rating is number => rating !== null);

  if (ratings.length === 0) return 3;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function countConfirmedIssues(events: TrustEvent[]): number {
  return events.filter(
    (event) =>
      event.eventType === TrustEventTypes.ISSUE_RAISED && event.payload.confirmed !== false
  ).length;
}

export function deriveS5TrustMetrics(
  events: TrustEvent[],
  verificationTier: VerificationTier
): S5TrustMetrics {
  const completedContracts = countEvents(events, TrustEventTypes.CONTRACT_COMPLETED);
  const cancelledContracts = countEvents(events, TrustEventTypes.CONTRACT_CANCELLED);
  const issuesRaised = countConfirmedIssues(events);
  const resolvedIssues = countEvents(events, TrustEventTypes.ISSUE_RESOLVED);
  const activeIssues = Math.max(0, issuesRaised - resolvedIssues);
  const engagements = Math.max(1, completedContracts + cancelledContracts, uniqueContractIds(events).size);

  return {
    verificationTier,
    averageRating: averageEvaluationRating(events),
    completionRate: completedContracts / engagements,
    cleanRecordRate: Math.max(0, 1 - activeIssues / engagements - cancelledContracts * 0.15),
    completedContracts,
    cancelledContracts,
    activeIssues,
  };
}

export function scoreVerificationTier(tier: VerificationTier): number {
  return VERIFICATION_TIER_SCORES[tier];
}

export function scoreCustomerRating(averageRating: number): number {
  const rating = Math.max(0, Math.min(5, averageRating));
  return clampScore((rating / 5) * 100);
}

export function scoreCompletionRate(completionRate: number): number {
  return clampScore(Math.max(0, Math.min(1, completionRate)) * 100);
}

export function scoreCleanRecord(cleanRecordRate: number, activeIssues: number): number {
  const base = clampScore(Math.max(0, Math.min(1, cleanRecordRate)) * 100);
  return clampScore(base - activeIssues * 5);
}

export function buildTrustBreakdown(metrics: S5TrustMetrics): TrustBreakdown {
  const verificationScore = scoreVerificationTier(metrics.verificationTier);
  const customerRatingScore = scoreCustomerRating(metrics.averageRating);
  const completionRateScore = scoreCompletionRate(metrics.completionRate);
  const cleanRecordScore = scoreCleanRecord(metrics.cleanRecordRate, metrics.activeIssues);

  const totalScore = clampScore(
    verificationScore * S5_TRUST_SCORE_WEIGHTS.verification +
      customerRatingScore * S5_TRUST_SCORE_WEIGHTS.customerRating +
      completionRateScore * S5_TRUST_SCORE_WEIGHTS.completionRate +
      cleanRecordScore * S5_TRUST_SCORE_WEIGHTS.cleanRecord
  );

  return {
    verificationScore,
    customerRatingScore,
    completionRateScore,
    cleanRecordScore,
    weights: S5_TRUST_SCORE_WEIGHTS,
    totalScore,
  };
}

export function classifyTrustLiveFrame(trustScore: number): {
  tier: TrustLiveFrameTier;
  color: TrustLiveFrameColor;
  label: string;
} {
  const score = clampScore(trustScore);

  if (score >= 95) {
    return { tier: "PLATINUM_ELITE", color: "platinum_gold", label: "Platinum Elite" };
  }
  if (score >= 85) {
    return { tier: "EMERALD_PRO", color: "emerald", label: "Emerald Pro" };
  }
  if (score >= 70) {
    return { tier: "SAPPHIRE_VERIFIED", color: "sapphire", label: "Sapphire Verified" };
  }
  if (score >= 50) {
    return { tier: "STANDARD", color: "gray", label: "Standard" };
  }
  return { tier: "RESTRICTED", color: "red", label: "Restricted" };
}

export function buildLiveFrame(input: {
  providerId: string;
  trustScore: number;
  generatedAt?: Date;
}): LiveFrame {
  const classification = classifyTrustLiveFrame(input.trustScore);
  return {
    providerId: input.providerId,
    trustScore: clampScore(input.trustScore),
    tier: classification.tier,
    color: classification.color,
    label: classification.label,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

function historyPresentation(event: TrustEvent): Pick<TrustHistoryEntry, "title" | "description" | "scoreImpact"> {
  switch (event.eventType) {
    case TrustEventTypes.CONTRACT_COMPLETED:
      return {
        title: "Contract completed",
        description: "Successfully completed a contract engagement.",
        scoreImpact: "positive",
      };
    case TrustEventTypes.CONTRACT_CANCELLED:
      return {
        title: "Contract cancelled",
        description: "A contract engagement was cancelled before completion.",
        scoreImpact: "negative",
      };
    case TrustEventTypes.ISSUE_RAISED:
      return {
        title: "Issue raised",
        description: "A customer issue was recorded against an engagement.",
        scoreImpact: "negative",
      };
    case TrustEventTypes.ISSUE_RESOLVED:
      return {
        title: "Issue resolved",
        description: "A previously raised issue was resolved.",
        scoreImpact: "positive",
      };
    case TrustEventTypes.ESCROW_RELEASED:
      return {
        title: "Escrow released",
        description: "Escrow funds were released after successful delivery.",
        scoreImpact: "positive",
      };
    case TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED: {
      const rating = event.payload.rating;
      return {
        title: "Customer evaluation submitted",
        description:
          typeof rating === "number"
            ? `Customer submitted a ${rating}-star evaluation.`
            : "Customer submitted an evaluation.",
        scoreImpact: typeof rating === "number" && rating >= 4 ? "positive" : "neutral",
      };
    }
    default:
      return {
        title: event.eventType,
        description: "Trust lifecycle event recorded.",
        scoreImpact: "neutral",
      };
  }
}

export function buildTrustHistory(providerId: string, events: TrustEvent[]): TrustHistory {
  const supported = events
    .filter((event) => isSupportedS5EventType(event.eventType))
    .sort((left, right) => {
      const byOccurred = right.occurredAt.getTime() - left.occurredAt.getTime();
      if (byOccurred !== 0) return byOccurred;
      return right.createdAt.getTime() - left.createdAt.getTime();
    });

  return {
    providerId,
    entries: supported.map((event) => ({
      eventId: event.id,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      ...historyPresentation(event),
    })),
  };
}

export function buildTrustBadge(liveFrame: LiveFrame): TrustBadge {
  return {
    badgeId: `trust-badge-${liveFrame.tier.toLowerCase()}`,
    label: liveFrame.label,
    tier: liveFrame.tier,
    description: `${liveFrame.label} trust standing with score ${liveFrame.trustScore}.`,
  };
}

export function buildTrustProfile(input: {
  providerId: string;
  userId: string;
  displayName: string;
  verificationTier: VerificationTier;
  events: TrustEvent[];
  generatedAt?: Date;
}): TrustProfile {
  const metrics = deriveS5TrustMetrics(input.events, input.verificationTier);
  const breakdown = buildTrustBreakdown(metrics);
  const liveFrame = buildLiveFrame({
    providerId: input.providerId,
    trustScore: breakdown.totalScore,
    generatedAt: input.generatedAt,
  });

  return {
    providerId: input.providerId,
    userId: input.userId,
    displayName: input.displayName,
    trustScore: breakdown.totalScore,
    breakdown,
    liveFrame,
    badge: buildTrustBadge(liveFrame),
    history: buildTrustHistory(input.providerId, input.events),
    completedContracts: metrics.completedContracts,
    averageRating: metrics.averageRating,
    generatedAt: input.generatedAt ?? new Date(),
  };
}
