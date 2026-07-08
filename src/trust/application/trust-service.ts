import type { DbClient, DbPool } from "../../shared/db/index.js";
import { DomainEvents } from "../../shared/events/index.js";
import { outboxWriter } from "../../platform/outbox/index.js";
import { calculateTrustScore } from "../intelligence/trust-rule-library.js";
import type { TrustBehaviorMetrics } from "../intelligence/types.js";
import type {
  ProviderTrustScore,
  RecordTrustEventInput,
  TrustEvent,
  TrustEventType,
} from "../domain/trust-event.js";
import { TrustEventTypes } from "../domain/trust-event.js";
import { TrustRepository, trustRepository } from "../infrastructure/trust-repository.js";
import type { TrustScoreService } from "./trust-score-service.js";
import { isSupportedS5EventType } from "../domain/trust-profile.js";
import type { EventInboxService } from "../../notifications/application/event-inbox-service.js";
import { observeInboxTrustUpdated } from "../../notifications/application/event-inbox-service.js";

export interface RecordTrustEventResult {
  event: TrustEvent;
  created: boolean;
  score: ProviderTrustScore;
}

function uniqueContractIds(events: TrustEvent[]): Set<string> {
  const ids = new Set<string>();
  for (const event of events) {
    if (event.contractId) ids.add(event.contractId);
  }
  return ids;
}

function countEvents(events: TrustEvent[], eventType: TrustEventType): number {
  return events.filter((event) => event.eventType === eventType).length;
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

export function deriveTrustMetricsFromEvents(events: TrustEvent[]): TrustBehaviorMetrics {
  const contractIds = uniqueContractIds(events);
  const contractCount = Math.max(contractIds.size, 1);
  const completedContracts = countEvents(events, TrustEventTypes.CONTRACT_COMPLETED);
  const issuesRaised = countEvents(events, TrustEventTypes.ISSUE_RAISED);
  const issuesResolved = countEvents(events, TrustEventTypes.ISSUE_RESOLVED);
  const refunds = countEvents(events, TrustEventTypes.ESCROW_REFUNDED);
  const milestonesAccepted = countEvents(events, TrustEventTypes.MILESTONE_ACCEPTED);

  const activeIssuePenalty = Math.max(0, issuesRaised - issuesResolved);
  const issueRate = activeIssuePenalty / contractCount;
  const refundRate = refunds / contractCount;
  const completionRate = completedContracts / contractCount;
  const evidenceQuality =
    milestonesAccepted > 0
      ? Math.min(1, 0.6 + milestonesAccepted * 0.1)
      : completedContracts > 0
        ? 0.7
        : 0.5;

  return {
    completed_contracts: completedContracts,
    completion_rate: completionRate,
    average_rating: averageEvaluationRating(events),
    refund_rate: refundRate,
    issue_rate: issueRate,
    evidence_quality_score: evidenceQuality,
    identity_verification_level: "bronze",
  };
}

export function countConfirmedIssues(events: TrustEvent[]): number {
  return events.filter(
    (event) =>
      event.eventType === TrustEventTypes.ISSUE_RAISED &&
      event.payload.confirmed !== false
  ).length;
}

export class TrustService {
  private trustScore?: TrustScoreService;
  private eventInbox?: EventInboxService;

  constructor(
    private readonly db: DbPool,
    private readonly repository: TrustRepository = trustRepository
  ) {}

  attachTrustScoreService(trustScore: TrustScoreService): void {
    this.trustScore = trustScore;
  }

  attachEventInboxService(eventInbox: EventInboxService): void {
    this.eventInbox = eventInbox;
  }

  async recordEvent(
    client: DbClient,
    input: RecordTrustEventInput
  ): Promise<RecordTrustEventResult> {
    const append = await this.repository.appendEvent(client, input);
    if (!append.created) {
      const score = await this.requireProviderScore(client, input.providerId);
      return { event: append.event, created: false, score };
    }

    const score = await this.recalculateProviderScore(client, input.providerId);
    await outboxWriter.write(client, {
      eventType: DomainEvents.TRUST_SCORE_RECOMPUTED,
      payload: {
        provider_id: input.providerId,
        trust_score: score.score,
        triggering_event_id: append.event.id,
        event_type: input.eventType,
      },
      engineSource: "trust",
      idempotencyKey: `trust-recompute-${append.event.id}`,
    });

    if (this.trustScore && isSupportedS5EventType(input.eventType)) {
      await this.trustScore.persistSnapshotForProvider(client, input.providerId, input.eventType);
    }

    await observeInboxTrustUpdated(this.eventInbox, client, {
      providerId: input.providerId,
      trustEventId: append.event.id,
      trustScore: score.score,
      triggeringEventType: input.eventType,
    });

    return { event: append.event, created: true, score };
  }

  async recordEventTx(input: RecordTrustEventInput): Promise<RecordTrustEventResult> {
    return this.db.withTransaction((tx) => this.recordEvent(tx, input));
  }

  async getProviderScore(providerId: string): Promise<ProviderTrustScore | null> {
    return this.repository.getProviderScore(this.db.pool, providerId);
  }

  async listProviderEvents(providerId: string): Promise<TrustEvent[]> {
    return this.repository.listEventsByProvider(this.db.pool, providerId);
  }

  async recalculateProviderScore(
    client: DbClient,
    providerId: string
  ): Promise<ProviderTrustScore> {
    const events = await this.repository.listEventsByProvider(client, providerId);
    const metrics = deriveTrustMetricsFromEvents(events);
    const { trust_score, component_scores } = calculateTrustScore(metrics);
    const contractCount = Math.max(uniqueContractIds(events).size, events.length > 0 ? 1 : 0);
    const completedContractCount = countEvents(events, TrustEventTypes.CONTRACT_COMPLETED);
    const complaintUpheldCount = countConfirmedIssues(events);

    return this.repository.upsertProviderScore(client, {
      providerId,
      score: trust_score,
      executionScore: component_scores.completion,
      verificationComponent: component_scores.verification,
      executionComponent: component_scores.completion,
      timeComponent: component_scores.evidence,
      complaintsComponent: component_scores.issues,
      evaluationComponent: component_scores.rating,
      contractCount,
      completedContractCount,
      complaintUpheldCount,
      dimensionScores: { ...component_scores },
    });
  }

  private async requireProviderScore(
    client: DbClient,
    providerId: string
  ): Promise<ProviderTrustScore> {
    const existing = await this.repository.getProviderScore(client, providerId);
    if (existing) return existing;
    return this.recalculateProviderScore(client, providerId);
  }
}

export function createTrustService(
  db: DbPool,
  repository: TrustRepository = trustRepository
): TrustService {
  return new TrustService(db, repository);
}

/** Thin lifecycle observers — no business rule changes in source engines */
export async function observeContractCompleted(
  trust: TrustService | undefined,
  tx: DbClient,
  input: { providerId: string | null; contractId: string; idempotencyKey?: string }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.CONTRACT_COMPLETED,
    sourceEntityType: "contract",
    sourceEntityId: input.contractId,
    contractId: input.contractId,
    idempotencyKey: input.idempotencyKey ?? `trust-contract-completed-${input.contractId}`,
  });
}

export async function observeContractCancelled(
  trust: TrustService | undefined,
  tx: DbClient,
  input: { providerId: string | null; contractId: string; idempotencyKey?: string }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.CONTRACT_CANCELLED,
    sourceEntityType: "contract",
    sourceEntityId: input.contractId,
    contractId: input.contractId,
    idempotencyKey: input.idempotencyKey ?? `trust-contract-cancelled-${input.contractId}`,
  });
}

export async function observeMilestoneAccepted(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    milestoneId: string;
    idempotencyKey?: string;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.MILESTONE_ACCEPTED,
    sourceEntityType: "milestone",
    sourceEntityId: input.milestoneId,
    contractId: input.contractId,
    idempotencyKey: input.idempotencyKey ?? `trust-milestone-accepted-${input.milestoneId}`,
  });
}

export async function observeIssueRaised(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    issueId: string;
    confirmed?: boolean;
    idempotencyKey?: string;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.ISSUE_RAISED,
    sourceEntityType: "issue",
    sourceEntityId: input.issueId,
    contractId: input.contractId,
    payload: { confirmed: input.confirmed ?? true },
    idempotencyKey: input.idempotencyKey ?? `trust-issue-raised-${input.issueId}`,
  });
}

export async function observeIssueResolved(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    issueId: string;
    transition: string;
    idempotencyKey?: string;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.ISSUE_RESOLVED,
    sourceEntityType: "issue",
    sourceEntityId: input.issueId,
    contractId: input.contractId,
    payload: { transition: input.transition },
    idempotencyKey:
      input.idempotencyKey ?? `trust-issue-resolved-${input.issueId}-${input.transition}`,
  });
}

export async function observeEvaluationSubmitted(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    evaluationId: string;
    rating: number;
    idempotencyKey: string;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
    sourceEntityType: "evaluation",
    sourceEntityId: input.evaluationId,
    contractId: input.contractId,
    payload: { rating: input.rating },
    idempotencyKey: input.idempotencyKey,
  });
}

export async function observeEscrowReleased(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    escrowId: string;
    idempotencyKey: string;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.ESCROW_RELEASED,
    sourceEntityType: "escrow",
    sourceEntityId: input.escrowId,
    contractId: input.contractId,
    idempotencyKey: `trust-${input.idempotencyKey}`,
  });
}

export async function observeEscrowRefunded(
  trust: TrustService | undefined,
  tx: DbClient,
  input: {
    providerId: string | null;
    contractId: string;
    escrowId: string;
    idempotencyKey: string;
    refundAmountMinor: number;
  }
): Promise<void> {
  if (!trust || !input.providerId) return;
  await trust.recordEvent(tx, {
    providerId: input.providerId,
    eventType: TrustEventTypes.ESCROW_REFUNDED,
    sourceEntityType: "escrow",
    sourceEntityId: input.escrowId,
    contractId: input.contractId,
    payload: { refund_amount_minor: input.refundAmountMinor },
    idempotencyKey: `trust-${input.idempotencyKey}`,
  });
}
