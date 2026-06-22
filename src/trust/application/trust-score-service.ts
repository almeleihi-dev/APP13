import type { DbClient, DbPool } from "../../shared/db/index.js";
import { notFound } from "../../shared/errors/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { VerificationTier } from "../../identity/domain/user.js";
import type { RecordTrustEventInput, TrustEvent, TrustEventType } from "../domain/trust-event.js";
import type { TrustProfile, LiveFrame, TrustHistory } from "../domain/trust-profile.js";
import { buildTrustHistory, buildTrustProfile, isSupportedS5EventType } from "../domain/trust-profile.js";
import {
  toLiveFrameViewFromFrame,
  toTrustHistoryView,
  toTrustProfileView,
  type LiveFrameView,
  type TrustHistoryView,
  type TrustProfileView,
} from "../domain/trust-profile-view.js";
import { TrustRepository, trustRepository } from "../infrastructure/trust-repository.js";

export interface RecordTrustScoreEventResult {
  event: TrustEvent;
  created: boolean;
  profile: TrustProfile;
}

export class TrustScoreService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly repository: TrustRepository = trustRepository
  ) {}

  async getProfileByUserId(userId: string): Promise<TrustProfileView | null> {
    const profile = await this.loadProfileForUser(userId);
    return profile ? toTrustProfileView(profile) : null;
  }

  async getFrameByUserId(userId: string): Promise<LiveFrameView | null> {
    const profile = await this.loadProfileForUser(userId);
    return profile ? toLiveFrameViewFromFrame(profile.userId, profile.liveFrame) : null;
  }

  async getHistoryByUserId(userId: string): Promise<TrustHistoryView | null> {
    const profile = await this.loadProfileForUser(userId);
    return profile ? toTrustHistoryView(profile.history) : null;
  }

  async buildTrustProfile(providerId: string, userId: string): Promise<TrustProfile | null> {
    const provider = await this.identityRepo.findProviderById(this.db.pool, providerId);
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!provider || !user || provider.userId !== userId) return null;

    const events = await this.repository.listEventsByProvider(this.db.pool, providerId);
    return buildTrustProfile({
      providerId,
      userId,
      displayName: provider.displayName,
      verificationTier: user.verificationTier,
      events,
    });
  }

  async buildLiveFrame(providerId: string, userId: string): Promise<LiveFrame | null> {
    const profile = await this.buildTrustProfile(providerId, userId);
    return profile?.liveFrame ?? null;
  }

  async buildTrustHistory(providerId: string): Promise<TrustHistory> {
    const events = await this.repository.listEventsByProvider(this.db.pool, providerId);
    return buildTrustHistory(providerId, events);
  }

  async recordEventTx(input: RecordTrustEventInput): Promise<RecordTrustScoreEventResult> {
    return this.db.withTransaction(async (tx) => this.recordEvent(tx, input));
  }

  async recordEvent(
    client: DbClient,
    input: RecordTrustEventInput
  ): Promise<RecordTrustScoreEventResult> {
    const append = await this.repository.appendEvent(client, input);
    const profile = await this.persistSnapshotForProvider(
      client,
      input.providerId,
      input.eventType
    );
    if (!profile) {
      throw notFound();
    }

    return {
      event: append.event,
      created: append.created,
      profile,
    };
  }

  async persistSnapshotForProvider(
    client: DbClient,
    providerId: string,
    lastEventType?: TrustEventType
  ): Promise<TrustProfile | null> {
    const provider = await this.identityRepo.findProviderById(client, providerId);
    if (!provider) return null;
    const user = await this.identityRepo.findUserById(client, provider.userId);
    const events = await this.repository.listEventsByProvider(client, providerId);
    const profile = buildTrustProfile({
      providerId,
      userId: provider.userId,
      displayName: provider.displayName,
      verificationTier: (user?.verificationTier ?? "T0") as VerificationTier,
      events,
    });

    await this.repository.saveS5ProfileSnapshot(client, {
      providerId,
      snapshot: {
        trust_score: profile.trustScore,
        breakdown: profile.breakdown,
        live_frame: profile.liveFrame,
        updated_at: profile.generatedAt.toISOString(),
        last_event_type: lastEventType ?? null,
      },
    });

    return profile;
  }

  private async loadProfileForUser(userId: string): Promise<TrustProfile | null> {
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    if (!provider) return null;
    return this.buildTrustProfile(provider.id, userId);
  }
}

export function createTrustScoreService(
  db: DbPool,
  identityRepo: IdentityRepository,
  repository: TrustRepository = trustRepository
): TrustScoreService {
  return new TrustScoreService(db, identityRepo, repository);
}

export { isSupportedS5EventType };
