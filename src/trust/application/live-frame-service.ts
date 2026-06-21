import type { DbPool } from "../../shared/db/index.js";
import type { ReputationTimeline } from "../domain/reputation-timeline.js";
import {
  buildLiveFrame,
  type ProviderLiveFrame,
  type ProviderLiveFrameProjection,
} from "../domain/live-frame.js";
import { buildReputationTimeline } from "./reputation-timeline-service.js";
import { TrustRepository, trustRepository } from "../infrastructure/trust-repository.js";

export function buildLiveFrameProjection(input: {
  providerId: string;
  trustScore: number;
  timeline: ReputationTimeline;
  generatedAt?: Date;
}): ProviderLiveFrameProjection {
  const frame = buildLiveFrame({
    providerId: input.providerId,
    trustScore: input.trustScore,
    generatedAt: input.generatedAt,
  });
  const latestEntry = input.timeline.entries.at(-1);

  return {
    ...frame,
    latestTrustScore: input.timeline.currentScore,
    latestScoreChange: latestEntry?.scoreDelta ?? 0,
    currentTier: frame.frameTier,
  };
}

export class LiveFrameService {
  constructor(
    private readonly db: DbPool,
    private readonly repository: TrustRepository = trustRepository
  ) {}

  buildLiveFrame(trustScore: number, providerId = "projection"): ProviderLiveFrame {
    return buildLiveFrame({ providerId, trustScore });
  }

  async getProviderLiveFrame(providerId: string): Promise<ProviderLiveFrameProjection> {
    const events = await this.repository.listEventsByProvider(this.db.pool, providerId);
    const timeline = buildReputationTimeline(providerId, events);
    const scoreRow = await this.repository.getProviderScore(this.db.pool, providerId);
    const trustScore = scoreRow?.score ?? timeline.currentScore;

    return buildLiveFrameProjection({
      providerId,
      trustScore,
      timeline,
      generatedAt: scoreRow?.computedAt,
    });
  }
}

export function createLiveFrameService(
  db: DbPool,
  repository: TrustRepository = trustRepository
): LiveFrameService {
  return new LiveFrameService(db, repository);
}
