import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import {
  buildLiveTrustFrameExperience,
  buildPublicLiveTrustFrame,
  toFrameLevelAssessmentView,
  toFrameScoreBreakdownView,
  toFrameSignalView,
  toLiveTrustFrameExperienceView,
  toPublicLiveTrustFrameView,
  type FrameLevelAssessmentView,
  type FrameScoreBreakdownView,
  type FrameSignalView,
  type LiveTrustFrameExperienceView,
  type PublicLiveTrustFrameView,
} from "../domain/live-trust-frame.js";
import {
  LiveTrustFrameRepository,
  liveTrustFrameRepository,
} from "../infrastructure/live-trust-frame-repository.js";

export class LiveTrustFrameService {
  private readonly repository: LiveTrustFrameRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: LiveTrustFrameRepository
  ) {
    this.repository = repository ?? liveTrustFrameRepository;
  }

  async getLiveTrustFrame(authContext: AuthContext): Promise<LiveTrustFrameExperienceView> {
    const experience = await this.buildExperience(authContext.userId);
    return toLiveTrustFrameExperienceView(experience);
  }

  async getFrameScore(authContext: AuthContext): Promise<FrameScoreBreakdownView> {
    const experience = await this.buildExperience(authContext.userId);
    return toFrameScoreBreakdownView(experience.frameScore);
  }

  async getFrameLevel(authContext: AuthContext): Promise<FrameLevelAssessmentView> {
    const experience = await this.buildExperience(authContext.userId);
    return toFrameLevelAssessmentView(experience.frameLevel);
  }

  async getFrameSignals(authContext: AuthContext): Promise<FrameSignalView[]> {
    const experience = await this.buildExperience(authContext.userId);
    return experience.signals.map(toFrameSignalView);
  }

  async getPublicLiveTrustFrame(userId: string): Promise<PublicLiveTrustFrameView> {
    const experience = await this.buildExperience(userId);
    return toPublicLiveTrustFrameView(buildPublicLiveTrustFrame(experience));
  }

  private async buildExperience(userId: string) {
    const [publicProfile, trustProfile] = await Promise.all([
      this.deps.providerProfile.getPublicProfileByUserId(userId),
      this.deps.trustScore.getProfileByUserId(userId),
    ]);

    if (!publicProfile || !trustProfile) {
      throw notFound("Live trust frame is available for provider accounts only");
    }

    const snapshot = await this.repository.loadSnapshot(this.db.pool, {
      publicProfile,
      trustProfile,
    });

    return buildLiveTrustFrameExperience({ snapshot });
  }
}

export function createLiveTrustFrameService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: LiveTrustFrameRepository
): LiveTrustFrameService {
  return new LiveTrustFrameService(db, deps, repository);
}

export function createLiveTrustFrameModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: LiveTrustFrameRepository;
  }
) {
  const liveTrustFrame = createLiveTrustFrameService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    liveTrustFrame,
  };
}

export type LiveTrustFrameModule = ReturnType<typeof createLiveTrustFrameModule>;
