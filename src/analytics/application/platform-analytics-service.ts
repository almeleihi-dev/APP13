import type { DbPool } from "../../shared/db/index.js";
import type { AuthContext } from "../../shared/auth/index.js";
import { requireRole } from "../../security/guards.js";
import {
  buildAnalyticsSummary,
  buildContractMetrics,
  buildConversionMetrics,
  buildDiscoveryMetrics,
  buildEscrowMetrics,
  buildGrowthMetrics,
  buildRevenueMetrics,
  buildTrustMetrics,
  toAnalyticsSummaryView,
  toContractMetricsView,
  toConversionMetricsView,
  toDiscoveryMetricsView,
  toEscrowMetricsView,
  toGrowthMetricsView,
  toRevenueMetricsView,
  toTrustMetricsView,
  type AnalyticsSummaryView,
  type ContractMetricsView,
  type ConversionMetricsView,
  type DiscoveryMetricsView,
  type EscrowMetricsView,
  type GrowthMetricsView,
  type RevenueMetricsView,
  type TrustMetricsView,
} from "../domain/platform-analytics.js";
import {
  PlatformAnalyticsRepository,
  platformAnalyticsRepository,
} from "../infrastructure/platform-analytics-repository.js";

export class PlatformAnalyticsService {
  private readonly repository: PlatformAnalyticsRepository;

  constructor(
    private readonly db: DbPool,
    repository?: PlatformAnalyticsRepository
  ) {
    this.repository = repository ?? platformAnalyticsRepository;
  }

  async getOverview(authContext: AuthContext): Promise<AnalyticsSummaryView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toAnalyticsSummaryView(buildAnalyticsSummary(snapshot));
  }

  async getGrowth(authContext: AuthContext): Promise<GrowthMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toGrowthMetricsView(buildGrowthMetrics(snapshot));
  }

  async getConversions(authContext: AuthContext): Promise<ConversionMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toConversionMetricsView(buildConversionMetrics(snapshot));
  }

  async getContracts(authContext: AuthContext): Promise<ContractMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toContractMetricsView(buildContractMetrics(snapshot));
  }

  async getEscrow(authContext: AuthContext): Promise<EscrowMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toEscrowMetricsView(buildEscrowMetrics(snapshot));
  }

  async getTrust(authContext: AuthContext): Promise<TrustMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toTrustMetricsView(buildTrustMetrics(snapshot));
  }

  async getDiscovery(authContext: AuthContext): Promise<DiscoveryMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toDiscoveryMetricsView(buildDiscoveryMetrics(snapshot));
  }

  async getRevenue(authContext: AuthContext): Promise<RevenueMetricsView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.repository.loadSnapshot(this.db.pool);
    return toRevenueMetricsView(buildRevenueMetrics(snapshot));
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createPlatformAnalyticsService(
  db: DbPool,
  repository?: PlatformAnalyticsRepository
): PlatformAnalyticsService {
  return new PlatformAnalyticsService(db, repository);
}

export function createAnalyticsModule(
  db: DbPool,
  deps?: { repository?: PlatformAnalyticsRepository }
) {
  const platformAnalytics = createPlatformAnalyticsService(db, deps?.repository);
  return { platformAnalytics };
}

export type AnalyticsModule = ReturnType<typeof createAnalyticsModule>;
