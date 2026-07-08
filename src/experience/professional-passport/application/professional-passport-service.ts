import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import {
  buildProfessionalPassport,
  buildPublicProfessionalPassport,
  toPassportLevelAssessmentView,
  toPerformanceMetricsView,
  toProfessionalPassportView,
  toPublicProfessionalPassportView,
  type PassportLevelAssessmentView,
  type PerformanceMetricsView,
  type ProfessionalPassportView,
  type PublicProfessionalPassportView,
} from "../domain/professional-passport.js";
import {
  ProfessionalPassportRepository,
  professionalPassportRepository,
} from "../infrastructure/professional-passport-repository.js";

export class ProfessionalPassportService {
  private readonly repository: ProfessionalPassportRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: ProfessionalPassportRepository
  ) {
    this.repository = repository ?? professionalPassportRepository;
  }

  async getProfessionalPassport(authContext: AuthContext): Promise<ProfessionalPassportView> {
    const passport = await this.buildPassport(authContext.userId);
    return toProfessionalPassportView(passport);
  }

  async getPassportLevel(authContext: AuthContext): Promise<PassportLevelAssessmentView> {
    const passport = await this.buildPassport(authContext.userId);
    return toPassportLevelAssessmentView(passport.passportLevel);
  }

  async getPerformance(authContext: AuthContext): Promise<PerformanceMetricsView> {
    const passport = await this.buildPassport(authContext.userId);
    return toPerformanceMetricsView(passport.performance);
  }

  async getCredentials(authContext: AuthContext): Promise<{
    user_id: string;
    licenses: ProfessionalPassportView["licenses"];
    certifications: ProfessionalPassportView["certifications"];
  }> {
    const passport = await this.buildPassport(authContext.userId);
    const view = toProfessionalPassportView(passport);
    return {
      user_id: view.user_id,
      licenses: view.licenses,
      certifications: view.certifications,
    };
  }

  async getPublicPassport(userId: string): Promise<PublicProfessionalPassportView> {
    const passport = await this.buildPassport(userId);
    return toPublicProfessionalPassportView(buildPublicProfessionalPassport(passport));
  }

  private async buildPassport(userId: string) {
    const [publicProfile, trustProfile, trustHistory] = await Promise.all([
      this.deps.providerProfile.getPublicProfileByUserId(userId),
      this.deps.trustScore.getProfileByUserId(userId),
      this.deps.trustScore.getHistoryByUserId(userId),
    ]);

    if (!publicProfile || !trustProfile || !trustHistory) {
      throw notFound("Professional passport is available for provider accounts only");
    }

    const snapshot = await this.repository.loadSnapshot(this.db.pool, {
      publicProfile,
      trustProfile,
      trustHistory,
    });

    return buildProfessionalPassport({ snapshot });
  }
}

export function createProfessionalPassportService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: ProfessionalPassportRepository
): ProfessionalPassportService {
  return new ProfessionalPassportService(db, deps, repository);
}

export function createProfessionalPassportModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: ProfessionalPassportRepository;
  }
) {
  const professionalPassport = createProfessionalPassportService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    professionalPassport,
  };
}

export type ProfessionalPassportModule = ReturnType<typeof createProfessionalPassportModule>;
