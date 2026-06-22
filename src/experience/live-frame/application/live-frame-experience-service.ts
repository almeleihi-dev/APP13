import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import {
  buildFrameEvolution,
  buildFrameProgress,
  buildFramePublicView,
  buildLiveFrameExperience,
  toFrameEvolutionView,
  toFrameProgressView,
  toFramePublicViewSnakeCase,
  toLiveFrameExperienceView,
  type FrameEvolutionView,
  type FrameProgressView,
  type LiveFrameExperienceView,
} from "../domain/live-frame-experience.js";
import {
  LiveFrameExperienceRepository,
  liveFrameExperienceRepository,
} from "../infrastructure/live-frame-experience-repository.js";

export class LiveFrameExperienceService {
  private readonly repository: LiveFrameExperienceRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: LiveFrameExperienceRepository
  ) {
    this.repository = repository ?? liveFrameExperienceRepository;
  }

  async getLiveFrame(authContext: AuthContext): Promise<LiveFrameExperienceView> {
    const experience = await this.buildExperience(authContext.userId);
    return toLiveFrameExperienceView(experience);
  }

  async getProgress(authContext: AuthContext): Promise<FrameProgressView> {
    const profile = await this.requireTrustProfile(authContext.userId);
    return toFrameProgressView(
      buildFrameProgress(
        profile.trust_score,
        profile.live_frame.tier as TrustLiveFrameTier
      )
    );
  }

  async getEvolution(authContext: AuthContext): Promise<FrameEvolutionView> {
    await this.requireTrustProfile(authContext.userId);
    const history = await this.requireTrustHistory(authContext.userId);
    return toFrameEvolutionView(buildFrameEvolution(history, 30));
  }

  async getPublic(userId: string): Promise<ReturnType<typeof toFramePublicViewSnakeCase>> {
    const profile = await this.deps.providerProfile.getPublicProfileByUserId(userId);
    if (!profile) {
      throw notFound("Provider profile not found");
    }

    return toFramePublicViewSnakeCase(buildFramePublicView(profile));
  }

  private async buildExperience(userId: string) {
    const [profile, history, platformContext, publicProfile] = await Promise.all([
      this.requireTrustProfile(userId),
      this.requireTrustHistory(userId),
      this.repository.getPlatformTrustContext(this.db.pool),
      this.deps.providerProfile.getPublicProfileByUserId(userId),
    ]);

    return buildLiveFrameExperience({
      profile,
      history,
      platformContext,
      verificationTier: publicProfile?.verification_tier ?? "T1",
    });
  }

  private async requireTrustProfile(userId: string) {
    const profile = await this.deps.trustScore.getProfileByUserId(userId);
    if (!profile) {
      throw notFound("Live frame is available for provider accounts only");
    }
    return profile;
  }

  private async requireTrustHistory(userId: string) {
    const history = await this.deps.trustScore.getHistoryByUserId(userId);
    if (!history) {
      throw notFound("Live frame history not found");
    }
    return history;
  }
}

export function createLiveFrameExperienceService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: LiveFrameExperienceRepository
): LiveFrameExperienceService {
  return new LiveFrameExperienceService(db, deps, repository);
}

export function createLiveFrameExperienceModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: LiveFrameExperienceRepository;
  }
) {
  const liveFrameExperience = createLiveFrameExperienceService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    liveFrameExperience,
  };
}

export type LiveFrameExperienceModule = ReturnType<typeof createLiveFrameExperienceModule>;
