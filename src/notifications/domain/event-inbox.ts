export const InboxEventTypes = {
  OFFER_CREATED: "offer_created",
  CONTRACT_CREATED: "contract_created",
  ESCROW_FUNDED: "escrow_funded",
  ESCROW_RELEASED: "escrow_released",
  MILESTONE_SUBMITTED: "milestone_submitted",
  MILESTONE_ACCEPTED: "milestone_accepted",
  EVIDENCE_UPLOADED: "evidence_uploaded",
  ISSUE_RAISED: "issue_raised",
  ISSUE_RESOLVED: "issue_resolved",
  TRUST_UPDATED: "trust_updated",
} as const;

export type InboxEventType = (typeof InboxEventTypes)[keyof typeof InboxEventTypes];

export const InboxEventCategories = {
  REQUEST: "request",
  OFFER: "offer",
  CONTRACT: "contract",
  ESCROW: "escrow",
  EXECUTION: "execution",
  EVIDENCE: "evidence",
  ISSUE: "issue",
  TRUST: "trust",
  PAYMENT: "payment",
  PLATFORM: "platform",
} as const;

export type InboxEventCategory =
  (typeof InboxEventCategories)[keyof typeof InboxEventCategories];

export const InboxEventPriorities = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type InboxEventPriority =
  (typeof InboxEventPriorities)[keyof typeof InboxEventPriorities];

export const InboxEventStatuses = {
  UNREAD: "unread",
  READ: "read",
} as const;

export type InboxEventStatus = (typeof InboxEventStatuses)[keyof typeof InboxEventStatuses];

export interface InboxEvent {
  id: string;
  userId: string;
  eventType: InboxEventType;
  category: InboxEventCategory;
  priority: InboxEventPriority;
  status: InboxEventStatus;
  title: string;
  body: string;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface InboxEventView {
  id: string;
  user_id: string;
  event_type: InboxEventType;
  category: InboxEventCategory;
  priority: InboxEventPriority;
  status: InboxEventStatus;
  title: string;
  body: string;
  source_entity_type: string | null;
  source_entity_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface InboxSummary {
  totalCount: number;
  unreadCount: number;
  byCategory: Partial<Record<InboxEventCategory, number>>;
  byPriority: Partial<Record<InboxEventPriority, number>>;
}

export interface InboxSummaryView {
  total_count: number;
  unread_count: number;
  by_category: Partial<Record<InboxEventCategory, number>>;
  by_priority: Partial<Record<InboxEventPriority, number>>;
}

export interface UnreadSummary {
  unreadCount: number;
  criticalCount: number;
  highPriorityCount: number;
  recentUnread: InboxEvent[];
}

export interface UnreadSummaryView {
  unread_count: number;
  critical_count: number;
  high_priority_count: number;
  recent_unread: InboxEventView[];
}

export interface RecordInboxEventInput {
  userId: string;
  eventType: InboxEventType;
  category: InboxEventCategory;
  priority: InboxEventPriority;
  title: string;
  body: string;
  sourceEntityType?: string | null;
  sourceEntityId?: string | null;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

interface InboxEventTemplate {
  category: InboxEventCategory;
  priority: InboxEventPriority;
  titleForRole: (role: "customer" | "provider" | "self") => string;
  bodyForRole: (role: "customer" | "provider" | "self", entityId: string) => string;
}

const INBOX_EVENT_TEMPLATES: Record<InboxEventType, InboxEventTemplate> = {
  [InboxEventTypes.OFFER_CREATED]: {
    category: InboxEventCategories.OFFER,
    priority: InboxEventPriorities.NORMAL,
    titleForRole: (role) =>
      role === "customer" ? "Contract offer created" : "New contract offer sent",
    bodyForRole: (role, entityId) =>
      role === "customer"
        ? `Your contract offer ${entityId} is ready for review.`
        : `A customer sent you contract offer ${entityId}.`,
  },
  [InboxEventTypes.CONTRACT_CREATED]: {
    category: InboxEventCategories.CONTRACT,
    priority: InboxEventPriorities.HIGH,
    titleForRole: () => "Contract created",
    bodyForRole: (_role, entityId) =>
      `Contract ${entityId} was created from your accepted offer.`,
  },
  [InboxEventTypes.ESCROW_FUNDED]: {
    category: InboxEventCategories.ESCROW,
    priority: InboxEventPriorities.HIGH,
    titleForRole: (role) =>
      role === "customer" ? "Escrow funded" : "Escrow funded for contract",
    bodyForRole: (role, entityId) =>
      role === "customer"
        ? `Escrow for contract ${entityId} has been funded.`
        : `Customer funded escrow for contract ${entityId}.`,
  },
  [InboxEventTypes.ESCROW_RELEASED]: {
    category: InboxEventCategories.ESCROW,
    priority: InboxEventPriorities.HIGH,
    titleForRole: (role) =>
      role === "provider" ? "Escrow released" : "Escrow released to provider",
    bodyForRole: (role, entityId) =>
      role === "provider"
        ? `Escrow for contract ${entityId} was released to you.`
        : `Escrow for contract ${entityId} was released to the provider.`,
  },
  [InboxEventTypes.MILESTONE_SUBMITTED]: {
    category: InboxEventCategories.EXECUTION,
    priority: InboxEventPriorities.NORMAL,
    titleForRole: (role) =>
      role === "provider" ? "Milestone submitted" : "Milestone ready for review",
    bodyForRole: (role, entityId) =>
      role === "provider"
        ? `You submitted milestone ${entityId} for customer review.`
        : `Provider submitted milestone ${entityId} for your review.`,
  },
  [InboxEventTypes.MILESTONE_ACCEPTED]: {
    category: InboxEventCategories.EXECUTION,
    priority: InboxEventPriorities.NORMAL,
    titleForRole: (role) =>
      role === "customer" ? "Milestone accepted" : "Milestone accepted by customer",
    bodyForRole: (role, entityId) =>
      role === "customer"
        ? `You accepted milestone ${entityId}.`
        : `Customer accepted milestone ${entityId}.`,
  },
  [InboxEventTypes.EVIDENCE_UPLOADED]: {
    category: InboxEventCategories.EVIDENCE,
    priority: InboxEventPriorities.NORMAL,
    titleForRole: () => "Evidence uploaded",
    bodyForRole: (_role, entityId) => `New evidence ${entityId} was uploaded.`,
  },
  [InboxEventTypes.ISSUE_RAISED]: {
    category: InboxEventCategories.ISSUE,
    priority: InboxEventPriorities.CRITICAL,
    titleForRole: () => "Issue raised on contract",
    bodyForRole: (_role, entityId) => `Issue ${entityId} was raised on your contract.`,
  },
  [InboxEventTypes.ISSUE_RESOLVED]: {
    category: InboxEventCategories.ISSUE,
    priority: InboxEventPriorities.HIGH,
    titleForRole: () => "Issue resolved",
    bodyForRole: (_role, entityId) => `Issue ${entityId} was resolved.`,
  },
  [InboxEventTypes.TRUST_UPDATED]: {
    category: InboxEventCategories.TRUST,
    priority: InboxEventPriorities.NORMAL,
    titleForRole: () => "Trust score updated",
    bodyForRole: (_role, entityId) => `Your trust profile was updated (event ${entityId}).`,
  },
};

export function inboxIdempotencyKey(
  eventType: InboxEventType,
  userId: string,
  sourceEntityId: string
): string {
  return `inbox:${eventType}:${userId}:${sourceEntityId}`;
}

export function buildPartyInboxEventInput(input: {
  userId: string;
  role: "customer" | "provider";
  eventType: InboxEventType;
  sourceEntityType: string;
  sourceEntityId: string;
  metadata?: Record<string, unknown>;
}): RecordInboxEventInput {
  const template = INBOX_EVENT_TEMPLATES[input.eventType];
  return {
    userId: input.userId,
    eventType: input.eventType,
    category: template.category,
    priority: template.priority,
    title: template.titleForRole(input.role),
    body: template.bodyForRole(input.role, input.sourceEntityId),
    sourceEntityType: input.sourceEntityType,
    sourceEntityId: input.sourceEntityId,
    metadata: input.metadata ?? {},
    idempotencyKey: inboxIdempotencyKey(
      input.eventType,
      input.userId,
      input.sourceEntityId
    ),
  };
}

export function buildSelfInboxEventInput(input: {
  userId: string;
  eventType: InboxEventType;
  sourceEntityType: string;
  sourceEntityId: string;
  metadata?: Record<string, unknown>;
}): RecordInboxEventInput {
  const template = INBOX_EVENT_TEMPLATES[input.eventType];
  return {
    userId: input.userId,
    eventType: input.eventType,
    category: template.category,
    priority: template.priority,
    title: template.titleForRole("self"),
    body: template.bodyForRole("self", input.sourceEntityId),
    sourceEntityType: input.sourceEntityType,
    sourceEntityId: input.sourceEntityId,
    metadata: input.metadata ?? {},
    idempotencyKey: inboxIdempotencyKey(
      input.eventType,
      input.userId,
      input.sourceEntityId
    ),
  };
}

export function buildInboxSummary(events: InboxEvent[]): InboxSummary {
  const byCategory: Partial<Record<InboxEventCategory, number>> = {};
  const byPriority: Partial<Record<InboxEventPriority, number>> = {};
  let unreadCount = 0;

  for (const event of events) {
    if (event.status === InboxEventStatuses.UNREAD) {
      unreadCount += 1;
    }
    byCategory[event.category] = (byCategory[event.category] ?? 0) + 1;
    byPriority[event.priority] = (byPriority[event.priority] ?? 0) + 1;
  }

  return {
    totalCount: events.length,
    unreadCount,
    byCategory,
    byPriority,
  };
}

export function buildUnreadSummary(
  events: InboxEvent[],
  recentLimit = 5
): UnreadSummary {
  const unread = events.filter((event) => event.status === InboxEventStatuses.UNREAD);
  return {
    unreadCount: unread.length,
    criticalCount: unread.filter((event) => event.priority === InboxEventPriorities.CRITICAL)
      .length,
    highPriorityCount: unread.filter((event) => event.priority === InboxEventPriorities.HIGH)
      .length,
    recentUnread: unread.slice(0, recentLimit),
  };
}

export function toInboxEventView(event: InboxEvent): InboxEventView {
  return {
    id: event.id,
    user_id: event.userId,
    event_type: event.eventType,
    category: event.category,
    priority: event.priority,
    status: event.status,
    title: event.title,
    body: event.body,
    source_entity_type: event.sourceEntityType,
    source_entity_id: event.sourceEntityId,
    metadata: event.metadata,
    read_at: event.readAt?.toISOString() ?? null,
    created_at: event.createdAt.toISOString(),
  };
}

export function toInboxSummaryView(summary: InboxSummary): InboxSummaryView {
  return {
    total_count: summary.totalCount,
    unread_count: summary.unreadCount,
    by_category: summary.byCategory,
    by_priority: summary.byPriority,
  };
}

export function toUnreadSummaryView(summary: UnreadSummary): UnreadSummaryView {
  return {
    unread_count: summary.unreadCount,
    critical_count: summary.criticalCount,
    high_priority_count: summary.highPriorityCount,
    recent_unread: summary.recentUnread.map(toInboxEventView),
  };
}
