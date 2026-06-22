import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import {
  buildProfessionalSealsProfile,
  buildPublicProfessionalSeals,
  toProfessionalSealsProfileView,
  toPublicProfessionalSealsView,
  toSealPointsSummaryView,
  toVerificationEconomyView,
  type ProfessionalSealsProfileView,
  type PublicProfessionalSealsView,
  type SealCategory,
} from "../domain/professional-seals.js";
import {
  ProfessionalSealsRepository,
  professionalSealsRepository,
} from "../infrastructure/professional-seals-repository.js";

export class ProfessionalSealsService {
  private readonly repository: ProfessionalSealsRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: ProfessionalSealsRepository
  ) {
    this.repository = repository ?? professionalSealsRepository;
  }

  async getProfessionalSealsProfile(
    authContext: AuthContext
  ): Promise<ProfessionalSealsProfileView> {
    const profile = await this.buildProfile(authContext.userId);
    return toProfessionalSealsProfileView(profile);
  }

  async getSealsByCategory(
    authContext: AuthContext
  ): Promise<Record<SealCategory, ProfessionalSealsProfileView["seals_by_category"][SealCategory]>> {
    const profile = await this.buildProfile(authContext.userId);
    const view = toProfessionalSealsProfileView(profile);
    return view.seals_by_category;
  }

  async getSealPoints(authContext: AuthContext) {
    const profile = await this.buildProfile(authContext.userId);
    return toSealPointsSummaryView(profile.sealPoints);
  }

  async getVerificationEconomy(authContext: AuthContext) {
    const profile = await this.buildProfile(authContext.userId);
    return toVerificationEconomyView(profile.economy);
  }

  async getPublicSeals(userId: string): Promise<PublicProfessionalSealsView> {
    const profile = await this.buildProfile(userId);
    return toPublicProfessionalSealsView(buildPublicProfessionalSeals(profile));
  }

  private async buildProfile(userId: string) {
    const [publicProfile, trustProfile] = await Promise.all([
      this.deps.providerProfile.getPublicProfileByUserId(userId),
      this.deps.trustScore.getProfileByUserId(userId),
    ]);

    if (!publicProfile || !trustProfile) {
      throw notFound("Professional seals are available for provider accounts only");
    }

    const snapshot = await this.repository.loadSnapshot(this.db.pool, {
      publicProfile,
      trustProfile,
    });

    return buildProfessionalSealsProfile({ snapshot });
  }
}

export function createProfessionalSealsService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: ProfessionalSealsRepository
): ProfessionalSealsService {
  return new ProfessionalSealsService(db, deps, repository);
}

export function createProfessionalSealsModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: ProfessionalSealsRepository;
  }
) {
  const professionalSeals = createProfessionalSealsService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    professionalSeals,
  };
}

export type ProfessionalSealsModule = ReturnType<typeof createProfessionalSealsModule>;
