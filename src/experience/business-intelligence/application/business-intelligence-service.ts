import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildBusinessIntelligenceCenter,
  buildBusinessIntelligenceSnapshot,
  toBusinessIntelligenceCenterView,
  toBusinessIntelligenceScoreView,
  toBusinessOverviewView,
  toContractIntelligenceView,
  toExecutiveInsightsView,
  toGeographicIntelligenceView,
  toGrowthDriversView,
  toMarketplaceIntelligenceSectionView,
  toOperationalIntelligenceView,
  toRevenueIntelligenceView,
  toTrustIntelligenceView,
  toUserIntelligenceView,
  type BusinessIntelligenceCenterView,
  type BusinessIntelligenceScoreView,
  type BusinessOverviewView,
  type ContractIntelligenceView,
  type ExecutiveInsightsView,
  type GeographicIntelligenceView,
  type GrowthDriversView,
  type MarketplaceIntelligenceSectionView,
  type OperationalIntelligenceView,
  type RevenueIntelligenceView,
  type TrustIntelligenceView,
  type UserIntelligenceView,
} from "../domain/business-intelligence.js";
import {
  createBusinessIntelligenceRepository,
  type BusinessIntelligenceRepository,
} from "../infrastructure/business-intelligence-repository.js";
import { createInvestorReadinessRepository } from "../../investor-readiness/infrastructure/investor-readiness-repository.js";
import { createLaunchSimulationRepository } from "../../launch-simulation/infrastructure/launch-simulation-repository.js";
import { createMissionControlRepository } from "../../mission-control/infrastructure/mission-control-repository.js";
import { createPlatformOperationsRepository } from "../../platform-operations/infrastructure/platform-operations-repository.js";
import { createPostLaunchMonitoringRepository } from "../../post-launch-monitoring/infrastructure/post-launch-monitoring-repository.js";
import { marketplaceIntelligenceRepository } from "../../marketplace-intelligence/infrastructure/marketplace-intelligence-repository.js";

export class BusinessIntelligenceService {
  private readonly repository: BusinessIntelligenceRepository;

  constructor(
    private readonly db: DbPool,
    repository?: BusinessIntelligenceRepository
  ) {
    this.repository = repository ?? createBusinessIntelligenceRepository();
  }

  async getBusinessIntelligenceCenter(
    authContext: AuthContext
  ): Promise<BusinessIntelligenceCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBusinessIntelligenceCenterView(center);
  }

  async getBusinessOverview(authContext: AuthContext): Promise<BusinessOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBusinessOverviewView(center.overview);
  }

  async getMarketplaceIntelligence(
    authContext: AuthContext
  ): Promise<MarketplaceIntelligenceSectionView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMarketplaceIntelligenceSectionView(center.marketplace);
  }

  async getRevenueIntelligence(authContext: AuthContext): Promise<RevenueIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRevenueIntelligenceView(center.revenue);
  }

  async getUserIntelligence(authContext: AuthContext): Promise<UserIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUserIntelligenceView(center.users);
  }

  async getContractIntelligence(authContext: AuthContext): Promise<ContractIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toContractIntelligenceView(center.contracts);
  }

  async getTrustIntelligence(authContext: AuthContext): Promise<TrustIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTrustIntelligenceView(center.trust);
  }

  async getGeographicIntelligence(authContext: AuthContext): Promise<GeographicIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGeographicIntelligenceView(center.geography);
  }

  async getOperationalIntelligence(
    authContext: AuthContext
  ): Promise<OperationalIntelligenceView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationalIntelligenceView(center.operations);
  }

  async getGrowthDrivers(authContext: AuthContext): Promise<GrowthDriversView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGrowthDriversView(center.growthDrivers);
  }

  async getExecutiveInsights(authContext: AuthContext): Promise<ExecutiveInsightsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveInsightsView(center.insights);
  }

  async getBusinessIntelligenceScore(
    authContext: AuthContext
  ): Promise<BusinessIntelligenceScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBusinessIntelligenceScoreView(center.businessScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildBusinessIntelligenceSnapshot({ raw });
    return buildBusinessIntelligenceCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createBusinessIntelligenceService(
  db: DbPool,
  repository?: BusinessIntelligenceRepository
): BusinessIntelligenceService {
  return new BusinessIntelligenceService(db, repository);
}

export function createBusinessIntelligenceModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: BusinessIntelligenceRepository;
  }
) {
  const repository =
    deps?.repository ??
    createBusinessIntelligenceRepository({
      launchSimulationRepository: createLaunchSimulationRepository({ rootDir: deps?.rootDir }),
      investorRepository: createInvestorReadinessRepository({ rootDir: deps?.rootDir }),
      missionControlRepository: createMissionControlRepository({ rootDir: deps?.rootDir }),
      postLaunchMonitoringRepository: createPostLaunchMonitoringRepository({
        launchSimulationRepository: createLaunchSimulationRepository({ rootDir: deps?.rootDir }),
        missionControlRepository: createMissionControlRepository({ rootDir: deps?.rootDir }),
      }),
      operationsRepository: createPlatformOperationsRepository(),
      marketplaceRepository: marketplaceIntelligenceRepository,
    });
  const businessIntelligence = createBusinessIntelligenceService(db, repository);

  return {
    businessIntelligence,
  };
}

export type BusinessIntelligenceModule = ReturnType<typeof createBusinessIntelligenceModule>;
