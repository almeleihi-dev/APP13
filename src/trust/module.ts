export { TRUST_MODULE } from "./domain/index.js";
export {
  TrustEventTypes,
  type TrustEvent,
  type TrustEventType,
  type ProviderTrustScore,
  type RecordTrustEventInput,
} from "./domain/trust-event.js";
export {
  TrustService,
  createTrustService,
  deriveTrustMetricsFromEvents,
  countConfirmedIssues,
  observeContractCompleted,
  observeMilestoneAccepted,
  observeIssueRaised,
  observeIssueResolved,
  observeEvaluationSubmitted,
  observeEscrowReleased,
  observeEscrowRefunded,
  type RecordTrustEventResult,
} from "./application/trust-service.js";
export {
  ReputationTimelineService,
  createReputationTimelineService,
  buildReputationTimeline,
} from "./application/reputation-timeline-service.js";
export {
  type ReputationTimeline,
  type ReputationTimelineEntry,
  type ReputationTimelineSeverity,
  resolveTimelinePresentation,
} from "./domain/reputation-timeline.js";
export { TrustRepository, trustRepository } from "./infrastructure/trust-repository.js";

import type { DbPool } from "../shared/db/index.js";
import { createTrustService } from "./application/trust-service.js";
import { createReputationTimelineService } from "./application/reputation-timeline-service.js";

export function createTrustModule(db: DbPool) {
  const trust = createTrustService(db);
  const reputationTimeline = createReputationTimelineService(db);
  return { trust, reputationTimeline };
}

export type TrustModule = ReturnType<typeof createTrustModule>;
