import type { MarketplaceIntelligenceSnapshot } from "../../marketplace-intelligence/domain/marketplace-intelligence.js";
import type { InvestorReadinessSnapshot } from "../../investor-readiness/domain/investor-readiness.js";
import type { LaunchSimulationSnapshot } from "../../launch-simulation/domain/launch-simulation.js";
import type { MissionControlSnapshot } from "../../mission-control/domain/mission-control.js";
import type { PlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import type {
  GrowthStatus,
  PostLaunchMonitoringSnapshot,
} from "../../post-launch-monitoring/domain/post-launch-monitoring.js";

export type BusinessGrowthStatus = GrowthStatus | "stable";
export type InsightCategory = "working" | "weakening" | "attention" | "scale";
export type DriverCategory = "growth" | "adoption" | "trust";

export interface BusinessIntelligenceRawSnapshot {
  marketplace: MarketplaceIntelligenceSnapshot;
  launchSimulation: LaunchSimulationSnapshot;
  investor: InvestorReadinessSnapshot;
  missionControl: MissionControlSnapshot;
  operations: PlatformOperationsSnapshot;
  postLaunch: PostLaunchMonitoringSnapshot;
}

export interface BusinessOverview {
  businessScore: number;
  growthStatus: BusinessGrowthStatus;
  platformHealth: number;
  generatedAt: Date;
  summary: string;
}

export interface CategoryInsight {
  category: string;
  score: number;
  summary: string;
}

export interface DistributionEntry {
  label: string;
  value: number;
  sharePercent: number;
}

export interface MarketplaceIntelligenceView {
  topCategories: CategoryInsight[];
  demandDistribution: DistributionEntry[];
  supplyDistribution: DistributionEntry[];
  opportunityGaps: string[];
  summary: string;
}

export interface RevenueIntelligence {
  contractVolume: number;
  escrowVolume: number;
  platformRevenue: number;
  revenueTrend: number;
  summary: string;
}

export interface UserIntelligence {
  activeUsers: number;
  growthRate: number;
  retentionSignal: number;
  adoptionSignal: number;
  summary: string;
}

export interface ContractIntelligence {
  contractsCreated: number;
  contractsCompleted: number;
  completionRate: number;
  averageContractValue: number;
  summary: string;
}

export interface TrustIntelligence {
  trustScore: number;
  disputeRate: number;
  complaintRate: number;
  reputationSignal: number;
  summary: string;
}

export interface RegionalSegment {
  region: string;
  activityVolume: number;
  growthPercent: number;
  opportunityScore: number;
}

export interface GeographicIntelligence {
  topRegions: RegionalSegment[];
  regionalGrowth: DistributionEntry[];
  regionalOpportunities: string[];
  summary: string;
}

export interface OperationalIntelligence {
  executionHealth: number;
  escrowHealth: number;
  issueVolume: number;
  operationalEfficiency: number;
  summary: string;
}

export interface GrowthDriver {
  category: DriverCategory;
  driver: string;
  strength: number;
  summary: string;
}

export interface GrowthDrivers {
  strongestGrowthDrivers: GrowthDriver[];
  strongestAdoptionDrivers: GrowthDriver[];
  strongestTrustDrivers: GrowthDriver[];
  summary: string;
}

export interface ExecutiveInsight {
  category: InsightCategory;
  insight: string;
  rationale: string;
}

export interface ExecutiveInsights {
  whatsWorking: ExecutiveInsight[];
  whatsWeakening: ExecutiveInsight[];
  requiresAttention: ExecutiveInsight[];
  shouldBeScaled: ExecutiveInsight[];
  summary: string;
}

export interface BusinessIntelligenceScore {
  score: number;
  marketplaceWeight: number;
  revenueWeight: number;
  usersWeight: number;
  contractsWeight: number;
  trustWeight: number;
  operationsWeight: number;
  summary: string;
}

export interface BusinessIntelligenceSnapshot {
  overview: BusinessOverview;
  marketplace: MarketplaceIntelligenceView;
  revenue: RevenueIntelligence;
  users: UserIntelligence;
  contracts: ContractIntelligence;
  trust: TrustIntelligence;
  geography: GeographicIntelligence;
  operations: OperationalIntelligence;
  growthDrivers: GrowthDrivers;
  insights: ExecutiveInsights;
  businessScore: BusinessIntelligenceScore;
  generatedAt: Date;
}

export interface BusinessIntelligenceCenter {
  overview: BusinessOverview;
  marketplace: MarketplaceIntelligenceView;
  revenue: RevenueIntelligence;
  users: UserIntelligence;
  contracts: ContractIntelligence;
  trust: TrustIntelligence;
  geography: GeographicIntelligence;
  operations: OperationalIntelligence;
  growthDrivers: GrowthDrivers;
  insights: ExecutiveInsights;
  businessScore: BusinessIntelligenceScore;
  generatedAt: Date;
}

export const BUSINESS_INTELLIGENCE_ROUTES = [
  "/business-intelligence",
  "/business-intelligence/overview",
  "/business-intelligence/marketplace",
  "/business-intelligence/revenue",
  "/business-intelligence/users",
  "/business-intelligence/contracts",
  "/business-intelligence/trust",
  "/business-intelligence/geography",
  "/business-intelligence/operations",
  "/business-intelligence/drivers",
  "/business-intelligence/insights",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function percentChange(current: number, prior: number): number {
  if (prior <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prior) / prior) * 100);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function distributionFromEntries(entries: Array<{ label: string; value: number }>): DistributionEntry[] {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  return entries.map((entry) => ({
    label: entry.label,
    value: entry.value,
    sharePercent: total > 0 ? Math.round((entry.value / total) * 100) : 0,
  }));
}

function businessGrowthStatus(input: {
  userGrowthStatus: GrowthStatus;
  monitoringScore: number;
}): BusinessGrowthStatus {
  if (input.userGrowthStatus === "ahead" || input.userGrowthStatus === "on_track") {
    return input.monitoringScore >= 70 ? input.userGrowthStatus : "stable";
  }
  return input.userGrowthStatus;
}

export function buildMarketplaceIntelligenceView(
  marketplace: MarketplaceIntelligenceSnapshot
): MarketplaceIntelligenceView {
  const topCategories = marketplace.supply.topActions.slice(0, 5).map((action) => ({
    category: action.actionCode,
    score: clamp(action.providerCount * 10, 0, 100),
    summary: `${action.providerCount} providers covering ${action.actionCode}.`,
  }));

  const demandDistribution = distributionFromEntries([
    { label: "open", value: marketplace.demand.openRequests },
    { label: "matched", value: marketplace.demand.matchedRequests },
    { label: "with_budget", value: marketplace.demand.requestsWithBudget },
  ]);

  const supplyDistribution = distributionFromEntries(
    marketplace.supply.topActions.slice(0, 5).map((action) => ({
      label: action.actionCode,
      value: action.providerCount,
    }))
  );

  const opportunityGaps = marketplace.opportunities.insights
    .filter((insight) => insight.category === "demand_gap" || insight.category === "action_gap")
    .slice(0, 5)
    .map((insight) => insight.title);

  return {
    topCategories,
    demandDistribution,
    supplyDistribution,
    opportunityGaps,
    summary: `Marketplace intelligence across ${topCategories.length} top categories with ${opportunityGaps.length} opportunity gaps.`,
  };
}

export function buildRevenueIntelligence(input: {
  marketplace: MarketplaceIntelligenceSnapshot;
  investor: InvestorReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
}): RevenueIntelligence {
  const contractVolume =
    input.operations.contracts.activeContracts + input.operations.contracts.completedContracts;
  const escrowVolume = input.operations.escrow.escrowVolumeMinor;
  const platformRevenue = input.operations.financial.platformFeesMinor;
  const revenueTrend = percentChange(
    input.marketplace.pricing.platformFeeTotalMinor,
    Math.max(1, input.investor.revenuePotential.currentPlatformRevenueMinor)
  );

  return {
    contractVolume,
    escrowVolume,
    platformRevenue,
    revenueTrend,
    summary: `Revenue intelligence: ${contractVolume} contracts, escrow volume ${escrowVolume}, platform revenue ${platformRevenue}, trend ${revenueTrend}%.`,
  };
}

export function buildUserIntelligence(input: {
  postLaunch: PostLaunchMonitoringSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
}): UserIntelligence {
  return {
    activeUsers: input.postLaunch.first24Hours.actualUsers,
    growthRate: input.postLaunch.firstWeek.growthRate,
    retentionSignal: input.postLaunch.firstWeek.retentionSignal,
    adoptionSignal: input.postLaunch.successIndicators.adoptionSignal,
    summary: `User intelligence: ${input.postLaunch.first24Hours.actualUsers} active users, growth ${input.postLaunch.firstWeek.growthRate}%, adoption signal ${input.postLaunch.successIndicators.adoptionSignal}.`,
  };
}

export function buildContractIntelligence(input: {
  marketplace: MarketplaceIntelligenceSnapshot;
  operations: PlatformOperationsSnapshot;
}): ContractIntelligence {
  const contractsCreated = input.marketplace.demand.requestsCreated.last30Days;
  const contractsCompleted = input.operations.contracts.completedContracts;
  const completionRate =
    input.operations.contracts.totalContracts > 0
      ? Math.round(
          (contractsCompleted / input.operations.contracts.totalContracts) * 100
        )
      : 0;
  const averageContractValue =
    contractsCreated > 0
      ? Math.round(input.marketplace.pricing.escrowFundedMinor / Math.max(1, contractsCreated))
      : input.marketplace.demand.averageBudgetMinor;

  return {
    contractsCreated,
    contractsCompleted,
    completionRate,
    averageContractValue,
    summary: `Contract intelligence: ${contractsCreated} created, ${contractsCompleted} completed, completion rate ${completionRate}%.`,
  };
}

export function buildTrustIntelligence(input: {
  operations: PlatformOperationsSnapshot;
  launchSimulation: LaunchSimulationSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
}): TrustIntelligence {
  const totalContracts = Math.max(1, input.operations.contracts.totalContracts);
  const disputeRate = Math.round((input.operations.trust.disputes / totalContracts) * 100);
  const complaintRate = Math.round(
    (input.operations.complaints.openComplaints / Math.max(1, input.operations.overview.activeUsers)) *
      100
  );
  const reputationSignal = clamp(
    average([
      input.marketplace.supply.averageTrustScore,
      input.launchSimulation.baseline.trustHealthScore,
      100 - disputeRate * 2,
    ]),
    0,
    100
  );

  return {
    trustScore: input.marketplace.supply.averageTrustScore,
    disputeRate,
    complaintRate,
    reputationSignal,
    summary: `Trust intelligence: score ${input.marketplace.supply.averageTrustScore}, dispute rate ${disputeRate}%, reputation signal ${reputationSignal}.`,
  };
}

export function buildGeographicIntelligence(
  marketplace: MarketplaceIntelligenceSnapshot
): GeographicIntelligence {
  const topRegions = marketplace.supply.topActions.slice(0, 5).map((action, index) => ({
    region: action.actionCode,
    activityVolume: action.providerCount + (marketplace.demand.openRequests > index ? 1 : 0),
    growthPercent: clamp(
      percentChange(
        action.providerCount,
        Math.max(1, marketplace.demand.requestsCreated.prior7Days)
      ),
      -100,
      200
    ),
    opportunityScore: clamp(
      marketplace.demand.openRequests * 5 - action.providerCount * 3,
      0,
      100
    ),
  }));

  const regionalGrowth = distributionFromEntries(
    topRegions.map((segment) => ({
      label: segment.region,
      value: Math.max(0, segment.growthPercent),
    }))
  );

  const regionalOpportunities = marketplace.opportunities.insights
    .slice(0, 5)
    .map((insight) => `${insight.title}: ${insight.message}`);

  return {
    topRegions,
    regionalGrowth,
    regionalOpportunities,
    summary: `Geographic intelligence derived from ${topRegions.length} marketplace segments with ${regionalOpportunities.length} regional opportunities.`,
  };
}

export function buildOperationalIntelligence(input: {
  operations: PlatformOperationsSnapshot;
  postLaunch: PostLaunchMonitoringSnapshot;
}): OperationalIntelligence {
  return {
    executionHealth: input.operations.execution.executionHealthScore,
    escrowHealth: input.postLaunch.firstWeek.escrowHealth,
    issueVolume:
      input.operations.complaints.openComplaints + input.operations.complaints.escalationCount,
    operationalEfficiency: input.operations.operationsScore.score,
    summary: `Operational intelligence: execution ${input.operations.execution.executionHealthScore}, escrow ${input.postLaunch.firstWeek.escrowHealth}, efficiency ${input.operations.operationsScore.score}.`,
  };
}

export function buildGrowthDrivers(input: {
  marketplace: MarketplaceIntelligenceSnapshot;
  postLaunch: PostLaunchMonitoringSnapshot;
  missionControl: MissionControlSnapshot;
  investor: InvestorReadinessSnapshot;
}): GrowthDrivers {
  const strongestGrowthDrivers: GrowthDriver[] = [
    {
      category: "growth",
      driver: "Marketplace demand momentum",
      strength: clamp(input.marketplace.health.healthScore, 0, 100),
      summary: `Marketplace health score ${input.marketplace.health.healthScore} drives growth.`,
    },
    {
      category: "growth",
      driver: "Mission control marketplace expansion",
      strength: input.missionControl.growth.marketplaceExpansionReadiness,
      summary: `Marketplace expansion readiness ${input.missionControl.growth.marketplaceExpansionReadiness}.`,
    },
    {
      category: "growth",
      driver: "Investor market opportunity",
      strength: clamp(input.investor.marketOpportunity.demandSupplyBalance, 0, 100),
      summary: `Demand-supply balance ${input.investor.marketOpportunity.demandSupplyBalance}.`,
    },
  ];

  const strongestAdoptionDrivers: GrowthDriver[] = [
    {
      category: "adoption",
      driver: "User growth trajectory",
      strength: input.postLaunch.userGrowth.actualGrowth,
      summary: `Actual growth ${input.postLaunch.userGrowth.actualGrowth}.`,
    },
    {
      category: "adoption",
      driver: "Provider utilization",
      strength: input.marketplace.supply.providerUtilizationPercent,
      summary: `Provider utilization ${input.marketplace.supply.providerUtilizationPercent}%.`,
    },
    {
      category: "adoption",
      driver: "Launch success adoption signal",
      strength: input.postLaunch.successIndicators.adoptionSignal,
      summary: `Adoption signal ${input.postLaunch.successIndicators.adoptionSignal}.`,
    },
  ];

  const strongestTrustDrivers: GrowthDriver[] = [
    {
      category: "trust",
      driver: "Average provider trust score",
      strength: input.marketplace.supply.averageTrustScore,
      summary: `Average trust score ${input.marketplace.supply.averageTrustScore}.`,
    },
    {
      category: "trust",
      driver: "Trust success signal",
      strength: input.postLaunch.successIndicators.trustSignal,
      summary: `Trust signal ${input.postLaunch.successIndicators.trustSignal}.`,
    },
    {
      category: "trust",
      driver: "Investor trust posture",
      strength: input.investor.overview.trustScore,
      summary: `Investor trust score ${input.investor.overview.trustScore}.`,
    },
  ];

  return {
    strongestGrowthDrivers,
    strongestAdoptionDrivers,
    strongestTrustDrivers,
    summary: `Growth drivers identified ${strongestGrowthDrivers.length} growth, ${strongestAdoptionDrivers.length} adoption, and ${strongestTrustDrivers.length} trust drivers.`,
  };
}

export function buildExecutiveInsights(input: {
  marketplace: MarketplaceIntelligenceSnapshot;
  postLaunch: PostLaunchMonitoringSnapshot;
  missionControl: MissionControlSnapshot;
  operations: PlatformOperationsSnapshot;
  businessScore: BusinessIntelligenceScore;
}): ExecutiveInsights {
  const whatsWorking: ExecutiveInsight[] = [];
  const whatsWeakening: ExecutiveInsight[] = [];
  const requiresAttention: ExecutiveInsight[] = [];
  const shouldBeScaled: ExecutiveInsight[] = [];

  if (input.marketplace.health.healthScore >= 70) {
    whatsWorking.push({
      category: "working",
      insight: "Marketplace demand-supply balance is healthy",
      rationale: `Marketplace health score ${input.marketplace.health.healthScore}.`,
    });
  }

  if (input.postLaunch.successIndicators.launchSuccessScore >= 65) {
    whatsWorking.push({
      category: "working",
      insight: "Post-launch success indicators remain positive",
      rationale: `Launch success score ${input.postLaunch.successIndicators.launchSuccessScore}.`,
    });
  }

  if (input.postLaunch.userGrowth.growthStatus === "behind" || input.postLaunch.userGrowth.growthStatus === "at_risk") {
    whatsWeakening.push({
      category: "weakening",
      insight: "User growth is trailing launch projections",
      rationale: `Growth status ${input.postLaunch.userGrowth.growthStatus}, variance ${input.postLaunch.userGrowth.variance}.`,
    });
  }

  if (input.operations.complaints.openComplaints > 0) {
    requiresAttention.push({
      category: "attention",
      insight: "Open complaints require executive review",
      rationale: `${input.operations.complaints.openComplaints} open complaints detected.`,
    });
  }

  for (const risk of input.postLaunch.earlyWarnings.securityRisks.slice(0, 2)) {
    requiresAttention.push({
      category: "attention",
      insight: risk.message,
      rationale: risk.mitigation,
    });
  }

  if (input.missionControl.growth.marketplaceExpansionReadiness >= 70) {
    shouldBeScaled.push({
      category: "scale",
      insight: "Marketplace expansion readiness supports scaling",
      rationale: `Expansion readiness ${input.missionControl.growth.marketplaceExpansionReadiness}.`,
    });
  }

  if (input.businessScore.score >= 75 && input.marketplace.supply.matchableProviders >= 2) {
    shouldBeScaled.push({
      category: "scale",
      insight: "Provider supply can absorb increased demand",
      rationale: `${input.marketplace.supply.matchableProviders} matchable providers available.`,
    });
  }

  if (input.businessScore.score < 55) {
    whatsWeakening.push({
      category: "weakening",
      insight: "Overall business intelligence score is below target",
      rationale: `Business score ${input.businessScore.score}.`,
    });
  }

  return {
    whatsWorking,
    whatsWeakening,
    requiresAttention,
    shouldBeScaled,
    summary: `Executive insights: ${whatsWorking.length} working, ${whatsWeakening.length} weakening, ${requiresAttention.length} attention, ${shouldBeScaled.length} scale opportunities.`,
  };
}

export function computeBusinessIntelligenceScore(input: {
  marketplace: MarketplaceIntelligenceSnapshot;
  revenue: RevenueIntelligence;
  users: UserIntelligence;
  contracts: ContractIntelligence;
  trust: TrustIntelligence;
  operations: OperationalIntelligence;
}): BusinessIntelligenceScore {
  const marketplaceWeight = 20;
  const revenueWeight = 20;
  const usersWeight = 15;
  const contractsWeight = 15;
  const trustWeight = 15;
  const operationsWeight = 15;

  const marketplaceScore = input.marketplace.health.healthScore;
  const revenueScore = clamp(
    average([
      input.revenue.revenueTrend + 50,
      input.revenue.platformRevenue > 0 ? 75 : 45,
    ]),
    0,
    100
  );
  const usersScore = clamp(
    average([input.users.adoptionSignal, input.users.retentionSignal, input.users.growthRate + 50]),
    0,
    100
  );
  const contractsScore = clamp(
    average([input.contracts.completionRate, input.contracts.contractsCompleted > 0 ? 70 : 40]),
    0,
    100
  );
  const trustScore = input.trust.reputationSignal;
  const operationsScore = input.operations.operationalEfficiency;

  const score = clamp(
    Math.round(
      marketplaceScore * (marketplaceWeight / 100) +
        revenueScore * (revenueWeight / 100) +
        usersScore * (usersWeight / 100) +
        contractsScore * (contractsWeight / 100) +
        trustScore * (trustWeight / 100) +
        operationsScore * (operationsWeight / 100)
    ),
    0,
    100
  );

  return {
    score,
    marketplaceWeight,
    revenueWeight,
    usersWeight,
    contractsWeight,
    trustWeight,
    operationsWeight,
    summary: `Business intelligence score ${score} weighted across marketplace (${marketplaceWeight}%), revenue (${revenueWeight}%), users (${usersWeight}%), contracts (${contractsWeight}%), trust (${trustWeight}%), and operations (${operationsWeight}%).`,
  };
}

export function buildBusinessOverview(input: {
  businessScore: BusinessIntelligenceScore;
  postLaunch: PostLaunchMonitoringSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
  generatedAt: Date;
}): BusinessOverview {
  return {
    businessScore: input.businessScore.score,
    growthStatus: businessGrowthStatus({
      userGrowthStatus: input.postLaunch.userGrowth.growthStatus,
      monitoringScore: input.postLaunch.monitoringScore.score,
    }),
    platformHealth: input.marketplace.health.healthScore,
    generatedAt: input.generatedAt,
    summary: `Business overview: score ${input.businessScore.score}, growth ${businessGrowthStatus({ userGrowthStatus: input.postLaunch.userGrowth.growthStatus, monitoringScore: input.postLaunch.monitoringScore.score })}, platform health ${input.marketplace.health.healthScore}.`,
  };
}

export function buildBusinessIntelligenceSnapshot(input: {
  raw: BusinessIntelligenceRawSnapshot;
  generatedAt?: Date;
}): BusinessIntelligenceSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const marketplace = buildMarketplaceIntelligenceView(input.raw.marketplace);
  const revenue = buildRevenueIntelligence({
    marketplace: input.raw.marketplace,
    investor: input.raw.investor,
    operations: input.raw.operations,
  });
  const users = buildUserIntelligence({
    postLaunch: input.raw.postLaunch,
    marketplace: input.raw.marketplace,
  });
  const contracts = buildContractIntelligence({
    marketplace: input.raw.marketplace,
    operations: input.raw.operations,
  });
  const trust = buildTrustIntelligence({
    operations: input.raw.operations,
    launchSimulation: input.raw.launchSimulation,
    marketplace: input.raw.marketplace,
  });
  const geography = buildGeographicIntelligence(input.raw.marketplace);
  const operations = buildOperationalIntelligence({
    operations: input.raw.operations,
    postLaunch: input.raw.postLaunch,
  });
  const businessScore = computeBusinessIntelligenceScore({
    marketplace: input.raw.marketplace,
    revenue,
    users,
    contracts,
    trust,
    operations,
  });
  const growthDrivers = buildGrowthDrivers({
    marketplace: input.raw.marketplace,
    postLaunch: input.raw.postLaunch,
    missionControl: input.raw.missionControl,
    investor: input.raw.investor,
  });
  const insights = buildExecutiveInsights({
    marketplace: input.raw.marketplace,
    postLaunch: input.raw.postLaunch,
    missionControl: input.raw.missionControl,
    operations: input.raw.operations,
    businessScore,
  });
  const overview = buildBusinessOverview({
    businessScore,
    postLaunch: input.raw.postLaunch,
    marketplace: input.raw.marketplace,
    generatedAt,
  });

  return {
    overview,
    marketplace,
    revenue,
    users,
    contracts,
    trust,
    geography,
    operations,
    growthDrivers,
    insights,
    businessScore,
    generatedAt,
  };
}

export function buildBusinessIntelligenceCenter(input: {
  snapshot: BusinessIntelligenceSnapshot;
}): BusinessIntelligenceCenter {
  return {
    overview: input.snapshot.overview,
    marketplace: input.snapshot.marketplace,
    revenue: input.snapshot.revenue,
    users: input.snapshot.users,
    contracts: input.snapshot.contracts,
    trust: input.snapshot.trust,
    geography: input.snapshot.geography,
    operations: input.snapshot.operations,
    growthDrivers: input.snapshot.growthDrivers,
    insights: input.snapshot.insights,
    businessScore: input.snapshot.businessScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export interface CategoryInsightView {
  category: string;
  score: number;
  summary: string;
}

export interface DistributionEntryView {
  label: string;
  value: number;
  share_percent: number;
}

export interface BusinessOverviewView {
  business_score: number;
  growth_status: BusinessGrowthStatus;
  platform_health: number;
  generated_at: string;
  summary: string;
}

export interface MarketplaceIntelligenceSectionView {
  top_categories: CategoryInsightView[];
  demand_distribution: DistributionEntryView[];
  supply_distribution: DistributionEntryView[];
  opportunity_gaps: string[];
  summary: string;
}

export interface RevenueIntelligenceView {
  contract_volume: number;
  escrow_volume: number;
  platform_revenue: number;
  revenue_trend: number;
  summary: string;
}

export interface UserIntelligenceView {
  active_users: number;
  growth_rate: number;
  retention_signal: number;
  adoption_signal: number;
  summary: string;
}

export interface ContractIntelligenceView {
  contracts_created: number;
  contracts_completed: number;
  completion_rate: number;
  average_contract_value: number;
  summary: string;
}

export interface TrustIntelligenceView {
  trust_score: number;
  dispute_rate: number;
  complaint_rate: number;
  reputation_signal: number;
  summary: string;
}

export interface RegionalSegmentView {
  region: string;
  activity_volume: number;
  growth_percent: number;
  opportunity_score: number;
}

export interface GeographicIntelligenceView {
  top_regions: RegionalSegmentView[];
  regional_growth: DistributionEntryView[];
  regional_opportunities: string[];
  summary: string;
}

export interface OperationalIntelligenceView {
  execution_health: number;
  escrow_health: number;
  issue_volume: number;
  operational_efficiency: number;
  summary: string;
}

export interface GrowthDriverView {
  category: DriverCategory;
  driver: string;
  strength: number;
  summary: string;
}

export interface GrowthDriversView {
  strongest_growth_drivers: GrowthDriverView[];
  strongest_adoption_drivers: GrowthDriverView[];
  strongest_trust_drivers: GrowthDriverView[];
  summary: string;
}

export interface ExecutiveInsightView {
  category: InsightCategory;
  insight: string;
  rationale: string;
}

export interface ExecutiveInsightsView {
  whats_working: ExecutiveInsightView[];
  whats_weakening: ExecutiveInsightView[];
  requires_attention: ExecutiveInsightView[];
  should_be_scaled: ExecutiveInsightView[];
  summary: string;
}

export interface BusinessIntelligenceScoreView {
  score: number;
  marketplace_weight: number;
  revenue_weight: number;
  users_weight: number;
  contracts_weight: number;
  trust_weight: number;
  operations_weight: number;
  summary: string;
}

export interface BusinessIntelligenceCenterView {
  overview: BusinessOverviewView;
  marketplace: MarketplaceIntelligenceSectionView;
  revenue: RevenueIntelligenceView;
  users: UserIntelligenceView;
  contracts: ContractIntelligenceView;
  trust: TrustIntelligenceView;
  geography: GeographicIntelligenceView;
  operations: OperationalIntelligenceView;
  growth_drivers: GrowthDriversView;
  insights: ExecutiveInsightsView;
  business_score: BusinessIntelligenceScoreView;
  generated_at: string;
}

export function toCategoryInsightView(insight: CategoryInsight): CategoryInsightView {
  return {
    category: insight.category,
    score: insight.score,
    summary: insight.summary,
  };
}

export function toDistributionEntryView(entry: DistributionEntry): DistributionEntryView {
  return {
    label: entry.label,
    value: entry.value,
    share_percent: entry.sharePercent,
  };
}

export function toBusinessOverviewView(overview: BusinessOverview): BusinessOverviewView {
  return {
    business_score: overview.businessScore,
    growth_status: overview.growthStatus,
    platform_health: overview.platformHealth,
    generated_at: overview.generatedAt.toISOString(),
    summary: overview.summary,
  };
}

export function toMarketplaceIntelligenceSectionView(
  view: MarketplaceIntelligenceView
): MarketplaceIntelligenceSectionView {
  return {
    top_categories: view.topCategories.map(toCategoryInsightView),
    demand_distribution: view.demandDistribution.map(toDistributionEntryView),
    supply_distribution: view.supplyDistribution.map(toDistributionEntryView),
    opportunity_gaps: view.opportunityGaps,
    summary: view.summary,
  };
}

export function toRevenueIntelligenceView(revenue: RevenueIntelligence): RevenueIntelligenceView {
  return {
    contract_volume: revenue.contractVolume,
    escrow_volume: revenue.escrowVolume,
    platform_revenue: revenue.platformRevenue,
    revenue_trend: revenue.revenueTrend,
    summary: revenue.summary,
  };
}

export function toUserIntelligenceView(users: UserIntelligence): UserIntelligenceView {
  return {
    active_users: users.activeUsers,
    growth_rate: users.growthRate,
    retention_signal: users.retentionSignal,
    adoption_signal: users.adoptionSignal,
    summary: users.summary,
  };
}

export function toContractIntelligenceView(
  contracts: ContractIntelligence
): ContractIntelligenceView {
  return {
    contracts_created: contracts.contractsCreated,
    contracts_completed: contracts.contractsCompleted,
    completion_rate: contracts.completionRate,
    average_contract_value: contracts.averageContractValue,
    summary: contracts.summary,
  };
}

export function toTrustIntelligenceView(trust: TrustIntelligence): TrustIntelligenceView {
  return {
    trust_score: trust.trustScore,
    dispute_rate: trust.disputeRate,
    complaint_rate: trust.complaintRate,
    reputation_signal: trust.reputationSignal,
    summary: trust.summary,
  };
}

export function toRegionalSegmentView(segment: RegionalSegment): RegionalSegmentView {
  return {
    region: segment.region,
    activity_volume: segment.activityVolume,
    growth_percent: segment.growthPercent,
    opportunity_score: segment.opportunityScore,
  };
}

export function toGeographicIntelligenceView(
  geography: GeographicIntelligence
): GeographicIntelligenceView {
  return {
    top_regions: geography.topRegions.map(toRegionalSegmentView),
    regional_growth: geography.regionalGrowth.map(toDistributionEntryView),
    regional_opportunities: geography.regionalOpportunities,
    summary: geography.summary,
  };
}

export function toOperationalIntelligenceView(
  operations: OperationalIntelligence
): OperationalIntelligenceView {
  return {
    execution_health: operations.executionHealth,
    escrow_health: operations.escrowHealth,
    issue_volume: operations.issueVolume,
    operational_efficiency: operations.operationalEfficiency,
    summary: operations.summary,
  };
}

export function toGrowthDriverView(driver: GrowthDriver): GrowthDriverView {
  return {
    category: driver.category,
    driver: driver.driver,
    strength: driver.strength,
    summary: driver.summary,
  };
}

export function toGrowthDriversView(drivers: GrowthDrivers): GrowthDriversView {
  return {
    strongest_growth_drivers: drivers.strongestGrowthDrivers.map(toGrowthDriverView),
    strongest_adoption_drivers: drivers.strongestAdoptionDrivers.map(toGrowthDriverView),
    strongest_trust_drivers: drivers.strongestTrustDrivers.map(toGrowthDriverView),
    summary: drivers.summary,
  };
}

export function toExecutiveInsightView(insight: ExecutiveInsight): ExecutiveInsightView {
  return {
    category: insight.category,
    insight: insight.insight,
    rationale: insight.rationale,
  };
}

export function toExecutiveInsightsView(insights: ExecutiveInsights): ExecutiveInsightsView {
  return {
    whats_working: insights.whatsWorking.map(toExecutiveInsightView),
    whats_weakening: insights.whatsWeakening.map(toExecutiveInsightView),
    requires_attention: insights.requiresAttention.map(toExecutiveInsightView),
    should_be_scaled: insights.shouldBeScaled.map(toExecutiveInsightView),
    summary: insights.summary,
  };
}

export function toBusinessIntelligenceScoreView(
  score: BusinessIntelligenceScore
): BusinessIntelligenceScoreView {
  return {
    score: score.score,
    marketplace_weight: score.marketplaceWeight,
    revenue_weight: score.revenueWeight,
    users_weight: score.usersWeight,
    contracts_weight: score.contractsWeight,
    trust_weight: score.trustWeight,
    operations_weight: score.operationsWeight,
    summary: score.summary,
  };
}

export function toBusinessIntelligenceCenterView(
  center: BusinessIntelligenceCenter
): BusinessIntelligenceCenterView {
  return {
    overview: toBusinessOverviewView(center.overview),
    marketplace: toMarketplaceIntelligenceSectionView(center.marketplace),
    revenue: toRevenueIntelligenceView(center.revenue),
    users: toUserIntelligenceView(center.users),
    contracts: toContractIntelligenceView(center.contracts),
    trust: toTrustIntelligenceView(center.trust),
    geography: toGeographicIntelligenceView(center.geography),
    operations: toOperationalIntelligenceView(center.operations),
    growth_drivers: toGrowthDriversView(center.growthDrivers),
    insights: toExecutiveInsightsView(center.insights),
    business_score: toBusinessIntelligenceScoreView(center.businessScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
