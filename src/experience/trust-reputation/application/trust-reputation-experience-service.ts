import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import {
  buildTrustDrivers,
  buildTrustProgress,
  buildTrustPublicCard,
  buildTrustReputationExperience,
  buildTrustTimeline,
  toTrustDriverView,
  toTrustProgressView,
  toTrustPublicCardView,
  toTrustReputationExperienceView,
  toTrustTimelineView,
  type TrustDriverView,
  type TrustProgressView,
  type TrustReputationExperienceView,
  type TrustTimelineView,
} from "../domain/trust-reputation-experience.js";
import {
  TrustReputationRepository,
  trustReputationRepository,
} from "../infrastructure/trust-reputation-repository.js";

export class TrustReputationExperienceService {
  private readonly repository: TrustReputationRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: TrustReputationRepository
  ) {
    this.repository = repository ?? trustReputationRepository;
  }

  async getTrustExperience(authContext: AuthContext): Promise<TrustReputationExperienceView> {
    const experience = await this.buildExperience(authContext.userId);
    return toTrustReputationExperienceView(experience);
  }

  async getDrivers(authContext: AuthContext): Promise<{
    user_id: string;
    positive_drivers: TrustDriverView[];
    negative_drivers: TrustDriverView[];
  }> {
    const profile = await this.requireTrustProfile(authContext.userId);
    const { positiveDrivers, negativeDrivers } = buildTrustDrivers(profile);
    return {
      user_id: authContext.userId,
      positive_drivers: positiveDrivers.map(toTrustDriverView),
      negative_drivers: negativeDrivers.map(toTrustDriverView),
    };
  }

  async getProgress(authContext: AuthContext): Promise<TrustProgressView> {
    const profile = await this.requireTrustProfile(authContext.userId);
    return toTrustProgressView(
      buildTrustProgress(
        profile.trust_score,
        profile.live_frame.tier as TrustLiveFrameTier
      )
    );
  }

  async getTimeline(authContext: AuthContext): Promise<TrustTimelineView> {
    const [profile, history] = await Promise.all([
      this.requireTrustProfile(authContext.userId),
      this.requireTrustHistory(authContext.userId),
    ]);
    const snapshot = await this.repository.loadSnapshot(this.db.pool, authContext.userId, {
      profile,
      history,
      verificationTier: "T1",
    });
    return toTrustTimelineView(
      buildTrustTimeline({
        history: snapshot.history,
        inboxEvents: snapshot.inboxTrustEvents,
      })
    );
  }

  async getPublic(userId: string): Promise<ReturnType<typeof toTrustPublicCardView>> {
    const profile = await this.deps.providerProfile.getPublicProfileByUserId(userId);
    if (!profile) {
      throw notFound("Provider profile not found");
    }

    return toTrustPublicCardView(buildTrustPublicCard(profile));
  }

  private async buildExperience(userId: string) {
    const [profile, history, publicProfile] = await Promise.all([
      this.requireTrustProfile(userId),
      this.requireTrustHistory(userId),
      this.deps.providerProfile.getPublicProfileByUserId(userId),
    ]);

    const snapshot = await this.repository.loadSnapshot(this.db.pool, userId, {
      profile,
      history,
      verificationTier: publicProfile?.verification_tier ?? "T1",
    });

    return buildTrustReputationExperience({ snapshot });
  }

  private async requireTrustProfile(userId: string) {
    const profile = await this.deps.trustScore.getProfileByUserId(userId);
    if (!profile) {
      throw notFound("Trust reputation is available for provider accounts only");
    }
    return profile;
  }

  private async requireTrustHistory(userId: string) {
    const history = await this.deps.trustScore.getHistoryByUserId(userId);
    if (!history) {
      throw notFound("Trust history not found");
    }
    return history;
  }
}

export function createTrustReputationExperienceService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: TrustReputationRepository
): TrustReputationExperienceService {
  return new TrustReputationExperienceService(db, deps, repository);
}

export function createTrustReputationExperienceModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: TrustReputationRepository;
  }
) {
  const trustReputationExperience = createTrustReputationExperienceService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    trustReputationExperience,
  };
}

export type TrustReputationExperienceModule = ReturnType<
  typeof createTrustReputationExperienceModule
>;
