import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../../../provider-experience/application/provider-profile-service.js";
import {
  buildProviderCommandCenter,
  toContractsSummaryView,
  toOpportunitiesIntegrationView,
  toProviderCommandCenterView,
  toRevenueSummaryView,
  toTrustIntegrationView,
  type ContractsSummaryView,
  type OpportunitiesIntegrationView,
  type ProviderCommandCenterView,
  type RevenueSummaryView,
  type TrustIntegrationView,
} from "../domain/provider-command-center.js";
import {
  ProviderCommandCenterRepository,
  providerCommandCenterRepository,
} from "../infrastructure/provider-command-center-repository.js";

export class ProviderCommandCenterService {
  private readonly repository: ProviderCommandCenterRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
      providerProfile: ProviderProfileService;
    },
    repository?: ProviderCommandCenterRepository
  ) {
    this.repository = repository ?? providerCommandCenterRepository;
  }

  async getProviderCommandCenter(authContext: AuthContext): Promise<ProviderCommandCenterView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toProviderCommandCenterView(center);
  }

  async getRevenueSummary(authContext: AuthContext): Promise<RevenueSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toRevenueSummaryView(center.revenue);
  }

  async getContractsSummary(authContext: AuthContext): Promise<ContractsSummaryView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toContractsSummaryView(center.contracts);
  }

  async getTrustIntegration(authContext: AuthContext): Promise<TrustIntegrationView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toTrustIntegrationView(center.trust);
  }

  async getOpportunitiesIntegration(
    authContext: AuthContext
  ): Promise<OpportunitiesIntegrationView> {
    const center = await this.buildCommandCenter(authContext.userId);
    return toOpportunitiesIntegrationView(center.opportunities);
  }

  private async buildCommandCenter(userId: string) {
    const [publicProfile, trustProfile] = await Promise.all([
      this.deps.providerProfile.getPublicProfileByUserId(userId),
      this.deps.trustScore.getProfileByUserId(userId),
    ]);

    if (!publicProfile || !trustProfile) {
      throw notFound("Provider command center is available for provider accounts only");
    }

    const snapshot = await this.repository.loadSnapshot(this.db.pool, {
      providerUserId: userId,
      publicProfile,
      trustProfile,
    });

    if (!snapshot) {
      throw notFound("Provider command center is available for provider accounts only");
    }

    return buildProviderCommandCenter({ snapshot });
  }
}

export function createProviderCommandCenterService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
  },
  repository?: ProviderCommandCenterRepository
): ProviderCommandCenterService {
  return new ProviderCommandCenterService(db, deps, repository);
}

export function createProviderCommandCenterModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    providerProfile: ProviderProfileService;
    repository?: ProviderCommandCenterRepository;
  }
) {
  const providerCommandCenter = createProviderCommandCenterService(
    db,
    {
      trustScore: deps.trustScore,
      providerProfile: deps.providerProfile,
    },
    deps.repository
  );

  return {
    providerCommandCenter,
  };
}

export type ProviderCommandCenterModule = ReturnType<typeof createProviderCommandCenterModule>;
