import type { PlatformAnalyticsSnapshot } from "../../../analytics/domain/platform-analytics.js";
import {
  buildConversionMetrics,
  buildDiscoveryMetrics,
  buildRateMetric,
  toRateMetricView,
  toRollingCountsView,
  type RateMetric,
  type RollingCounts,
} from "../../../analytics/domain/platform-analytics.js";
import type {
  DiscoverableActionRecord,
  DiscoverableProviderRecord,
  DiscoverableRequestRecord,
} from "../../../discovery/infrastructure/discovery-repository.js";
import { formatMinorAmount } from "../../../experience/format.js";
import {
  resolvePrimaryActionCode,
  suggestMatchingActions,
} from "../../../request-experience/domain/request.js";

export interface MarketplaceIntelligenceRawSnapshot {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  providers: DiscoverableProviderRecord[];
  actionCounts: DiscoverableActionRecord[];
  requests: DiscoverableRequestRecord[];
}

export interface DemandAnalytics {
  totalRequests: number;
  openRequests: number;
  matchedRequests: number;
  requestsWithBudget: number;
  averageBudgetMinor: number;
  averageBudgetLabel: string;
  requestsCreated: RollingCounts;
  summary: string;
}

export interface SupplyActionCoverage {
  actionCode: string;
  providerCount: number;
}

export interface SupplyAnalytics {
  totalProviders: number;
  availableNowProviders: number;
  matchableProviders: number;
  publishedActions: number;
  averageTrustScore: number;
  providerUtilizationPercent: number;
  topActions: SupplyActionCoverage[];
  summary: string;
}

export interface PricingAnalytics {
  currencyCode: string;
  averageRequestBudgetMinor: number;
  averageRequestBudgetLabel: string;
  averageProviderPriceEstimateMinor: number;
  averageProviderPriceEstimateLabel: string;
  budgetCoverageRate: RateMetric;
  platformFeeTotalMinor: number;
  platformFeeTotalLabel: string;
  escrowFundedMinor: number;
  escrowFundedLabel: string;
  summary: string;
}

export interface MarketplaceHealthAnalytics {
  healthScore: number;
  healthStatus: "healthy" | "balanced" | "constrained";
  demandSupplyRatio: number;
  offerToContractRate: RateMetric;
  searchToMatchRate: RateMetric;
  providerUtilizationPercent: number;
  summary: string;
}

export interface OpportunityInsight {
  insightCode: string;
  category: "demand_gap" | "supply_capacity" | "pricing_fit" | "action_gap";
  title: string;
  message: string;
  priorityScore: number;
}

export interface OpportunityInsights {
  totalInsights: number;
  insights: OpportunityInsight[];
  summary: string;
}

export interface MarketplaceIntelligenceOverview {
  headline: string;
  healthScore: number;
  openRequests: number;
  availableProviders: number;
  offerToContractRatePercent: number;
  summary: string;
}

export interface MarketplaceIntelligenceSnapshot {
  overview: MarketplaceIntelligenceOverview;
  demand: DemandAnalytics;
  supply: SupplyAnalytics;
  pricing: PricingAnalytics;
  health: MarketplaceHealthAnalytics;
  opportunities: OpportunityInsights;
  generatedAt: Date;
}

export interface MarketplaceIntelligence {
  overview: MarketplaceIntelligenceOverview;
  demand: DemandAnalytics;
  supply: SupplyAnalytics;
  pricing: PricingAnalytics;
  health: MarketplaceHealthAnalytics;
  opportunities: OpportunityInsights;
  generatedAt: Date;
}

export interface DemandAnalyticsView {
  total_requests: number;
  open_requests: number;
  matched_requests: number;
  requests_with_budget: number;
  average_budget_minor: number;
  average_budget_label: string;
  requests_created: ReturnType<typeof toRollingCountsView>;
  summary: string;
}

export interface SupplyActionCoverageView {
  action_code: string;
  provider_count: number;
}

export interface SupplyAnalyticsView {
  total_providers: number;
  available_now_providers: number;
  matchable_providers: number;
  published_actions: number;
  average_trust_score: number;
  provider_utilization_percent: number;
  top_actions: SupplyActionCoverageView[];
  summary: string;
}

export interface PricingAnalyticsView {
  currency_code: string;
  average_request_budget_minor: number;
  average_request_budget_label: string;
  average_provider_price_estimate_minor: number;
  average_provider_price_estimate_label: string;
  budget_coverage_rate: ReturnType<typeof toRateMetricView>;
  platform_fee_total_minor: number;
  platform_fee_total_label: string;
  escrow_funded_minor: number;
  escrow_funded_label: string;
  summary: string;
}

export interface MarketplaceHealthAnalyticsView {
  health_score: number;
  health_status: "healthy" | "balanced" | "constrained";
  demand_supply_ratio: number;
  offer_to_contract_rate: ReturnType<typeof toRateMetricView>;
  search_to_match_rate: ReturnType<typeof toRateMetricView>;
  provider_utilization_percent: number;
  summary: string;
}

export interface OpportunityInsightView {
  insight_code: string;
  category: OpportunityInsight["category"];
  title: string;
  message: string;
  priority_score: number;
}

export interface OpportunityInsightsView {
  total_insights: number;
  insights: OpportunityInsightView[];
  summary: string;
}

export interface MarketplaceIntelligenceOverviewView {
  headline: string;
  health_score: number;
  open_requests: number;
  available_providers: number;
  offer_to_contract_rate_percent: number;
  summary: string;
}

export interface MarketplaceIntelligenceView {
  overview: MarketplaceIntelligenceOverviewView;
  demand: DemandAnalyticsView;
  supply: SupplyAnalyticsView;
  pricing: PricingAnalyticsView;
  health: MarketplaceHealthAnalyticsView;
  opportunities: OpportunityInsightsView;
  generated_at: string;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function buildRollingCountsFromRow(
  row: PlatformAnalyticsSnapshot["requests"],
  label: string
): RollingCounts {
  return {
    allTime: row.allTime,
    last7Days: row.last7Days,
    prior7Days: row.prior7Days,
    last30Days: row.last30Days,
    prior30Days: row.prior30Days,
    trend7Day: {
      direction:
        row.last7Days > row.prior7Days ? "up" : row.last7Days < row.prior7Days ? "down" : "flat",
      summary: `${row.last7Days} ${label}${row.last7Days === 1 ? "" : "s"} in the last 7 days.`,
    },
    trend30Day: {
      direction:
        row.last30Days > row.prior30Days ? "up" : row.last30Days < row.prior30Days ? "down" : "flat",
      summary: `${row.last30Days} ${label}${row.last30Days === 1 ? "" : "s"} in the last 30 days.`,
    },
  };
}

export function buildDemandAnalytics(input: {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  requests: DiscoverableRequestRecord[];
}): DemandAnalytics {
  const currencyCode = input.analyticsSnapshot.escrowAmounts.currencyCode;
  const budgets = input.requests
    .map((request) => request.budgetMinor)
    .filter((budget): budget is number => budget !== null && budget > 0);
  const averageBudgetMinor = average(budgets);
  const matchedRequests = input.requests.filter((request) => request.status === "matched").length;

  return {
    totalRequests: input.analyticsSnapshot.requests.allTime,
    openRequests: input.analyticsSnapshot.discovery.openRequests,
    matchedRequests,
    requestsWithBudget: budgets.length,
    averageBudgetMinor,
    averageBudgetLabel: formatMinorAmount(averageBudgetMinor, currencyCode),
    requestsCreated: buildRollingCountsFromRow(input.analyticsSnapshot.requests, "new request"),
    summary: `${input.analyticsSnapshot.discovery.openRequests} open and ${matchedRequests} matched live requests with ${budgets.length} budgeted intents.`,
  };
}

export function buildSupplyAnalytics(input: {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  providers: DiscoverableProviderRecord[];
  actionCounts: DiscoverableActionRecord[];
}): SupplyAnalytics {
  const availableNowProviders = input.providers.filter((provider) => provider.availableNow).length;
  const topActions = [...input.actionCounts]
    .sort((left, right) => right.providerCount - left.providerCount)
    .slice(0, 5)
    .map((entry) => ({
      actionCode: entry.actionCode,
      providerCount: entry.providerCount,
    }));

  return {
    totalProviders: input.providers.length,
    availableNowProviders,
    matchableProviders: input.analyticsSnapshot.discovery.matchableProviders,
    publishedActions: input.analyticsSnapshot.discovery.publishedActions,
    averageTrustScore: average(input.providers.map((provider) => provider.trustScore)),
    providerUtilizationPercent: input.analyticsSnapshot.users.providerUtilizationPercent,
    topActions,
    summary: `${input.providers.length} discoverable providers (${availableNowProviders} available now) covering ${input.actionCounts.length} action codes.`,
  };
}

export function buildPricingAnalytics(input: {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  requests: DiscoverableRequestRecord[];
  providers: DiscoverableProviderRecord[];
}): PricingAnalytics {
  const currencyCode = input.analyticsSnapshot.escrowAmounts.currencyCode;
  const budgets = input.requests
    .map((request) => request.budgetMinor)
    .filter((budget): budget is number => budget !== null && budget > 0);
  const averageRequestBudgetMinor = average(budgets);
  const averageProviderPriceEstimateMinor = average(
    input.providers.map((provider) => provider.priceEstimate)
  );
  const coveredBudgets = budgets.filter(
    (budget) => budget >= averageProviderPriceEstimateMinor
  ).length;
  const budgetCoverageRate = buildRateMetric(
    coveredBudgets,
    Math.max(1, budgets.length),
    `${coveredBudgets} of ${budgets.length} budgeted requests cover the average provider price estimate.`
  );

  return {
    currencyCode,
    averageRequestBudgetMinor,
    averageRequestBudgetLabel: formatMinorAmount(averageRequestBudgetMinor, currencyCode),
    averageProviderPriceEstimateMinor,
    averageProviderPriceEstimateLabel: formatMinorAmount(
      averageProviderPriceEstimateMinor,
      currencyCode
    ),
    budgetCoverageRate,
    platformFeeTotalMinor: input.analyticsSnapshot.escrowAmounts.platformFeeMinor.allTime,
    platformFeeTotalLabel: formatMinorAmount(
      input.analyticsSnapshot.escrowAmounts.platformFeeMinor.allTime,
      currencyCode
    ),
    escrowFundedMinor: input.analyticsSnapshot.escrowAmounts.fundedMinor.allTime,
    escrowFundedLabel: formatMinorAmount(
      input.analyticsSnapshot.escrowAmounts.fundedMinor.allTime,
      currencyCode
    ),
    summary: `Average request budget ${formatMinorAmount(averageRequestBudgetMinor, currencyCode)} vs provider estimate ${formatMinorAmount(averageProviderPriceEstimateMinor, currencyCode)} (${budgetCoverageRate.ratePercent}% coverage).`,
  };
}

export function computeMarketplaceHealthScore(input: {
  offerToContractRate: RateMetric;
  searchToMatchRate: RateMetric;
  openRequests: number;
  availableNowProviders: number;
  providerUtilizationPercent: number;
}): number {
  const balanceScore = Math.min(
    100,
    Math.round((input.availableNowProviders / Math.max(1, input.openRequests)) * 100)
  );
  const capacityScore = Math.max(0, 100 - input.providerUtilizationPercent);

  return Math.round(
    input.offerToContractRate.ratePercent * 0.3 +
      input.searchToMatchRate.ratePercent * 0.25 +
      balanceScore * 0.25 +
      capacityScore * 0.2
  );
}

export function deriveMarketplaceHealthStatus(score: number): MarketplaceHealthAnalytics["healthStatus"] {
  if (score >= 75) return "healthy";
  if (score >= 50) return "balanced";
  return "constrained";
}

export function buildMarketplaceHealthAnalytics(input: {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  openRequests: number;
  availableNowProviders: number;
}): MarketplaceHealthAnalytics {
  const conversion = buildConversionMetrics(input.analyticsSnapshot);
  const discovery = buildDiscoveryMetrics(input.analyticsSnapshot);
  const demandSupplyRatio =
    Math.round((input.openRequests / Math.max(1, input.availableNowProviders)) * 100) / 100;
  const healthScore = computeMarketplaceHealthScore({
    offerToContractRate: conversion.offerToContractRate,
    searchToMatchRate: discovery.searchToMatchRate,
    openRequests: input.openRequests,
    availableNowProviders: input.availableNowProviders,
    providerUtilizationPercent: input.analyticsSnapshot.users.providerUtilizationPercent,
  });

  return {
    healthScore,
    healthStatus: deriveMarketplaceHealthStatus(healthScore),
    demandSupplyRatio,
    offerToContractRate: conversion.offerToContractRate,
    searchToMatchRate: discovery.searchToMatchRate,
    providerUtilizationPercent: input.analyticsSnapshot.users.providerUtilizationPercent,
    summary: `Marketplace health score ${healthScore} with ${demandSupplyRatio} open requests per available provider and ${conversion.offerToContractRate.ratePercent}% offer→contract conversion.`,
  };
}

export function buildOpportunityInsights(input: {
  requests: DiscoverableRequestRecord[];
  providers: DiscoverableProviderRecord[];
  actionCounts: DiscoverableActionRecord[];
}): OpportunityInsights {
  const actionCountByCode = new Map(
    input.actionCounts.map((entry) => [entry.actionCode, entry.providerCount])
  );
  const insights: OpportunityInsight[] = [];

  for (const request of input.requests) {
    const suggestions = suggestMatchingActions(request.requestText);
    const primary = resolvePrimaryActionCode(suggestions);
    if (!primary) continue;
    const providerCount = actionCountByCode.get(primary.actionCode) ?? 0;
    if (providerCount >= 2) continue;
    insights.push({
      insightCode: `demand-gap-${request.id}`,
      category: "demand_gap",
      title: "Underserved request intent",
      message: `Open request maps to ${primary.actionCode} with only ${providerCount} supplying provider${providerCount === 1 ? "" : "s"}.`,
      priorityScore: 90 - providerCount * 10 + (request.budgetMinor ?? 0) / 1000,
    });
  }

  for (const provider of input.providers.filter(
    (entry) => entry.availableNow && entry.trustScore >= 70
  )) {
    insights.push({
      insightCode: `supply-capacity-${provider.providerId}`,
      category: "supply_capacity",
      title: "High-trust available provider",
      message: `${provider.displayName} is available now with trust score ${provider.trustScore}.`,
      priorityScore: provider.trustScore + provider.completedContracts,
    });
  }

  for (const action of input.actionCounts.filter((entry) => entry.providerCount <= 1)) {
    insights.push({
      insightCode: `action-gap-${action.actionCode}`,
      category: "action_gap",
      title: "Thin action supply",
      message: `${action.actionCode} has only ${action.providerCount} active provider listing${action.providerCount === 1 ? "" : "s"}.`,
      priorityScore: 60 - action.providerCount * 5,
    });
  }

  for (const request of input.requests.filter(
    (entry) => entry.budgetMinor !== null && entry.budgetMinor > 0
  )) {
    const averageEstimate = average(input.providers.map((provider) => provider.priceEstimate));
    if (request.budgetMinor! >= averageEstimate) {
      insights.push({
        insightCode: `pricing-fit-${request.id}`,
        category: "pricing_fit",
        title: "Budget-aligned demand",
        message: `Budgeted request exceeds average provider estimate (${formatMinorAmount(request.budgetMinor!, "USD")}).`,
        priorityScore: 50 + Math.min(40, Math.floor(request.budgetMinor! / 1000)),
      });
    }
  }

  const ranked = insights.sort((left, right) => right.priorityScore - left.priorityScore).slice(0, 8);

  return {
    totalInsights: ranked.length,
    insights: ranked,
    summary:
      ranked.length > 0
        ? `${ranked.length} deterministic marketplace opportunity insight${ranked.length === 1 ? "" : "s"} ranked by priority score.`
        : "No immediate marketplace opportunity insights detected.",
  };
}

export function buildMarketplaceIntelligenceOverview(input: {
  demand: DemandAnalytics;
  supply: SupplyAnalytics;
  health: MarketplaceHealthAnalytics;
}): MarketplaceIntelligenceOverview {
  return {
    headline: "Marketplace intelligence",
    healthScore: input.health.healthScore,
    openRequests: input.demand.openRequests,
    availableProviders: input.supply.availableNowProviders,
    offerToContractRatePercent: input.health.offerToContractRate.ratePercent,
    summary: `Marketplace intelligence with health ${input.health.healthScore}, ${input.demand.openRequests} open requests, and ${input.supply.availableNowProviders} available providers.`,
  };
}

export function buildMarketplaceIntelligenceSnapshot(input: {
  raw: MarketplaceIntelligenceRawSnapshot;
  generatedAt?: Date;
}): MarketplaceIntelligenceSnapshot {
  const demand = buildDemandAnalytics({
    analyticsSnapshot: input.raw.analyticsSnapshot,
    requests: input.raw.requests,
  });
  const supply = buildSupplyAnalytics({
    analyticsSnapshot: input.raw.analyticsSnapshot,
    providers: input.raw.providers,
    actionCounts: input.raw.actionCounts,
  });
  const pricing = buildPricingAnalytics({
    analyticsSnapshot: input.raw.analyticsSnapshot,
    requests: input.raw.requests,
    providers: input.raw.providers,
  });
  const health = buildMarketplaceHealthAnalytics({
    analyticsSnapshot: input.raw.analyticsSnapshot,
    openRequests: demand.openRequests,
    availableNowProviders: supply.availableNowProviders,
  });
  const opportunities = buildOpportunityInsights({
    requests: input.raw.requests,
    providers: input.raw.providers,
    actionCounts: input.raw.actionCounts,
  });
  const overview = buildMarketplaceIntelligenceOverview({ demand, supply, health });

  return {
    overview,
    demand,
    supply,
    pricing,
    health,
    opportunities,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildMarketplaceIntelligence(input: {
  snapshot: MarketplaceIntelligenceSnapshot;
}): MarketplaceIntelligence {
  return {
    overview: input.snapshot.overview,
    demand: input.snapshot.demand,
    supply: input.snapshot.supply,
    pricing: input.snapshot.pricing,
    health: input.snapshot.health,
    opportunities: input.snapshot.opportunities,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toDemandAnalyticsView(demand: DemandAnalytics): DemandAnalyticsView {
  return {
    total_requests: demand.totalRequests,
    open_requests: demand.openRequests,
    matched_requests: demand.matchedRequests,
    requests_with_budget: demand.requestsWithBudget,
    average_budget_minor: demand.averageBudgetMinor,
    average_budget_label: demand.averageBudgetLabel,
    requests_created: toRollingCountsView(demand.requestsCreated),
    summary: demand.summary,
  };
}

export function toSupplyActionCoverageView(
  coverage: SupplyActionCoverage
): SupplyActionCoverageView {
  return {
    action_code: coverage.actionCode,
    provider_count: coverage.providerCount,
  };
}

export function toSupplyAnalyticsView(supply: SupplyAnalytics): SupplyAnalyticsView {
  return {
    total_providers: supply.totalProviders,
    available_now_providers: supply.availableNowProviders,
    matchable_providers: supply.matchableProviders,
    published_actions: supply.publishedActions,
    average_trust_score: supply.averageTrustScore,
    provider_utilization_percent: supply.providerUtilizationPercent,
    top_actions: supply.topActions.map(toSupplyActionCoverageView),
    summary: supply.summary,
  };
}

export function toPricingAnalyticsView(pricing: PricingAnalytics): PricingAnalyticsView {
  return {
    currency_code: pricing.currencyCode,
    average_request_budget_minor: pricing.averageRequestBudgetMinor,
    average_request_budget_label: pricing.averageRequestBudgetLabel,
    average_provider_price_estimate_minor: pricing.averageProviderPriceEstimateMinor,
    average_provider_price_estimate_label: pricing.averageProviderPriceEstimateLabel,
    budget_coverage_rate: toRateMetricView(pricing.budgetCoverageRate),
    platform_fee_total_minor: pricing.platformFeeTotalMinor,
    platform_fee_total_label: pricing.platformFeeTotalLabel,
    escrow_funded_minor: pricing.escrowFundedMinor,
    escrow_funded_label: pricing.escrowFundedLabel,
    summary: pricing.summary,
  };
}

export function toMarketplaceHealthAnalyticsView(
  health: MarketplaceHealthAnalytics
): MarketplaceHealthAnalyticsView {
  return {
    health_score: health.healthScore,
    health_status: health.healthStatus,
    demand_supply_ratio: health.demandSupplyRatio,
    offer_to_contract_rate: toRateMetricView(health.offerToContractRate),
    search_to_match_rate: toRateMetricView(health.searchToMatchRate),
    provider_utilization_percent: health.providerUtilizationPercent,
    summary: health.summary,
  };
}

export function toOpportunityInsightView(insight: OpportunityInsight): OpportunityInsightView {
  return {
    insight_code: insight.insightCode,
    category: insight.category,
    title: insight.title,
    message: insight.message,
    priority_score: insight.priorityScore,
  };
}

export function toOpportunityInsightsView(
  opportunities: OpportunityInsights
): OpportunityInsightsView {
  return {
    total_insights: opportunities.totalInsights,
    insights: opportunities.insights.map(toOpportunityInsightView),
    summary: opportunities.summary,
  };
}

export function toMarketplaceIntelligenceOverviewView(
  overview: MarketplaceIntelligenceOverview
): MarketplaceIntelligenceOverviewView {
  return {
    headline: overview.headline,
    health_score: overview.healthScore,
    open_requests: overview.openRequests,
    available_providers: overview.availableProviders,
    offer_to_contract_rate_percent: overview.offerToContractRatePercent,
    summary: overview.summary,
  };
}

export function toMarketplaceIntelligenceView(
  intelligence: MarketplaceIntelligence
): MarketplaceIntelligenceView {
  return {
    overview: toMarketplaceIntelligenceOverviewView(intelligence.overview),
    demand: toDemandAnalyticsView(intelligence.demand),
    supply: toSupplyAnalyticsView(intelligence.supply),
    pricing: toPricingAnalyticsView(intelligence.pricing),
    health: toMarketplaceHealthAnalyticsView(intelligence.health),
    opportunities: toOpportunityInsightsView(intelligence.opportunities),
    generated_at: intelligence.generatedAt.toISOString(),
  };
}
