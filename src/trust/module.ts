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
  observeContractCancelled,
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
  LiveFrameService,
  createLiveFrameService,
  buildLiveFrameProjection,
} from "./application/live-frame-service.js";
export {
  type ReputationTimeline,
  type ReputationTimelineEntry,
  type ReputationTimelineSeverity,
  resolveTimelinePresentation,
} from "./domain/reputation-timeline.js";
export {
  type LiveFrameTier,
  type LiveFrameColor,
  type LiveFrameRiskLevel,
  type ProviderLiveFrame,
  type ProviderLiveFrameProjection,
  classifyLiveFrame,
  buildLiveFrame,
} from "./domain/live-frame.js";
export { TrustRepository, trustRepository } from "./infrastructure/trust-repository.js";
export {
  TrustScoreService,
  createTrustScoreService,
  isSupportedS5EventType,
  type RecordTrustScoreEventResult,
} from "./application/trust-score-service.js";
export {
  S5_TRUST_SCORE_WEIGHTS,
  classifyTrustLiveFrame,
  buildTrustProfile,
  buildTrustHistory,
  buildTrustBreakdown,
  deriveS5TrustMetrics,
  scoreVerificationTier,
  scoreCustomerRating,
  buildLiveFrame as buildS5LiveFrame,
  type TrustProfile,
  type LiveFrame as S5LiveFrame,
  type TrustHistory,
  type TrustBadge,
  type TrustBreakdown,
} from "./domain/trust-profile.js";
export {
  toTrustProfileView,
  toLiveFrameView,
  toTrustHistoryView,
  type TrustProfileView,
  type LiveFrameView,
  type TrustHistoryView,
} from "./domain/trust-profile-view.js";

import type { DbPool } from "../shared/db/index.js";
import { identityRepository } from "../identity/infrastructure/identity-repository.js";
import { createTrustService } from "./application/trust-service.js";
import { createTrustScoreService } from "./application/trust-score-service.js";
import { createReputationTimelineService } from "./application/reputation-timeline-service.js";
import { createLiveFrameService } from "./application/live-frame-service.js";

export function createTrustModule(db: DbPool) {
  const trust = createTrustService(db);
  const trustScore = createTrustScoreService(db, identityRepository);
  trust.attachTrustScoreService(trustScore);
  const reputationTimeline = createReputationTimelineService(db);
  const liveFrame = createLiveFrameService(db);
  return { trust, trustScore, reputationTimeline, liveFrame };
}

export type TrustModule = ReturnType<typeof createTrustModule>;
