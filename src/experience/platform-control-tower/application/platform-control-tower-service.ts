import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  toContractMetricsView,
  toTrustMetricsView,
  type ContractMetricsView,
} from "../../../analytics/domain/platform-analytics.js";
import {
  buildPlatformControlTower,
  buildPlatformControlTowerSnapshot,
  toFinancialMetricsView,
  toLiveFrameDistributionView,
  toMarketplaceMetricsView,
  toPlatformControlTowerView,
  toPlatformOverviewMetricsView,
  toSystemHealthMetricsView,
  type FinancialMetricsView,
  type LiveFrameDistributionView,
  type MarketplaceMetricsView,
  type PlatformControlTowerView,
  type PlatformOverviewMetricsView,
  type SystemHealthMetricsView,
} from "../domain/platform-control-tower.js";
import {
  PlatformControlTowerRepository,
  platformControlTowerRepository,
} from "../infrastructure/platform-control-tower-repository.js";

export class PlatformControlTowerService {
  private readonly repository: PlatformControlTowerRepository;

  constructor(
    private readonly db: DbPool,
    repository?: PlatformControlTowerRepository
  ) {
    this.repository = repository ?? platformControlTowerRepository;
  }

  async getPlatformControlTower(authContext: AuthContext): Promise<PlatformControlTowerView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toPlatformControlTowerView(tower);
  }

  async getOverviewMetrics(authContext: AuthContext): Promise<PlatformOverviewMetricsView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toPlatformOverviewMetricsView(tower.overview);
  }

  async getContractsMetrics(authContext: AuthContext): Promise<ContractMetricsView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toContractMetricsView(tower.contracts);
  }

  async getFinancialMetrics(authContext: AuthContext): Promise<FinancialMetricsView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toFinancialMetricsView(tower.financial);
  }

  async getTrustMetrics(authContext: AuthContext) {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toTrustMetricsView(tower.trust);
  }

  async getLiveFrameDistribution(authContext: AuthContext): Promise<LiveFrameDistributionView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toLiveFrameDistributionView(tower.liveFrameDistribution);
  }

  async getMarketplaceMetrics(authContext: AuthContext): Promise<MarketplaceMetricsView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toMarketplaceMetricsView(tower.marketplace);
  }

  async getSystemHealthMetrics(authContext: AuthContext): Promise<SystemHealthMetricsView> {
    this.assertAdminAccess(authContext);
    const tower = await this.buildControlTower();
    return toSystemHealthMetricsView(tower.systemHealth);
  }

  private async buildControlTower() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildPlatformControlTowerSnapshot({ raw });
    return buildPlatformControlTower({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createPlatformControlTowerService(
  db: DbPool,
  repository?: PlatformControlTowerRepository
): PlatformControlTowerService {
  return new PlatformControlTowerService(db, repository);
}

export function createPlatformControlTowerModule(
  db: DbPool,
  deps?: { repository?: PlatformControlTowerRepository }
) {
  const platformControlTower = createPlatformControlTowerService(db, deps?.repository);

  return {
    platformControlTower,
  };
}

export type PlatformControlTowerModule = ReturnType<typeof createPlatformControlTowerModule>;
