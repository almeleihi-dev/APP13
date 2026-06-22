import type { TrustEvent, TrustEventType } from "./trust-event.js";
import { TrustEventTypes } from "./trust-event.js";

export type ReputationTimelineSeverity = "positive" | "neutral" | "negative" | "recovery";

export interface ReputationTimelineEntry {
  providerId: string;
  eventType: TrustEventType;
  sourceType: string;
  sourceId: string;
  occurredAt: Date;
  scoreDelta: number;
  scoreAfter: number;
  severity: ReputationTimelineSeverity;
  title: string;
  description: string;
}

export interface ReputationTimeline {
  providerId: string;
  entries: ReputationTimelineEntry[];
  currentScore: number;
}

export interface TimelinePresentation {
  severity: ReputationTimelineSeverity;
  title: string;
  description: string;
}

function evaluationRating(event: TrustEvent): number | null {
  const rating = event.payload.rating;
  return typeof rating === "number" ? rating : null;
}

function refundAmountMinor(event: TrustEvent): number {
  const amount = event.payload.refund_amount_minor;
  return typeof amount === "number" ? amount : 0;
}

function issueWasConfirmed(event: TrustEvent): boolean {
  return event.payload.confirmed !== false;
}

function hadPriorConfirmedIssue(events: TrustEvent[]): boolean {
  return events.some(
    (entry) =>
      entry.eventType === TrustEventTypes.ISSUE_RAISED && issueWasConfirmed(entry)
  );
}

export function resolveTimelinePresentation(
  event: TrustEvent,
  priorEvents: TrustEvent[] = []
): TimelinePresentation {
  switch (event.eventType) {
    case TrustEventTypes.CONTRACT_COMPLETED:
      return {
        severity: "positive",
        title: "Contract completed",
        description: "Successfully completed a contract engagement.",
      };
    case TrustEventTypes.MILESTONE_ACCEPTED:
      return {
        severity: "positive",
        title: "Milestone accepted",
        description: "Customer accepted a delivery milestone.",
      };
    case TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED: {
      const rating = evaluationRating(event);
      if (rating !== null && rating >= 4) {
        return {
          severity: "positive",
          title: "Strong customer evaluation",
          description: `Customer submitted a ${rating}-star evaluation.`,
        };
      }
      if (rating !== null && rating <= 2) {
        return {
          severity: "negative",
          title: "Low customer evaluation",
          description: `Customer submitted a ${rating}-star evaluation.`,
        };
      }
      return {
        severity: "neutral",
        title: "Customer evaluation received",
        description:
          rating !== null
            ? `Customer submitted a ${rating}-star evaluation.`
            : "Customer submitted a contract evaluation.",
      };
    }
    case TrustEventTypes.ISSUE_RAISED:
      return {
        severity: "negative",
        title: "Issue raised",
        description: issueWasConfirmed(event)
          ? "A confirmed customer issue was raised on an active contract."
          : "A customer issue was raised on an active contract.",
      };
    case TrustEventTypes.ISSUE_RESOLVED: {
      const transition =
        typeof event.payload.transition === "string" ? event.payload.transition : "resolved";
      return {
        severity: "recovery",
        title: "Issue resolved",
        description:
          transition === "withdraw"
            ? "Customer withdrew the raised issue."
            : "A previously raised issue was resolved.",
      };
    }
    case TrustEventTypes.ESCROW_RELEASED:
      return {
        severity: "positive",
        title: "Escrow released",
        description: "Escrow funds were released after acceptance, supporting financial reliability.",
      };
    case TrustEventTypes.ESCROW_REFUNDED: {
      const amount = refundAmountMinor(event);
      const contextualNegative = hadPriorConfirmedIssue(priorEvents) || amount >= 100_000;
      return {
        severity: contextualNegative ? "negative" : "neutral",
        title: "Escrow refunded",
        description: contextualNegative
          ? "Escrow funds were refunded following a dispute or significant refund event."
          : "Escrow funds were refunded to the customer.",
      };
    }
    case TrustEventTypes.CONTRACT_CANCELLED:
      return {
        severity: "negative",
        title: "Contract cancelled",
        description: "A contract engagement was cancelled before completion.",
      };
    default:
      return {
        severity: "neutral",
        title: event.eventType,
        description: "Trust lifecycle event recorded.",
      };
  }
}
