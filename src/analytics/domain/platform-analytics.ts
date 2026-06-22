import type { TrustLiveFrameTier } from "../../trust/domain/trust-profile.js";

export type TrendDirection = "up" | "down" | "flat";

export interface TrendIndicator {
  direction: TrendDirection;
  summary: string;
}

export interface RollingCounts {
  allTime: number;
  last7Days: number;
  prior7Days: number;
  last30Days: number;
  prior30Days: number;
  trend7Day: TrendIndicator;
  trend30Day: TrendIndicator;
}

export interface RateMetric {
  ratePercent: number;
  numerator: number;
  denominator: number;
  summary: string;
}

export interface PlatformMetrics {
  activeUsers: number;
  activeProviders: number;
  activeCustomers: number;
  providerUtilizationPercent: number;
  totalRequests: number;
  totalOffers: number;
  totalContracts: number;
  averageTrustScore: number;
  platformFeeTotalMinor: number;
  generatedAt: Date;
}

export interface GrowthMetrics {
  requestsCreated: RollingCounts;
  offersCreated: RollingCounts;
  contractsCreated: RollingCounts;
  activeUsers: RollingCounts;
  activeProviders: RollingCounts;
  summary: string;
}

export interface ConversionMetrics {
  offerToContractRate: RateMetric;
  contractToFundedRate: RateMetric;
  searchToMatchRate: RateMetric;
  offersCreated: RollingCounts;
  contractsCreated: RollingCounts;
  summary: string;
}

export interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  completionRate: RateMetric;
  issueDisputeRate: RateMetric;
  contractsCreated: RollingCounts;
  summary: string;
}

export interface EscrowMetrics {
  totalEscrows: number;
  fundedEscrows: number;
  releasedEscrows: number;
  frozenEscrows: number;
  fundedAmountMinor: RollingCounts;
  releasedAmountMinor: RollingCounts;
  summary: string;
}

export interface ExecutionMetrics {
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  totalEvidence: number;
  contractsWithMilestones: number;
  milestoneActivity: RollingCounts;
  summary: string;
}

export interface TrustMetrics {
  providersWithScores: number;
  averageTrustScore: number;
  lowTrustProviderCount: number;
  trustTierDistribution: Array<{ tier: TrustLiveFrameTier | string; count: number }>;
  trustEvents: RollingCounts;
  summary: string;
}

export interface DiscoveryMetrics {
  searchVolume: RollingCounts;
  openRequests: number;
  matchableProviders: number;
  publishedActions: number;
  searchToMatchRate: RateMetric;
  summary: string;
}

export interface RevenueMetrics {
  escrowFundedAmountMinor: RollingCounts;
  escrowReleasedAmountMinor: RollingCounts;
  platformFeeTotalMinor: RollingCounts;
  currencyCode: string;
  summary: string;
}

export interface AnalyticsSummary {
  platform: PlatformMetrics;
  growth: GrowthMetrics;
  conversion: ConversionMetrics;
  contracts: ContractMetrics;
  escrow: EscrowMetrics;
  execution: ExecutionMetrics;
  trust: TrustMetrics;
  discovery: DiscoveryMetrics;
  revenue: RevenueMetrics;
  headline: string;
  generatedAt: Date;
}

export interface RollingCountsView {
  all_time: number;
  last_7_days: number;
  prior_7_days: number;
  last_30_days: number;
  prior_30_days: number;
  trend_7_day: { direction: TrendDirection; summary: string };
  trend_30_day: { direction: TrendDirection; summary: string };
}

export interface RateMetricView {
  rate_percent: number;
  numerator: number;
  denominator: number;
  summary: string;
}

export interface PlatformMetricsView {
  active_users: number;
  active_providers: number;
  active_customers: number;
  provider_utilization_percent: number;
  total_requests: number;
  total_offers: number;
  total_contracts: number;
  average_trust_score: number;
  platform_fee_total_minor: number;
  generated_at: string;
}

export interface GrowthMetricsView {
  requests_created: RollingCountsView;
  offers_created: RollingCountsView;
  contracts_created: RollingCountsView;
  active_users: RollingCountsView;
  active_providers: RollingCountsView;
  summary: string;
}

export interface ConversionMetricsView {
  offer_to_contract_rate: RateMetricView;
  contract_to_funded_rate: RateMetricView;
  search_to_match_rate: RateMetricView;
  offers_created: RollingCountsView;
  contracts_created: RollingCountsView;
  summary: string;
}

export interface ContractMetricsView {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  completion_rate: RateMetricView;
  issue_dispute_rate: RateMetricView;
  contracts_created: RollingCountsView;
  summary: string;
}

export interface EscrowMetricsView {
  total_escrows: number;
  funded_escrows: number;
  released_escrows: number;
  frozen_escrows: number;
  funded_amount_minor: RollingCountsView;
  released_amount_minor: RollingCountsView;
  summary: string;
}

export interface ExecutionMetricsView {
  total_milestones: number;
  completed_milestones: number;
  in_progress_milestones: number;
  total_evidence: number;
  contracts_with_milestones: number;
  milestone_activity: RollingCountsView;
  summary: string;
}

export interface TrustMetricsView {
  providers_with_scores: number;
  average_trust_score: number;
  low_trust_provider_count: number;
  trust_tier_distribution: Array<{ tier: string; count: number }>;
  trust_events: RollingCountsView;
  summary: string;
}

export interface DiscoveryMetricsView {
  search_volume: RollingCountsView;
  open_requests: number;
  matchable_providers: number;
  published_actions: number;
  search_to_match_rate: RateMetricView;
  summary: string;
}

export interface RevenueMetricsView {
  escrow_funded_amount_minor: RollingCountsView;
  escrow_released_amount_minor: RollingCountsView;
  platform_fee_total_minor: RollingCountsView;
  currency_code: string;
  summary: string;
}

export interface AnalyticsSummaryView {
  platform: PlatformMetricsView;
  growth: GrowthMetricsView;
  conversion: ConversionMetricsView;
  contracts: ContractMetricsView;
  escrow: EscrowMetricsView;
  execution: ExecutionMetricsView;
  trust: TrustMetricsView;
  discovery: DiscoveryMetricsView;
  revenue: RevenueMetricsView;
  headline: string;
  generated_at: string;
}

export interface RawRollingRow {
  allTime: number;
  last7Days: number;
  prior7Days: number;
  last30Days: number;
  prior30Days: number;
}

export interface PlatformAnalyticsSnapshot {
  requests: RawRollingRow & { matched: number; open: number };
  offers: RawRollingRow & { contractCreated: number; cancelled: number };
  contracts: RawRollingRow & { completed: number; active: number; disputed: number };
  issues: RawRollingRow & { total: number; open: number };
  escrows: RawRollingRow & {
    funded: number;
    released: number;
    frozen: number;
    pendingFunding: number;
  };
  escrowAmounts: {
    fundedMinor: RawRollingRow;
    releasedMinor: RawRollingRow;
    platformFeeMinor: RawRollingRow;
    currencyCode: string;
  };
  execution: {
    totalMilestones: number;
    completedMilestones: number;
    inProgressMilestones: number;
    totalEvidence: number;
    contractsWithMilestones: number;
    milestoneActivity: RawRollingRow;
  };
  trust: {
    providersWithScores: number;
    averageTrustScore: number;
    lowTrustProviderCount: number;
    tierDistribution: Array<{ tier: string; count: number }>;
    trustEvents: RawRollingRow;
  };
  discovery: {
    openRequests: number;
    matchableProviders: number;
    publishedActions: number;
  };
  users: {
    activeUsers: RawRollingRow;
    activeProviders: RawRollingRow;
    activeCustomers: number;
    providerUtilizationPercent: number;
  };
}

export function deriveTrendDirection(recent: number, prior: number): TrendDirection {
  if (recent > prior) return "up";
  if (recent < prior) return "down";
  return "flat";
}

export function buildTrendIndicator(input: {
  recent: number;
  prior: number;
  periodDays: number;
  entityLabel: string;
}): TrendIndicator {
  const direction = deriveTrendDirection(input.recent, input.prior);
  const summary =
    direction === "flat"
      ? `${input.recent} ${input.entityLabel}${input.recent === 1 ? "" : "s"} in the last ${input.periodDays} days, unchanged from the prior period.`
      : direction === "up"
        ? `${input.recent} ${input.entityLabel}${input.recent === 1 ? "" : "s"} in the last ${input.periodDays} days, up from ${input.prior}.`
        : `${input.recent} ${input.entityLabel}${input.recent === 1 ? "" : "s"} in the last ${input.periodDays} days, down from ${input.prior}.`;

  return { direction, summary };
}

export function buildRollingCounts(
  row: RawRollingRow,
  entityLabel: string
): RollingCounts {
  return {
    allTime: row.allTime,
    last7Days: row.last7Days,
    prior7Days: row.prior7Days,
    last30Days: row.last30Days,
    prior30Days: row.prior30Days,
    trend7Day: buildTrendIndicator({
      recent: row.last7Days,
      prior: row.prior7Days,
      periodDays: 7,
      entityLabel,
    }),
    trend30Day: buildTrendIndicator({
      recent: row.last30Days,
      prior: row.prior30Days,
      periodDays: 30,
      entityLabel,
    }),
  };
}

export function buildRateMetric(
  numerator: number,
  denominator: number,
  summary: string
): RateMetric {
  const safeDenominator = Math.max(denominator, 0);
  const ratePercent =
    safeDenominator === 0 ? 0 : Math.round((numerator / safeDenominator) * 100);

  return {
    ratePercent,
    numerator,
    denominator: safeDenominator,
    summary,
  };
}

export function buildPlatformMetrics(
  snapshot: PlatformAnalyticsSnapshot,
  generatedAt?: Date
): PlatformMetrics {
  return {
    activeUsers: snapshot.users.activeUsers.allTime,
    activeProviders: snapshot.users.activeProviders.allTime,
    activeCustomers: snapshot.users.activeCustomers,
    providerUtilizationPercent: snapshot.users.providerUtilizationPercent,
    totalRequests: snapshot.requests.allTime,
    totalOffers: snapshot.offers.allTime,
    totalContracts: snapshot.contracts.allTime,
    averageTrustScore: snapshot.trust.averageTrustScore,
    platformFeeTotalMinor: snapshot.escrowAmounts.platformFeeMinor.allTime,
    generatedAt: generatedAt ?? new Date(),
  };
}

export function buildGrowthMetrics(snapshot: PlatformAnalyticsSnapshot): GrowthMetrics {
  const requestsCreated = buildRollingCounts(snapshot.requests, "new request");
  const offersCreated = buildRollingCounts(snapshot.offers, "new offer");
  const contractsCreated = buildRollingCounts(snapshot.contracts, "new contract");
  const activeUsers = buildRollingCounts(snapshot.users.activeUsers, "active user");
  const activeProviders = buildRollingCounts(snapshot.users.activeProviders, "active provider");

  return {
    requestsCreated,
    offersCreated,
    contractsCreated,
    activeUsers,
    activeProviders,
    summary: `${requestsCreated.last7Days} requests, ${offersCreated.last7Days} offers, and ${contractsCreated.last7Days} contracts created in the last 7 days.`,
  };
}

export function buildConversionMetrics(snapshot: PlatformAnalyticsSnapshot): ConversionMetrics {
  const offersEligible = Math.max(
    1,
    snapshot.offers.allTime - snapshot.offers.cancelled
  );
  const offerToContractRate = buildRateMetric(
    snapshot.offers.contractCreated,
    offersEligible,
    `${snapshot.offers.contractCreated} of ${offersEligible} non-cancelled offers converted to contracts (${Math.round((snapshot.offers.contractCreated / offersEligible) * 100)}%).`
  );

  const contractsEligible = Math.max(1, snapshot.contracts.allTime);
  const contractToFundedRate = buildRateMetric(
    snapshot.escrows.funded,
    contractsEligible,
    `${snapshot.escrows.funded} of ${contractsEligible} contracts reached funded escrow.`
  );

  const searchToMatchRate = buildRateMetric(
    snapshot.offers.allTime,
    Math.max(1, snapshot.requests.allTime),
    `${snapshot.offers.allTime} offers created from ${snapshot.requests.allTime} customer requests.`
  );

  return {
    offerToContractRate,
    contractToFundedRate,
    searchToMatchRate,
    offersCreated: buildRollingCounts(snapshot.offers, "new offer"),
    contractsCreated: buildRollingCounts(snapshot.contracts, "new contract"),
    summary: `Offer→contract ${offerToContractRate.ratePercent}%, contract→funded ${contractToFundedRate.ratePercent}%, request→offer ${searchToMatchRate.ratePercent}%.`,
  };
}

export function buildContractMetrics(snapshot: PlatformAnalyticsSnapshot): ContractMetrics {
  const completionRate = buildRateMetric(
    snapshot.contracts.completed,
    Math.max(1, snapshot.contracts.allTime),
    `${snapshot.contracts.completed} of ${snapshot.contracts.allTime} contracts completed.`
  );
  const issueDisputeRate = buildRateMetric(
    snapshot.contracts.disputed,
    Math.max(1, snapshot.contracts.allTime),
    `${snapshot.contracts.disputed} of ${snapshot.contracts.allTime} contracts entered issue or dispute states.`
  );

  return {
    totalContracts: snapshot.contracts.allTime,
    activeContracts: snapshot.contracts.active,
    completedContracts: snapshot.contracts.completed,
    completionRate,
    issueDisputeRate,
    contractsCreated: buildRollingCounts(snapshot.contracts, "new contract"),
    summary: `${snapshot.contracts.active} active, ${snapshot.contracts.completed} completed, ${issueDisputeRate.ratePercent}% issue/dispute rate.`,
  };
}

export function buildEscrowMetrics(snapshot: PlatformAnalyticsSnapshot): EscrowMetrics {
  return {
    totalEscrows: snapshot.escrows.allTime,
    fundedEscrows: snapshot.escrows.funded,
    releasedEscrows: snapshot.escrows.released,
    frozenEscrows: snapshot.escrows.frozen,
    fundedAmountMinor: buildRollingCounts(snapshot.escrowAmounts.fundedMinor, "escrow funded"),
    releasedAmountMinor: buildRollingCounts(snapshot.escrowAmounts.releasedMinor, "escrow released"),
    summary: `${snapshot.escrows.funded} funded escrows, ${snapshot.escrows.released} released, ${snapshot.escrows.frozen} frozen.`,
  };
}

export function buildExecutionMetrics(snapshot: PlatformAnalyticsSnapshot): ExecutionMetrics {
  return {
    totalMilestones: snapshot.execution.totalMilestones,
    completedMilestones: snapshot.execution.completedMilestones,
    inProgressMilestones: snapshot.execution.inProgressMilestones,
    totalEvidence: snapshot.execution.totalEvidence,
    contractsWithMilestones: snapshot.execution.contractsWithMilestones,
    milestoneActivity: buildRollingCounts(
      snapshot.execution.milestoneActivity,
      "milestone update"
    ),
    summary: `${snapshot.execution.totalMilestones} milestones across ${snapshot.execution.contractsWithMilestones} contracts with ${snapshot.execution.totalEvidence} evidence records.`,
  };
}

export function buildTrustMetrics(snapshot: PlatformAnalyticsSnapshot): TrustMetrics {
  return {
    providersWithScores: snapshot.trust.providersWithScores,
    averageTrustScore: snapshot.trust.averageTrustScore,
    lowTrustProviderCount: snapshot.trust.lowTrustProviderCount,
    trustTierDistribution: snapshot.trust.tierDistribution.map((entry) => ({
      tier: entry.tier as TrustLiveFrameTier | string,
      count: entry.count,
    })),
    trustEvents: buildRollingCounts(snapshot.trust.trustEvents, "trust event"),
    summary: `${snapshot.trust.providersWithScores} scored providers averaging ${snapshot.trust.averageTrustScore} trust.`,
  };
}

export function buildDiscoveryMetrics(snapshot: PlatformAnalyticsSnapshot): DiscoveryMetrics {
  const searchVolume = buildRollingCounts(snapshot.requests, "search intent");
  const searchToMatchRate = buildRateMetric(
    snapshot.offers.allTime,
    Math.max(1, snapshot.requests.allTime),
    `${snapshot.offers.allTime} offers generated from ${snapshot.requests.allTime} searchable requests.`
  );

  return {
    searchVolume,
    openRequests: snapshot.discovery.openRequests,
    matchableProviders: snapshot.discovery.matchableProviders,
    publishedActions: snapshot.discovery.publishedActions,
    searchToMatchRate,
    summary: `${snapshot.discovery.openRequests} open requests, ${snapshot.discovery.matchableProviders} matchable providers, ${searchToMatchRate.ratePercent}% request→offer rate.`,
  };
}

export function buildRevenueMetrics(snapshot: PlatformAnalyticsSnapshot): RevenueMetrics {
  return {
    escrowFundedAmountMinor: buildRollingCounts(
      snapshot.escrowAmounts.fundedMinor,
      "escrow funded amount"
    ),
    escrowReleasedAmountMinor: buildRollingCounts(
      snapshot.escrowAmounts.releasedMinor,
      "escrow released amount"
    ),
    platformFeeTotalMinor: buildRollingCounts(
      snapshot.escrowAmounts.platformFeeMinor,
      "platform fee"
    ),
    currencyCode: snapshot.escrowAmounts.currencyCode,
    summary: `${snapshot.escrowAmounts.platformFeeMinor.allTime} minor units in platform fees collected (${snapshot.escrowAmounts.currencyCode}).`,
  };
}

export function buildAnalyticsSummary(
  snapshot: PlatformAnalyticsSnapshot,
  generatedAt?: Date
): AnalyticsSummary {
  const at = generatedAt ?? new Date();
  const platform = buildPlatformMetrics(snapshot, at);
  const growth = buildGrowthMetrics(snapshot);
  const conversion = buildConversionMetrics(snapshot);
  const contracts = buildContractMetrics(snapshot);
  const escrow = buildEscrowMetrics(snapshot);
  const execution = buildExecutionMetrics(snapshot);
  const trust = buildTrustMetrics(snapshot);
  const discovery = buildDiscoveryMetrics(snapshot);
  const revenue = buildRevenueMetrics(snapshot);

  return {
    platform,
    growth,
    conversion,
    contracts,
    escrow,
    execution,
    trust,
    discovery,
    revenue,
    headline: `${platform.totalRequests} requests, ${conversion.offerToContractRate.ratePercent}% offer conversion, ${trust.averageTrustScore} average trust.`,
    generatedAt: at,
  };
}

export function toRollingCountsView(counts: RollingCounts): RollingCountsView {
  return {
    all_time: counts.allTime,
    last_7_days: counts.last7Days,
    prior_7_days: counts.prior7Days,
    last_30_days: counts.last30Days,
    prior_30_days: counts.prior30Days,
    trend_7_day: counts.trend7Day,
    trend_30_day: counts.trend30Day,
  };
}

export function toRateMetricView(metric: RateMetric): RateMetricView {
  return {
    rate_percent: metric.ratePercent,
    numerator: metric.numerator,
    denominator: metric.denominator,
    summary: metric.summary,
  };
}

export function toPlatformMetricsView(metrics: PlatformMetrics): PlatformMetricsView {
  return {
    active_users: metrics.activeUsers,
    active_providers: metrics.activeProviders,
    active_customers: metrics.activeCustomers,
    provider_utilization_percent: metrics.providerUtilizationPercent,
    total_requests: metrics.totalRequests,
    total_offers: metrics.totalOffers,
    total_contracts: metrics.totalContracts,
    average_trust_score: metrics.averageTrustScore,
    platform_fee_total_minor: metrics.platformFeeTotalMinor,
    generated_at: metrics.generatedAt.toISOString(),
  };
}

export function toGrowthMetricsView(metrics: GrowthMetrics): GrowthMetricsView {
  return {
    requests_created: toRollingCountsView(metrics.requestsCreated),
    offers_created: toRollingCountsView(metrics.offersCreated),
    contracts_created: toRollingCountsView(metrics.contractsCreated),
    active_users: toRollingCountsView(metrics.activeUsers),
    active_providers: toRollingCountsView(metrics.activeProviders),
    summary: metrics.summary,
  };
}

export function toConversionMetricsView(metrics: ConversionMetrics): ConversionMetricsView {
  return {
    offer_to_contract_rate: toRateMetricView(metrics.offerToContractRate),
    contract_to_funded_rate: toRateMetricView(metrics.contractToFundedRate),
    search_to_match_rate: toRateMetricView(metrics.searchToMatchRate),
    offers_created: toRollingCountsView(metrics.offersCreated),
    contracts_created: toRollingCountsView(metrics.contractsCreated),
    summary: metrics.summary,
  };
}

export function toContractMetricsView(metrics: ContractMetrics): ContractMetricsView {
  return {
    total_contracts: metrics.totalContracts,
    active_contracts: metrics.activeContracts,
    completed_contracts: metrics.completedContracts,
    completion_rate: toRateMetricView(metrics.completionRate),
    issue_dispute_rate: toRateMetricView(metrics.issueDisputeRate),
    contracts_created: toRollingCountsView(metrics.contractsCreated),
    summary: metrics.summary,
  };
}

export function toEscrowMetricsView(metrics: EscrowMetrics): EscrowMetricsView {
  return {
    total_escrows: metrics.totalEscrows,
    funded_escrows: metrics.fundedEscrows,
    released_escrows: metrics.releasedEscrows,
    frozen_escrows: metrics.frozenEscrows,
    funded_amount_minor: toRollingCountsView(metrics.fundedAmountMinor),
    released_amount_minor: toRollingCountsView(metrics.releasedAmountMinor),
    summary: metrics.summary,
  };
}

export function toExecutionMetricsView(metrics: ExecutionMetrics): ExecutionMetricsView {
  return {
    total_milestones: metrics.totalMilestones,
    completed_milestones: metrics.completedMilestones,
    in_progress_milestones: metrics.inProgressMilestones,
    total_evidence: metrics.totalEvidence,
    contracts_with_milestones: metrics.contractsWithMilestones,
    milestone_activity: toRollingCountsView(metrics.milestoneActivity),
    summary: metrics.summary,
  };
}

export function toTrustMetricsView(metrics: TrustMetrics): TrustMetricsView {
  return {
    providers_with_scores: metrics.providersWithScores,
    average_trust_score: metrics.averageTrustScore,
    low_trust_provider_count: metrics.lowTrustProviderCount,
    trust_tier_distribution: metrics.trustTierDistribution.map((entry) => ({
      tier: String(entry.tier),
      count: entry.count,
    })),
    trust_events: toRollingCountsView(metrics.trustEvents),
    summary: metrics.summary,
  };
}

export function toDiscoveryMetricsView(metrics: DiscoveryMetrics): DiscoveryMetricsView {
  return {
    search_volume: toRollingCountsView(metrics.searchVolume),
    open_requests: metrics.openRequests,
    matchable_providers: metrics.matchableProviders,
    published_actions: metrics.publishedActions,
    search_to_match_rate: toRateMetricView(metrics.searchToMatchRate),
    summary: metrics.summary,
  };
}

export function toRevenueMetricsView(metrics: RevenueMetrics): RevenueMetricsView {
  return {
    escrow_funded_amount_minor: toRollingCountsView(metrics.escrowFundedAmountMinor),
    escrow_released_amount_minor: toRollingCountsView(metrics.escrowReleasedAmountMinor),
    platform_fee_total_minor: toRollingCountsView(metrics.platformFeeTotalMinor),
    currency_code: metrics.currencyCode,
    summary: metrics.summary,
  };
}

export function toAnalyticsSummaryView(summary: AnalyticsSummary): AnalyticsSummaryView {
  return {
    platform: toPlatformMetricsView(summary.platform),
    growth: toGrowthMetricsView(summary.growth),
    conversion: toConversionMetricsView(summary.conversion),
    contracts: toContractMetricsView(summary.contracts),
    escrow: toEscrowMetricsView(summary.escrow),
    execution: toExecutionMetricsView(summary.execution),
    trust: toTrustMetricsView(summary.trust),
    discovery: toDiscoveryMetricsView(summary.discovery),
    revenue: toRevenueMetricsView(summary.revenue),
    headline: summary.headline,
    generated_at: summary.generatedAt.toISOString(),
  };
}
