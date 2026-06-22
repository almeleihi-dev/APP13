import type { DbClient, DbPool } from "../../shared/db/index.js";
import type { AuthContext } from "../../shared/auth/index.js";
import { notFound } from "../../shared/errors/index.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import { contractRepository } from "../../contract/infrastructure/contract-repository.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import {
  buildInboxSummary,
  buildPartyInboxEventInput,
  buildSelfInboxEventInput,
  buildUnreadSummary,
  InboxEventTypes,
  toInboxEventView,
  toInboxSummaryView,
  toUnreadSummaryView,
  type InboxEvent,
  type InboxEventView,
  type InboxSummaryView,
  type RecordInboxEventInput,
  type UnreadSummaryView,
} from "../domain/event-inbox.js";
import {
  EventInboxRepository,
  eventInboxRepository,
} from "../infrastructure/event-inbox-repository.js";

export interface RecordInboxEventResult {
  event: InboxEvent;
  created: boolean;
}

export class EventInboxService {
  private readonly repository: EventInboxRepository;
  private readonly contracts: ContractRepository;
  private readonly identityRepo: IdentityRepository;

  constructor(
    private readonly db: DbPool,
    repository?: EventInboxRepository,
    contracts: ContractRepository = contractRepository,
    identityRepo: IdentityRepository = identityRepository
  ) {
    this.repository = repository ?? eventInboxRepository;
    this.contracts = contracts;
    this.identityRepo = identityRepo;
  }

  async recordEvent(
    client: DbClient,
    input: RecordInboxEventInput
  ): Promise<RecordInboxEventResult> {
    return this.repository.recordEvent(client, input);
  }

  async recordForParties(
    client: DbClient,
    input: {
      eventType: RecordInboxEventInput["eventType"];
      sourceEntityType: string;
      sourceEntityId: string;
      customerUserId: string;
      providerUserId: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.recordEvent(
      client,
      buildPartyInboxEventInput({
        userId: input.customerUserId,
        role: "customer",
        eventType: input.eventType,
        sourceEntityType: input.sourceEntityType,
        sourceEntityId: input.sourceEntityId,
        metadata: input.metadata,
      })
    );
    await this.recordEvent(
      client,
      buildPartyInboxEventInput({
        userId: input.providerUserId,
        role: "provider",
        eventType: input.eventType,
        sourceEntityType: input.sourceEntityType,
        sourceEntityId: input.sourceEntityId,
        metadata: input.metadata,
      })
    );
  }

  async listNotifications(
    authContext: AuthContext,
    options?: { limit?: number; unreadOnly?: boolean }
  ): Promise<{ events: InboxEventView[]; summary: InboxSummaryView }> {
    const events = await this.repository.listByUserId(this.db.pool, authContext.userId, {
      limit: options?.limit ?? 50,
      status: options?.unreadOnly ? "unread" : undefined,
    });

    return {
      events: events.map(toInboxEventView),
      summary: toInboxSummaryView(buildInboxSummary(events)),
    };
  }

  async getUnreadSummary(authContext: AuthContext): Promise<UnreadSummaryView> {
    const unread = await this.repository.listByUserId(this.db.pool, authContext.userId, {
      limit: 100,
      status: "unread",
    });
    return toUnreadSummaryView(buildUnreadSummary(unread));
  }

  async getNotification(
    authContext: AuthContext,
    eventId: string
  ): Promise<InboxEventView> {
    const event = await this.repository.findByIdForUser(
      this.db.pool,
      authContext.userId,
      eventId
    );
    if (!event) throw notFound();
    return toInboxEventView(event);
  }

  async markNotificationRead(
    authContext: AuthContext,
    eventId: string
  ): Promise<InboxEventView> {
    return this.db.withTransaction(async (tx) => {
      const updated = await this.repository.markRead(tx, authContext.userId, eventId);
      if (!updated) throw notFound();
      return toInboxEventView(updated);
    });
  }

  async markAllNotificationsRead(authContext: AuthContext): Promise<{ updated_count: number }> {
    const updatedCount = await this.db.withTransaction((tx) =>
      this.repository.markAllRead(tx, authContext.userId)
    );
    return { updated_count: updatedCount };
  }

  async resolveContractPartyUserIds(
    client: DbClient,
    contractId: string
  ): Promise<{ customerUserId: string; providerUserId: string } | null> {
    const parties = await this.contracts.listParties(client, contractId);
    const customer = parties.find((party) => party.partyRole === "customer");
    const provider = parties.find((party) => party.partyRole === "provider");
    if (!customer || !provider) return null;
    return {
      customerUserId: customer.userId,
      providerUserId: provider.userId,
    };
  }

  async resolveProviderUserId(
    client: DbClient,
    providerId: string
  ): Promise<string | null> {
    const provider = await this.identityRepo.findProviderById(client, providerId);
    return provider?.userId ?? null;
  }
}

export function createEventInboxService(
  db: DbPool,
  repository?: EventInboxRepository
): EventInboxService {
  return new EventInboxService(db, repository);
}

/** Thin lifecycle observers — no business rule changes in source engines */
export async function observeInboxOfferCreated(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: {
    offerId: string;
    customerUserId: string;
    providerUserId: string;
  }
): Promise<void> {
  if (!inbox) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.OFFER_CREATED,
    sourceEntityType: "offer",
    sourceEntityId: input.offerId,
    customerUserId: input.customerUserId,
    providerUserId: input.providerUserId,
  });
}

export async function observeInboxContractCreated(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: {
    contractId: string;
    customerUserId: string;
    providerUserId: string;
    offerId?: string;
  }
): Promise<void> {
  if (!inbox) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.CONTRACT_CREATED,
    sourceEntityType: "contract",
    sourceEntityId: input.contractId,
    customerUserId: input.customerUserId,
    providerUserId: input.providerUserId,
    metadata: input.offerId ? { offer_id: input.offerId } : {},
  });
}

export async function observeInboxEscrowFunded(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.ESCROW_FUNDED,
    sourceEntityType: "contract",
    sourceEntityId: input.contractId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
  });
}

export async function observeInboxEscrowReleased(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; escrowId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.ESCROW_RELEASED,
    sourceEntityType: "escrow",
    sourceEntityId: input.escrowId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: { contract_id: input.contractId },
  });
}

export async function observeInboxMilestoneSubmitted(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; milestoneId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.MILESTONE_SUBMITTED,
    sourceEntityType: "milestone",
    sourceEntityId: input.milestoneId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: { contract_id: input.contractId },
  });
}

export async function observeInboxMilestoneAccepted(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; milestoneId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.MILESTONE_ACCEPTED,
    sourceEntityType: "milestone",
    sourceEntityId: input.milestoneId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: { contract_id: input.contractId },
  });
}

export async function observeInboxEvidenceUploaded(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; milestoneId: string; evidenceId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.EVIDENCE_UPLOADED,
    sourceEntityType: "evidence",
    sourceEntityId: input.evidenceId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: {
      contract_id: input.contractId,
      milestone_id: input.milestoneId,
    },
  });
}

export async function observeInboxIssueRaised(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; issueId: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.ISSUE_RAISED,
    sourceEntityType: "issue",
    sourceEntityId: input.issueId,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: { contract_id: input.contractId },
  });
}

export async function observeInboxIssueResolved(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: { contractId: string; issueId: string; transition: string }
): Promise<void> {
  if (!inbox) return;
  const parties = await inbox.resolveContractPartyUserIds(client, input.contractId);
  if (!parties) return;
  await inbox.recordForParties(client, {
    eventType: InboxEventTypes.ISSUE_RESOLVED,
    sourceEntityType: "issue",
    sourceEntityId: `${input.issueId}:${input.transition}`,
    customerUserId: parties.customerUserId,
    providerUserId: parties.providerUserId,
    metadata: {
      contract_id: input.contractId,
      issue_id: input.issueId,
      transition: input.transition,
    },
  });
}

export async function observeInboxTrustUpdated(
  inbox: EventInboxService | undefined,
  client: DbClient,
  input: {
    providerId: string;
    trustEventId: string;
    trustScore?: number;
    triggeringEventType?: string;
  }
): Promise<void> {
  if (!inbox) return;
  const providerUserId = await inbox.resolveProviderUserId(client, input.providerId);
  if (!providerUserId) return;
  await inbox.recordEvent(
    client,
    buildSelfInboxEventInput({
      userId: providerUserId,
      eventType: InboxEventTypes.TRUST_UPDATED,
      sourceEntityType: "trust_event",
      sourceEntityId: input.trustEventId,
      metadata: {
        provider_id: input.providerId,
        trust_score: input.trustScore,
        triggering_event_type: input.triggeringEventType,
      },
    })
  );
}

export function createNotificationsModule(db: DbPool) {
  const eventInbox = createEventInboxService(db);
  return { eventInbox };
}

export type NotificationsModule = ReturnType<typeof createNotificationsModule>;
