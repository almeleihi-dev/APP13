import type { PlatformAnalyticsSnapshot } from "../../../analytics/domain/platform-analytics.js";
import {
  buildAnalyticsSummary,
  buildContractMetrics,
  buildDiscoveryMetrics,
  buildEscrowMetrics,
  buildGrowthMetrics,
  buildRevenueMetrics,
  buildTrustMetrics,
  toContractMetricsView,
  toDiscoveryMetricsView,
  toEscrowMetricsView,
  toRevenueMetricsView,
  toRollingCountsView,
  toTrustMetricsView,
  type AnalyticsSummary,
  type ContractMetrics,
  type ContractMetricsView,
  type DiscoveryMetrics,
  type EscrowMetrics,
  type GrowthMetrics,
  type RevenueMetrics,
  type TrustMetrics,
} from "../../../analytics/domain/platform-analytics.js";
import type { PlatformHealthStatus, PlatformOverview } from "../../../operations/domain/admin-console.js";
import type { PlatformTrustContext } from "../../live-frame/domain/live-frame-experience.js";

export interface PlatformControlTowerRawSnapshot {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  platformOverview: PlatformOverview;
  platformTrustContext: PlatformTrustContext;
}

export interface PlatformOverviewMetrics {
  headline: string;
  healthStatus: PlatformHealthStatus;
  activeUsers: number;
  activeProviders: number;
  activeCustomers: number;
  totalRequests: number;
  totalOffers: number;
  totalContracts: number;
  averageTrustScore: number;
  providerUtilizationPercent: number;
  nextRecommendedAction: string;
  summary: string;
}

export interface FinancialMetrics {
  escrow: EscrowMetrics;
  revenue: RevenueMetrics;
  summary: string;
}

export interface LiveFrameTierShare {
  tier: string;
  count: number;
  sharePercent: number;
}

export interface LiveFrameDistribution {
  tierDistribution: LiveFrameTierShare[];
  providersWithScores: number;
  averageTrustScore: number;
  trustEventsLast7Days: number;
  trustEventsLast30Days: number;
  summary: string;
}

export interface MarketplaceMetrics {
  discovery: DiscoveryMetrics;
  requestsCreated: GrowthMetrics["requestsCreated"];
  offersCreated: GrowthMetrics["offersCreated"];
  offerToContractRatePercent: number;
  summary: string;
}

export interface SystemHealthMetrics {
  healthStatus: PlatformHealthStatus;
  openIssues: number;
  frozenEscrows: number;
  failedOperations: number;
  riskIndicatorCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  nextRecommendedAction: string;
  summary: string;
}

export interface PlatformControlTowerSnapshot {
  analytics: AnalyticsSummary;
  platformOverview: PlatformOverview;
  platformTrustContext: PlatformTrustContext;
  overview: PlatformOverviewMetrics;
  contracts: ContractMetrics;
  financial: FinancialMetrics;
  trust: TrustMetrics;
  liveFrameDistribution: LiveFrameDistribution;
  marketplace: MarketplaceMetrics;
  systemHealth: SystemHealthMetrics;
  generatedAt: Date;
}

export interface PlatformControlTower {
  overview: PlatformOverviewMetrics;
  contracts: ContractMetrics;
  financial: FinancialMetrics;
  trust: TrustMetrics;
  liveFrameDistribution: LiveFrameDistribution;
  marketplace: MarketplaceMetrics;
  systemHealth: SystemHealthMetrics;
  generatedAt: Date;
}

export interface PlatformOverviewMetricsView {
  headline: string;
  health_status: PlatformHealthStatus;
  active_users: number;
  active_providers: number;
  active_customers: number;
  total_requests: number;
  total_offers: number;
  total_contracts: number;
  average_trust_score: number;
  provider_utilization_percent: number;
  next_recommended_action: string;
  summary: string;
}

export interface FinancialMetricsView {
  escrow: ReturnType<typeof toEscrowMetricsView>;
  revenue: ReturnType<typeof toRevenueMetricsView>;
  summary: string;
}

export interface LiveFrameTierShareView {
  tier: string;
  count: number;
  share_percent: number;
}

export interface LiveFrameDistributionView {
  tier_distribution: LiveFrameTierShareView[];
  providers_with_scores: number;
  average_trust_score: number;
  trust_events_last_7_days: number;
  trust_events_last_30_days: number;
  summary: string;
}

export interface MarketplaceMetricsView {
  discovery: ReturnType<typeof toDiscoveryMetricsView>;
  requests_created: ReturnType<typeof toRollingCountsView>;
  offers_created: ReturnType<typeof toRollingCountsView>;
  offer_to_contract_rate_percent: number;
  summary: string;
}

export interface SystemHealthMetricsView {
  health_status: PlatformHealthStatus;
  open_issues: number;
  frozen_escrows: number;
  failed_operations: number;
  risk_indicator_count: number;
  high_severity_count: number;
  medium_severity_count: number;
  next_recommended_action: string;
  summary: string;
}

export interface PlatformControlTowerView {
  overview: PlatformOverviewMetricsView;
  contracts: ContractMetricsView;
  financial: FinancialMetricsView;
  trust: ReturnType<typeof toTrustMetricsView>;
  live_frame_distribution: LiveFrameDistributionView;
  marketplace: MarketplaceMetricsView;
  system_health: SystemHealthMetricsView;
  generated_at: string;
}

export function buildPlatformOverviewMetrics(input: {
  analytics: AnalyticsSummary;
  operations: PlatformOverview;
}): PlatformOverviewMetrics {
  return {
    headline: "Platform control tower",
    healthStatus: input.operations.summary.healthStatus,
    activeUsers: input.analytics.platform.activeUsers,
    activeProviders: input.analytics.platform.activeProviders,
    activeCustomers: input.analytics.platform.activeCustomers,
    totalRequests: input.analytics.platform.totalRequests,
    totalOffers: input.analytics.platform.totalOffers,
    totalContracts: input.analytics.platform.totalContracts,
    averageTrustScore: input.analytics.platform.averageTrustScore,
    providerUtilizationPercent: input.analytics.platform.providerUtilizationPercent,
    nextRecommendedAction: input.operations.summary.nextRecommendedAction,
    summary: input.analytics.headline,
  };
}

export function buildFinancialMetrics(analytics: AnalyticsSummary): FinancialMetrics {
  return {
    escrow: analytics.escrow,
    revenue: analytics.revenue,
    summary: `${analytics.escrow.summary} ${analytics.revenue.summary}`,
  };
}

export function buildLiveFrameDistribution(input: {
  platformTrustContext: PlatformTrustContext;
  trustMetrics: TrustMetrics;
}): LiveFrameDistribution {
  const tiers =
    input.platformTrustContext.tierDistribution.length > 0
      ? input.platformTrustContext.tierDistribution
      : input.trustMetrics.trustTierDistribution.map((entry) => ({
          tier: String(entry.tier),
          count: entry.count,
        }));
  const totalProviders = tiers.reduce((total, entry) => total + entry.count, 0) || 1;

  return {
    tierDistribution: tiers.map((entry) => ({
      tier: entry.tier,
      count: entry.count,
      sharePercent: Math.round((entry.count / totalProviders) * 100),
    })),
    providersWithScores: input.platformTrustContext.providersWithScores,
    averageTrustScore: input.platformTrustContext.averageTrustScore,
    trustEventsLast7Days: input.platformTrustContext.trustEventsLast7Days,
    trustEventsLast30Days: input.platformTrustContext.trustEventsLast30Days,
    summary: `Live frame distribution across ${input.platformTrustContext.providersWithScores} scored providers with ${input.platformTrustContext.trustEventsLast7Days} trust events in the last 7 days.`,
  };
}

export function buildMarketplaceMetrics(analytics: AnalyticsSummary): MarketplaceMetrics {
  return {
    discovery: analytics.discovery,
    requestsCreated: analytics.growth.requestsCreated,
    offersCreated: analytics.growth.offersCreated,
    offerToContractRatePercent: analytics.conversion.offerToContractRate.ratePercent,
    summary: `${analytics.discovery.summary} ${analytics.growth.summary}`,
  };
}

export function buildSystemHealthMetrics(operations: PlatformOverview): SystemHealthMetrics {
  return {
    healthStatus: operations.summary.healthStatus,
    openIssues: operations.summary.openIssues,
    frozenEscrows: operations.summary.frozenEscrows,
    failedOperations: operations.summary.failedOperations,
    riskIndicatorCount: operations.summary.riskIndicatorCount,
    highSeverityCount: operations.risks.highSeverityCount,
    mediumSeverityCount: operations.risks.mediumSeverityCount,
    nextRecommendedAction: operations.summary.nextRecommendedAction,
    summary: operations.summary.summary,
  };
}

export function buildPlatformControlTowerSnapshot(input: {
  raw: PlatformControlTowerRawSnapshot;
  generatedAt?: Date;
}): PlatformControlTowerSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const analytics = buildAnalyticsSummary(input.raw.analyticsSnapshot, generatedAt);

  return {
    analytics,
    platformOverview: input.raw.platformOverview,
    platformTrustContext: input.raw.platformTrustContext,
    overview: buildPlatformOverviewMetrics({
      analytics,
      operations: input.raw.platformOverview,
    }),
    contracts: buildContractMetrics(input.raw.analyticsSnapshot),
    financial: buildFinancialMetrics(analytics),
    trust: buildTrustMetrics(input.raw.analyticsSnapshot),
    liveFrameDistribution: buildLiveFrameDistribution({
      platformTrustContext: input.raw.platformTrustContext,
      trustMetrics: analytics.trust,
    }),
    marketplace: buildMarketplaceMetrics(analytics),
    systemHealth: buildSystemHealthMetrics(input.raw.platformOverview),
    generatedAt,
  };
}

export function buildPlatformControlTower(input: {
  snapshot: PlatformControlTowerSnapshot;
}): PlatformControlTower {
  return {
    overview: input.snapshot.overview,
    contracts: input.snapshot.contracts,
    financial: input.snapshot.financial,
    trust: input.snapshot.trust,
    liveFrameDistribution: input.snapshot.liveFrameDistribution,
    marketplace: input.snapshot.marketplace,
    systemHealth: input.snapshot.systemHealth,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toPlatformOverviewMetricsView(
  overview: PlatformOverviewMetrics
): PlatformOverviewMetricsView {
  return {
    headline: overview.headline,
    health_status: overview.healthStatus,
    active_users: overview.activeUsers,
    active_providers: overview.activeProviders,
    active_customers: overview.activeCustomers,
    total_requests: overview.totalRequests,
    total_offers: overview.totalOffers,
    total_contracts: overview.totalContracts,
    average_trust_score: overview.averageTrustScore,
    provider_utilization_percent: overview.providerUtilizationPercent,
    next_recommended_action: overview.nextRecommendedAction,
    summary: overview.summary,
  };
}

export function toFinancialMetricsView(financial: FinancialMetrics): FinancialMetricsView {
  return {
    escrow: toEscrowMetricsView(financial.escrow),
    revenue: toRevenueMetricsView(financial.revenue),
    summary: financial.summary,
  };
}

export function toLiveFrameTierShareView(tier: LiveFrameTierShare): LiveFrameTierShareView {
  return {
    tier: tier.tier,
    count: tier.count,
    share_percent: tier.sharePercent,
  };
}

export function toLiveFrameDistributionView(
  distribution: LiveFrameDistribution
): LiveFrameDistributionView {
  return {
    tier_distribution: distribution.tierDistribution.map(toLiveFrameTierShareView),
    providers_with_scores: distribution.providersWithScores,
    average_trust_score: distribution.averageTrustScore,
    trust_events_last_7_days: distribution.trustEventsLast7Days,
    trust_events_last_30_days: distribution.trustEventsLast30Days,
    summary: distribution.summary,
  };
}

export function toMarketplaceMetricsView(marketplace: MarketplaceMetrics): MarketplaceMetricsView {
  return {
    discovery: toDiscoveryMetricsView(marketplace.discovery),
    requests_created: toRollingCountsView(marketplace.requestsCreated),
    offers_created: toRollingCountsView(marketplace.offersCreated),
    offer_to_contract_rate_percent: marketplace.offerToContractRatePercent,
    summary: marketplace.summary,
  };
}

export function toSystemHealthMetricsView(
  systemHealth: SystemHealthMetrics
): SystemHealthMetricsView {
  return {
    health_status: systemHealth.healthStatus,
    open_issues: systemHealth.openIssues,
    frozen_escrows: systemHealth.frozenEscrows,
    failed_operations: systemHealth.failedOperations,
    risk_indicator_count: systemHealth.riskIndicatorCount,
    high_severity_count: systemHealth.highSeverityCount,
    medium_severity_count: systemHealth.mediumSeverityCount,
    next_recommended_action: systemHealth.nextRecommendedAction,
    summary: systemHealth.summary,
  };
}

export function toPlatformControlTowerView(tower: PlatformControlTower): PlatformControlTowerView {
  return {
    overview: toPlatformOverviewMetricsView(tower.overview),
    contracts: toContractMetricsView(tower.contracts),
    financial: toFinancialMetricsView(tower.financial),
    trust: toTrustMetricsView(tower.trust),
    live_frame_distribution: toLiveFrameDistributionView(tower.liveFrameDistribution),
    marketplace: toMarketplaceMetricsView(tower.marketplace),
    system_health: toSystemHealthMetricsView(tower.systemHealth),
    generated_at: tower.generatedAt.toISOString(),
  };
}

export {
  buildContractMetrics,
  buildDiscoveryMetrics,
  buildEscrowMetrics,
  buildGrowthMetrics,
  buildRevenueMetrics,
  buildTrustMetrics,
};
