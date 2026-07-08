import { formatMinorAmount } from "../../../experience/format.js";
import {
  buildExecutiveCommandCenterSnapshot,
  computeExecutiveHealthScore,
  type ExecutiveCommandCenterRawSnapshot,
} from "../../executive-command-center/domain/executive-command-center.js";

export type SimulationScenario =
  | "conservative"
  | "expected"
  | "viral"
  | "government_partnership";

export type SimulationLevel = "1k" | "10k" | "100k" | "1m" | "10m";

export type BottleneckSeverity = "low" | "medium" | "high" | "critical";

export interface LaunchSimulationRawSnapshot {
  executiveRaw: ExecutiveCommandCenterRawSnapshot;
}

export interface SimulationBaseline {
  activeUsers: number;
  activeProviders: number;
  dailyRequests: number;
  dailyContracts: number;
  requestToContractRate: number;
  disputeRate: number;
  completionRate: number;
  averageContractValueMinor: number;
  platformFeeRatePercent: number;
  refundRate: number;
  frozenFundRate: number;
  providerDemandRatio: number;
  evidencePerContract: number;
  notificationsPerUser: number;
  conversationsPerContract: number;
  evaluationsPerContract: number;
  complaintsPerContract: number;
  apiRequestsPerUser: number;
  storageBytesPerEvidence: number;
  releaseReadinessScore: number;
  marketplaceHealthScore: number;
  trustHealthScore: number;
  operationalHealthScore: number;
  currencyCode: string;
}

export interface ScenarioMultiplier {
  growthRate: number;
  contractRate: number;
  disputeRate: number;
  providerSupply: number;
  infrastructureLoad: number;
}

export interface MarketplaceProjection {
  dailyRequests: number;
  dailyContracts: number;
  completedContracts: number;
  disputedContracts: number;
  providerDemandRatio: number;
  summary: string;
}

export interface FinancialProjection {
  dailyContractValueMinor: number;
  dailyContractValueLabel: string;
  escrowVolumeMinor: number;
  escrowVolumeLabel: string;
  platformFeeVolumeMinor: number;
  platformFeeVolumeLabel: string;
  refundsMinor: number;
  refundsLabel: string;
  frozenFundsMinor: number;
  frozenFundsLabel: string;
  summary: string;
}

export interface TrustProjection {
  evaluations: number;
  disputes: number;
  complaints: number;
  trustImpactScore: number;
  summary: string;
}

export interface OperationalProjection {
  evidenceUploads: number;
  notifications: number;
  conversations: number;
  supportWorkload: number;
  summary: string;
}

export interface InfrastructureProjection {
  apiRequestsPerDay: number;
  storageGrowthGb: number;
  databaseGrowthGb: number;
  bandwidthGrowthGb: number;
  summary: string;
}

export interface BottleneckAnalysis {
  code: string;
  category:
    | "evidence_storage"
    | "escrow_processing"
    | "dispute_resolution"
    | "trust_review"
    | "notification_throughput"
    | "database_growth"
    | "marketplace_supply";
  severity: BottleneckSeverity;
  reason: string;
  projectedThreshold: string;
  recommendedAction: string;
}

export interface SimulationRecommendation {
  priority: "critical" | "high" | "medium";
  action: string;
  rationale: string;
}

export interface SimulationCostProjection {
  storageCostMinor: number;
  storageCostLabel: string;
  bandwidthCostMinor: number;
  bandwidthCostLabel: string;
  computeCostMinor: number;
  computeCostLabel: string;
  supportCostMinor: number;
  supportCostLabel: string;
  totalDailyCostMinor: number;
  totalDailyCostLabel: string;
  totalMonthlyCostMinor: number;
  totalMonthlyCostLabel: string;
  currencyCode: string;
  summary: string;
}

export interface ScenarioSimulation {
  scenario: SimulationScenario;
  level: SimulationLevel;
  targetUsers: number;
  simulationScore: number;
  marketplace: MarketplaceProjection;
  financial: FinancialProjection;
  trust: TrustProjection;
  operations: OperationalProjection;
  infrastructure: InfrastructureProjection;
  bottlenecks: BottleneckAnalysis[];
  recommendations: SimulationRecommendation[];
  summary: string;
}

export interface LaunchSimulationOverview {
  headline: string;
  executiveSimulationScore: number;
  simulationStatus: "ready" | "caution" | "blocked";
  defaultScenario: SimulationScenario;
  baselineUsers: number;
  baselineProviders: number;
  scenarioCount: number;
  levelCount: number;
  summary: string;
}

export interface LaunchSimulationSnapshot {
  overview: LaunchSimulationOverview;
  baseline: SimulationBaseline;
  scenarios: ScenarioSimulation[];
  bottlenecks: BottleneckAnalysis[];
  costs: SimulationCostProjection;
  recommendations: SimulationRecommendation[];
  generatedAt: Date;
}

export interface LaunchSimulation {
  overview: LaunchSimulationOverview;
  baseline: SimulationBaseline;
  scenarios: ScenarioSimulation[];
  bottlenecks: BottleneckAnalysis[];
  costs: SimulationCostProjection;
  recommendations: SimulationRecommendation[];
  generatedAt: Date;
}

export interface LaunchSimulationOverviewView {
  headline: string;
  executive_simulation_score: number;
  simulation_status: LaunchSimulationOverview["simulationStatus"];
  default_scenario: SimulationScenario;
  baseline_users: number;
  baseline_providers: number;
  scenario_count: number;
  level_count: number;
  summary: string;
}

export interface MarketplaceProjectionView {
  daily_requests: number;
  daily_contracts: number;
  completed_contracts: number;
  disputed_contracts: number;
  provider_demand_ratio: number;
  summary: string;
}

export interface FinancialProjectionView {
  daily_contract_value_minor: number;
  daily_contract_value_label: string;
  escrow_volume_minor: number;
  escrow_volume_label: string;
  platform_fee_volume_minor: number;
  platform_fee_volume_label: string;
  refunds_minor: number;
  refunds_label: string;
  frozen_funds_minor: number;
  frozen_funds_label: string;
  summary: string;
}

export interface TrustProjectionView {
  evaluations: number;
  disputes: number;
  complaints: number;
  trust_impact_score: number;
  summary: string;
}

export interface OperationalProjectionView {
  evidence_uploads: number;
  notifications: number;
  conversations: number;
  support_workload: number;
  summary: string;
}

export interface InfrastructureProjectionView {
  api_requests_per_day: number;
  storage_growth_gb: number;
  database_growth_gb: number;
  bandwidth_growth_gb: number;
  summary: string;
}

export interface BottleneckAnalysisView {
  code: string;
  category: BottleneckAnalysis["category"];
  severity: BottleneckSeverity;
  reason: string;
  projected_threshold: string;
  recommended_action: string;
}

export interface SimulationRecommendationView {
  priority: SimulationRecommendation["priority"];
  action: string;
  rationale: string;
}

export interface SimulationCostProjectionView {
  storage_cost_minor: number;
  storage_cost_label: string;
  bandwidth_cost_minor: number;
  bandwidth_cost_label: string;
  compute_cost_minor: number;
  compute_cost_label: string;
  support_cost_minor: number;
  support_cost_label: string;
  total_daily_cost_minor: number;
  total_daily_cost_label: string;
  total_monthly_cost_minor: number;
  total_monthly_cost_label: string;
  currency_code: string;
  summary: string;
}

export interface ScenarioSimulationView {
  scenario: SimulationScenario;
  level: SimulationLevel;
  target_users: number;
  simulation_score: number;
  marketplace: MarketplaceProjectionView;
  financial: FinancialProjectionView;
  trust: TrustProjectionView;
  operations: OperationalProjectionView;
  infrastructure: InfrastructureProjectionView;
  bottlenecks: BottleneckAnalysisView[];
  recommendations: SimulationRecommendationView[];
  summary: string;
}

export interface LaunchSimulationView {
  overview: LaunchSimulationOverviewView;
  baseline: {
    active_users: number;
    active_providers: number;
    daily_requests: number;
    daily_contracts: number;
    request_to_contract_rate: number;
    release_readiness_score: number;
    marketplace_health_score: number;
    trust_health_score: number;
    operational_health_score: number;
    currency_code: string;
  };
  scenarios: ScenarioSimulationView[];
  bottlenecks: BottleneckAnalysisView[];
  costs: SimulationCostProjectionView;
  recommendations: SimulationRecommendationView[];
  generated_at: string;
}

export const SIMULATION_LEVELS: SimulationLevel[] = ["1k", "10k", "100k", "1m", "10m"];

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  "conservative",
  "expected",
  "viral",
  "government_partnership",
];

export const LEVEL_USER_COUNTS: Record<SimulationLevel, number> = {
  "1k": 1_000,
  "10k": 10_000,
  "100k": 100_000,
  "1m": 1_000_000,
  "10m": 10_000_000,
};

export const SCENARIO_MULTIPLIERS: Record<SimulationScenario, ScenarioMultiplier> = {
  conservative: {
    growthRate: 0.5,
    contractRate: 0.85,
    disputeRate: 0.9,
    providerSupply: 1.1,
    infrastructureLoad: 0.8,
  },
  expected: {
    growthRate: 1.0,
    contractRate: 1.0,
    disputeRate: 1.0,
    providerSupply: 1.0,
    infrastructureLoad: 1.0,
  },
  viral: {
    growthRate: 2.5,
    contractRate: 1.15,
    disputeRate: 1.2,
    providerSupply: 0.85,
    infrastructureLoad: 1.4,
  },
  government_partnership: {
    growthRate: 4.0,
    contractRate: 1.3,
    disputeRate: 1.1,
    providerSupply: 0.7,
    infrastructureLoad: 1.8,
  },
};

const DAILY_ACTIVE_USER_RATE = 0.15;
const PLATFORM_FEE_RATE_PERCENT = 5;
const STORAGE_COST_MINOR_PER_GB = 230;
const BANDWIDTH_COST_MINOR_PER_GB = 90;
const COMPUTE_COST_MINOR_PER_MILLION_REQUESTS = 350;
const SUPPORT_COST_MINOR_PER_TICKET = 1200;

function round(value: number): number {
  return Math.round(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildSimulationBaseline(input: {
  raw: LaunchSimulationRawSnapshot;
  generatedAt?: Date;
}): SimulationBaseline {
  const executiveSnapshot = buildExecutiveCommandCenterSnapshot({
    raw: input.raw.executiveRaw,
    generatedAt: input.generatedAt,
  });
  const analytics = input.raw.executiveRaw.marketplaceRaw.analyticsSnapshot;
  const activeUsers = Math.max(1, analytics.users.activeUsers.last30Days);
  const activeProviders = Math.max(1, analytics.users.activeProviders.last30Days);
  const dailyRequests = Math.max(1, round(analytics.requests.last7Days / 7));
  const dailyContracts = Math.max(
    1,
    round((analytics.offers.contractCreated / Math.max(1, analytics.offers.allTime)) * dailyRequests)
  );
  const requestToContractRate = dailyContracts / dailyRequests;
  const disputeRate = analytics.contracts.disputed / Math.max(1, analytics.contracts.allTime);
  const completionRate = analytics.contracts.completed / Math.max(1, analytics.contracts.allTime);
  const averageContractValueMinor = round(
    analytics.escrowAmounts.fundedMinor.allTime / Math.max(1, analytics.escrows.funded)
  );
  const providerDemandRatio = round(
    (dailyRequests / Math.max(1, executiveSnapshot.marketplace.availableProviders)) * 100
  ) / 100;
  const operationalHealthScore = computeExecutiveHealthScore({
    releaseScore: executiveSnapshot.releaseReadiness.score,
    marketplaceHealthScore: executiveSnapshot.marketplace.healthScore,
    averageTrustScore: executiveSnapshot.trust.averageTrustScore,
    systemHealthStatus: input.raw.executiveRaw.controlTowerRaw.platformOverview.summary.healthStatus,
  });

  return {
    activeUsers,
    activeProviders,
    dailyRequests,
    dailyContracts,
    requestToContractRate,
    disputeRate,
    completionRate,
    averageContractValueMinor,
    platformFeeRatePercent: PLATFORM_FEE_RATE_PERCENT,
    refundRate: 0.02,
    frozenFundRate: analytics.escrows.frozen / Math.max(1, analytics.escrows.allTime),
    providerDemandRatio,
    evidencePerContract: analytics.execution.totalEvidence / Math.max(1, analytics.contracts.allTime),
    notificationsPerUser: 3,
    conversationsPerContract: 2,
    evaluationsPerContract: 1,
    complaintsPerContract: analytics.issues.total / Math.max(1, analytics.contracts.allTime),
    apiRequestsPerUser: 25,
    storageBytesPerEvidence: 5_000_000,
    releaseReadinessScore: executiveSnapshot.releaseReadiness.score,
    marketplaceHealthScore: executiveSnapshot.marketplace.healthScore,
    trustHealthScore: executiveSnapshot.trust.averageTrustScore,
    operationalHealthScore,
    currencyCode: analytics.escrowAmounts.currencyCode,
  };
}

export function projectScenarioSimulation(input: {
  baseline: SimulationBaseline;
  scenario: SimulationScenario;
  level: SimulationLevel;
}): ScenarioSimulation {
  const multipliers = SCENARIO_MULTIPLIERS[input.scenario];
  const targetUsers = LEVEL_USER_COUNTS[input.level];
  const scaleRatio = targetUsers / Math.max(1, input.baseline.activeUsers);
  const dailyActiveUsers = round(targetUsers * DAILY_ACTIVE_USER_RATE * multipliers.growthRate);
  const dailyRequests = round(
    input.baseline.dailyRequests *
      scaleRatio *
      multipliers.growthRate *
      (dailyActiveUsers / Math.max(1, targetUsers * DAILY_ACTIVE_USER_RATE))
  );
  const dailyContracts = round(
    dailyRequests * input.baseline.requestToContractRate * multipliers.contractRate
  );
  const completedContracts = round(dailyContracts * input.baseline.completionRate);
  const disputedContracts = round(dailyContracts * input.baseline.disputeRate * multipliers.disputeRate);
  const projectedProviders = round(
    input.baseline.activeProviders * scaleRatio * multipliers.providerSupply
  );
  const providerDemandRatio =
    Math.round((dailyRequests / Math.max(1, projectedProviders)) * 100) / 100;

  const marketplace: MarketplaceProjection = {
    dailyRequests,
    dailyContracts,
    completedContracts,
    disputedContracts,
    providerDemandRatio,
    summary: `${dailyRequests} daily requests converting to ${dailyContracts} contracts with ${providerDemandRatio} requests per provider.`,
  };

  const dailyContractValueMinor = dailyContracts * input.baseline.averageContractValueMinor;
  const escrowVolumeMinor = round(dailyContractValueMinor * 0.95);
  const platformFeeVolumeMinor = round(
    dailyContractValueMinor * (input.baseline.platformFeeRatePercent / 100)
  );
  const refundsMinor = round(dailyContractValueMinor * input.baseline.refundRate);
  const frozenFundsMinor = round(escrowVolumeMinor * input.baseline.frozenFundRate * multipliers.disputeRate);

  const financial: FinancialProjection = {
    dailyContractValueMinor,
    dailyContractValueLabel: formatMinorAmount(
      dailyContractValueMinor,
      input.baseline.currencyCode
    ),
    escrowVolumeMinor,
    escrowVolumeLabel: formatMinorAmount(escrowVolumeMinor, input.baseline.currencyCode),
    platformFeeVolumeMinor,
    platformFeeVolumeLabel: formatMinorAmount(
      platformFeeVolumeMinor,
      input.baseline.currencyCode
    ),
    refundsMinor,
    refundsLabel: formatMinorAmount(refundsMinor, input.baseline.currencyCode),
    frozenFundsMinor,
    frozenFundsLabel: formatMinorAmount(frozenFundsMinor, input.baseline.currencyCode),
    summary: `${formatMinorAmount(dailyContractValueMinor, input.baseline.currencyCode)} daily contract value with ${formatMinorAmount(platformFeeVolumeMinor, input.baseline.currencyCode)} platform fees.`,
  };

  const evaluations = round(dailyContracts * input.baseline.evaluationsPerContract);
  const disputes = disputedContracts;
  const complaints = round(dailyContracts * input.baseline.complaintsPerContract * multipliers.disputeRate);
  const trustImpactScore = clamp(
    100 - round(disputes * 2 + complaints * 3),
    0,
    100
  );

  const trust: TrustProjection = {
    evaluations,
    disputes,
    complaints,
    trustImpactScore,
    summary: `${evaluations} evaluations, ${disputes} disputes, and ${complaints} complaints projected daily with trust impact ${trustImpactScore}.`,
  };

  const evidenceUploads = round(dailyContracts * input.baseline.evidencePerContract);
  const notifications = round(dailyActiveUsers * input.baseline.notificationsPerUser);
  const conversations = round(dailyContracts * input.baseline.conversationsPerContract);
  const supportWorkload = round(disputes + complaints + round(notifications * 0.01));

  const operations: OperationalProjection = {
    evidenceUploads,
    notifications,
    conversations,
    supportWorkload,
    summary: `${evidenceUploads} evidence uploads and ${supportWorkload} support workload units projected daily.`,
  };

  const apiRequestsPerDay = round(
    dailyActiveUsers * input.baseline.apiRequestsPerUser * multipliers.infrastructureLoad
  );
  const storageGrowthGb =
    Math.round(((evidenceUploads * input.baseline.storageBytesPerEvidence) / 1_000_000_000) * 100) /
    100;
  const databaseGrowthGb = Math.round(((dailyContracts * 0.25 + notifications * 0.002) / 1000) * 100) / 100;
  const bandwidthGrowthGb =
    Math.round(((storageGrowthGb * 1.5 + apiRequestsPerDay * 0.00005) * multipliers.infrastructureLoad) * 100) /
    100;

  const infrastructure: InfrastructureProjection = {
    apiRequestsPerDay,
    storageGrowthGb,
    databaseGrowthGb,
    bandwidthGrowthGb,
    summary: `${apiRequestsPerDay.toLocaleString()} API requests/day with ${storageGrowthGb} GB storage growth and ${bandwidthGrowthGb} GB bandwidth.`,
  };

  const bottlenecks = detectBottlenecks({
    scenario: input.scenario,
    level: input.level,
    marketplace,
    financial,
    trust,
    operations,
    infrastructure,
  });
  const simulationScore = computeScenarioSimulationScore({
    baseline: input.baseline,
    marketplace,
    trust,
    operations,
    infrastructure,
    bottleneckCount: bottlenecks.filter((entry) => entry.severity === "high" || entry.severity === "critical")
      .length,
  });
  const recommendations = deriveSimulationRecommendations({
    scenario: input.scenario,
    level: input.level,
    bottlenecks,
    simulationScore,
  });

  return {
    scenario: input.scenario,
    level: input.level,
    targetUsers,
    simulationScore,
    marketplace,
    financial,
    trust,
    operations,
    infrastructure,
    bottlenecks,
    recommendations,
    summary: `${input.scenario} simulation at ${input.level} projects ${dailyContracts} daily contracts with simulation score ${simulationScore}.`,
  };
}

export function detectBottlenecks(input: {
  scenario: SimulationScenario;
  level: SimulationLevel;
  marketplace: MarketplaceProjection;
  financial: FinancialProjection;
  trust: TrustProjection;
  operations: OperationalProjection;
  infrastructure: InfrastructureProjection;
}): BottleneckAnalysis[] {
  const bottlenecks: BottleneckAnalysis[] = [];

  if (input.infrastructure.storageGrowthGb >= 100) {
    bottlenecks.push({
      code: "evidence-storage-capacity",
      category: "evidence_storage",
      severity: input.infrastructure.storageGrowthGb >= 500 ? "critical" : "high",
      reason: `${input.infrastructure.storageGrowthGb} GB/day evidence storage growth exceeds comfortable headroom.`,
      projectedThreshold: "500 GB/day sustained growth",
      recommendedAction: "Pre-provision object storage tiers and lifecycle policies before launch week.",
    });
  }

  if (input.financial.escrowVolumeMinor >= 50_000_000) {
    bottlenecks.push({
      code: "escrow-processing-throughput",
      category: "escrow_processing",
      severity: input.financial.escrowVolumeMinor >= 250_000_000 ? "critical" : "high",
      reason: `${input.financial.escrowVolumeLabel} daily escrow volume stresses ledger processing.`,
      projectedThreshold: "$250,000/day escrow volume",
      recommendedAction: "Scale financial workers and add escrow queue sharding before peak onboarding.",
    });
  }

  if (input.trust.disputes >= 25) {
    bottlenecks.push({
      code: "dispute-resolution-capacity",
      category: "dispute_resolution",
      severity: input.trust.disputes >= 100 ? "critical" : "medium",
      reason: `${input.trust.disputes} projected daily disputes exceed current resolution staffing model.`,
      projectedThreshold: "100 disputes/day",
      recommendedAction: "Expand dispute triage playbooks and staffed resolution shifts.",
    });
  }

  if (input.trust.evaluations >= 200) {
    bottlenecks.push({
      code: "trust-review-workload",
      category: "trust_review",
      severity: input.trust.evaluations >= 1000 ? "high" : "medium",
      reason: `${input.trust.evaluations} daily trust evaluations increase review queue depth.`,
      projectedThreshold: "1,000 evaluations/day",
      recommendedAction: "Automate low-risk trust reviews and add reviewer capacity.",
    });
  }

  if (input.operations.notifications >= 100_000) {
    bottlenecks.push({
      code: "notification-throughput",
      category: "notification_throughput",
      severity: input.operations.notifications >= 500_000 ? "critical" : "high",
      reason: `${input.operations.notifications.toLocaleString()} daily notifications approach inbox throughput limits.`,
      projectedThreshold: "500,000 notifications/day",
      recommendedAction: "Shard notification delivery and add rate-aware batching.",
    });
  }

  if (input.infrastructure.databaseGrowthGb >= 5) {
    bottlenecks.push({
      code: "database-growth",
      category: "database_growth",
      severity: input.infrastructure.databaseGrowthGb >= 25 ? "critical" : "medium",
      reason: `${input.infrastructure.databaseGrowthGb} GB/day database growth requires capacity planning.`,
      projectedThreshold: "25 GB/day sustained growth",
      recommendedAction: "Plan read replicas, archival, and partition strategy for hot tables.",
    });
  }

  if (input.marketplace.providerDemandRatio >= 5) {
    bottlenecks.push({
      code: "provider-supply-gap",
      category: "marketplace_supply",
      severity: input.marketplace.providerDemandRatio >= 10 ? "high" : "medium",
      reason: `${input.marketplace.providerDemandRatio} requests per provider indicates supply pressure.`,
      projectedThreshold: "10 requests/provider/day",
      recommendedAction: "Accelerate provider onboarding and action catalog expansion.",
    });
  }

  if (bottlenecks.length === 0) {
    bottlenecks.push({
      code: "no-major-bottlenecks",
      category: "database_growth",
      severity: "low",
      reason: "No major deterministic bottlenecks detected at this scenario and scale level.",
      projectedThreshold: "Current projection envelope",
      recommendedAction: "Continue monitoring launch metrics against simulation thresholds.",
    });
  }

  return bottlenecks.sort((left, right) => severityRank(right.severity) - severityRank(left.severity));
}

function severityRank(severity: BottleneckSeverity): number {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

export function computeInfrastructureCapacityScore(
  infrastructure: InfrastructureProjection
): number {
  const apiScore = clamp(100 - Math.floor(infrastructure.apiRequestsPerDay / 100_000), 0, 100);
  const storageScore = clamp(100 - Math.floor(infrastructure.storageGrowthGb / 10), 0, 100);
  const databaseScore = clamp(100 - Math.floor(infrastructure.databaseGrowthGb * 4), 0, 100);
  const bandwidthScore = clamp(100 - Math.floor(infrastructure.bandwidthGrowthGb * 3), 0, 100);

  return Math.round((apiScore + storageScore + databaseScore + bandwidthScore) / 4);
}

export function computeScenarioSimulationScore(input: {
  baseline: SimulationBaseline;
  marketplace: MarketplaceProjection;
  trust: TrustProjection;
  operations: OperationalProjection;
  infrastructure: InfrastructureProjection;
  bottleneckCount: number;
}): number {
  const marketplaceScore = clamp(
    100 - Math.max(0, input.marketplace.providerDemandRatio - 1) * 10,
    0,
    100
  );
  const trustScore = input.trust.trustImpactScore;
  const operationalScore = clamp(100 - Math.floor(input.operations.supportWorkload / 50), 0, 100);
  const infrastructureScore = computeInfrastructureCapacityScore(input.infrastructure);
  const penalty = input.bottleneckCount * 8;

  return clamp(
    Math.round(
      input.baseline.releaseReadinessScore * 0.25 +
        input.baseline.marketplaceHealthScore * 0.2 +
        marketplaceScore * 0.15 +
        trustScore * 0.15 +
        operationalScore * 0.1 +
        infrastructureScore * 0.15 -
        penalty
    ),
    0,
    100
  );
}

export function computeExecutiveSimulationScore(input: {
  baseline: SimulationBaseline;
  scenarios: ScenarioSimulation[];
}): number {
  const expectedAt1m = input.scenarios.find(
    (entry) => entry.scenario === "expected" && entry.level === "1m"
  );
  const expectedAt100k = input.scenarios.find(
    (entry) => entry.scenario === "expected" && entry.level === "100k"
  );
  const anchor = expectedAt1m ?? expectedAt100k ?? input.scenarios[0];

  if (!anchor) {
    return input.baseline.operationalHealthScore;
  }

  return Math.round(
    input.baseline.releaseReadinessScore * 0.25 +
      input.baseline.marketplaceHealthScore * 0.2 +
      input.baseline.trustHealthScore * 0.15 +
      input.baseline.operationalHealthScore * 0.15 +
      anchor.simulationScore * 0.25
  );
}

export function deriveSimulationRecommendations(input: {
  scenario: SimulationScenario;
  level: SimulationLevel;
  bottlenecks: BottleneckAnalysis[];
  simulationScore: number;
}): SimulationRecommendation[] {
  const recommendations: SimulationRecommendation[] = [];

  for (const bottleneck of input.bottlenecks.filter(
    (entry) => entry.severity === "critical" || entry.severity === "high"
  )) {
    recommendations.push({
      priority: bottleneck.severity === "critical" ? "critical" : "high",
      action: bottleneck.recommendedAction,
      rationale: bottleneck.reason,
    });
  }

  if (input.simulationScore < 60) {
    recommendations.push({
      priority: "critical",
      action: "Delay launch until simulation score exceeds 60 at target scale",
      rationale: `${input.scenario} at ${input.level} projects simulation score ${input.simulationScore}.`,
    });
  } else if (input.simulationScore < 75) {
    recommendations.push({
      priority: "high",
      action: "Run staged rollout with capacity gates at this scale",
      rationale: `${input.scenario} at ${input.level} remains below preferred launch threshold of 75.`,
    });
  } else if (recommendations.length === 0) {
    recommendations.push({
      priority: "medium",
      action: "Proceed with monitored launch at this scenario and scale",
      rationale: `${input.scenario} at ${input.level} projects simulation score ${input.simulationScore} with manageable bottlenecks.`,
    });
  }

  return recommendations;
}

export function buildSimulationCostProjection(input: {
  baseline: SimulationBaseline;
  scenario: ScenarioSimulation;
}): SimulationCostProjection {
  const storageCostMinor = round(
    input.scenario.infrastructure.storageGrowthGb * STORAGE_COST_MINOR_PER_GB
  );
  const bandwidthCostMinor = round(
    input.scenario.infrastructure.bandwidthGrowthGb * BANDWIDTH_COST_MINOR_PER_GB
  );
  const computeCostMinor = round(
    (input.scenario.infrastructure.apiRequestsPerDay / 1_000_000) *
      COMPUTE_COST_MINOR_PER_MILLION_REQUESTS
  );
  const supportCostMinor = round(input.scenario.operations.supportWorkload * SUPPORT_COST_MINOR_PER_TICKET);
  const totalDailyCostMinor = storageCostMinor + bandwidthCostMinor + computeCostMinor + supportCostMinor;
  const totalMonthlyCostMinor = totalDailyCostMinor * 30;
  const currencyCode = input.baseline.currencyCode;

  return {
    storageCostMinor,
    storageCostLabel: formatMinorAmount(storageCostMinor, currencyCode),
    bandwidthCostMinor,
    bandwidthCostLabel: formatMinorAmount(bandwidthCostMinor, currencyCode),
    computeCostMinor,
    computeCostLabel: formatMinorAmount(computeCostMinor, currencyCode),
    supportCostMinor,
    supportCostLabel: formatMinorAmount(supportCostMinor, currencyCode),
    totalDailyCostMinor,
    totalDailyCostLabel: formatMinorAmount(totalDailyCostMinor, currencyCode),
    totalMonthlyCostMinor,
    totalMonthlyCostLabel: formatMinorAmount(totalMonthlyCostMinor, currencyCode),
    currencyCode,
    summary: `${formatMinorAmount(totalDailyCostMinor, currencyCode)}/day projected operating cost for ${input.scenario.scenario} at ${input.scenario.level}.`,
  };
}

export function deriveSimulationStatus(
  score: number
): LaunchSimulationOverview["simulationStatus"] {
  if (score >= 75) return "ready";
  if (score >= 55) return "caution";
  return "blocked";
}

export function buildLaunchSimulationOverview(input: {
  baseline: SimulationBaseline;
  scenarios: ScenarioSimulation[];
}): LaunchSimulationOverview {
  const executiveSimulationScore = computeExecutiveSimulationScore({
    baseline: input.baseline,
    scenarios: input.scenarios,
  });

  return {
    headline: "Launch simulation engine",
    executiveSimulationScore,
    simulationStatus: deriveSimulationStatus(executiveSimulationScore),
    defaultScenario: "expected",
    baselineUsers: input.baseline.activeUsers,
    baselineProviders: input.baseline.activeProviders,
    scenarioCount: SIMULATION_SCENARIOS.length,
    levelCount: SIMULATION_LEVELS.length,
    summary: `Executive simulation score ${executiveSimulationScore} across ${SIMULATION_SCENARIOS.length} scenarios and ${SIMULATION_LEVELS.length} scale levels from ${input.baseline.activeUsers} baseline users.`,
  };
}

export function buildLaunchSimulationSnapshot(input: {
  raw: LaunchSimulationRawSnapshot;
  generatedAt?: Date;
}): LaunchSimulationSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const baseline = buildSimulationBaseline({ raw: input.raw, generatedAt });
  const scenarios = SIMULATION_SCENARIOS.flatMap((scenario) =>
    SIMULATION_LEVELS.map((level) =>
      projectScenarioSimulation({ baseline, scenario, level })
    )
  );
  const overview = buildLaunchSimulationOverview({ baseline, scenarios });
  const anchorScenario =
    scenarios.find((entry) => entry.scenario === "expected" && entry.level === "1m") ??
    scenarios[0]!;
  const costs = buildSimulationCostProjection({ baseline, scenario: anchorScenario });
  const bottlenecks = scenarios
    .filter((entry) => entry.scenario === "expected")
    .flatMap((entry) => entry.bottlenecks)
    .filter(
      (entry, index, list) => list.findIndex((candidate) => candidate.code === entry.code) === index
    );
  const recommendations = scenarios
    .filter((entry) => entry.level === "1m" && entry.scenario === "expected")
    .flatMap((entry) => entry.recommendations);

  return {
    overview,
    baseline,
    scenarios,
    bottlenecks,
    costs,
    recommendations,
    generatedAt,
  };
}

export function buildLaunchSimulation(input: {
  snapshot: LaunchSimulationSnapshot;
}): LaunchSimulation {
  return {
    overview: input.snapshot.overview,
    baseline: input.snapshot.baseline,
    scenarios: input.snapshot.scenarios,
    bottlenecks: input.snapshot.bottlenecks,
    costs: input.snapshot.costs,
    recommendations: input.snapshot.recommendations,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function findScenarioSimulation(
  scenarios: ScenarioSimulation[],
  scenario: SimulationScenario,
  level: SimulationLevel
): ScenarioSimulation | undefined {
  return scenarios.find((entry) => entry.scenario === scenario && entry.level === level);
}

export function toMarketplaceProjectionView(
  projection: MarketplaceProjection
): MarketplaceProjectionView {
  return {
    daily_requests: projection.dailyRequests,
    daily_contracts: projection.dailyContracts,
    completed_contracts: projection.completedContracts,
    disputed_contracts: projection.disputedContracts,
    provider_demand_ratio: projection.providerDemandRatio,
    summary: projection.summary,
  };
}

export function toFinancialProjectionView(projection: FinancialProjection): FinancialProjectionView {
  return {
    daily_contract_value_minor: projection.dailyContractValueMinor,
    daily_contract_value_label: projection.dailyContractValueLabel,
    escrow_volume_minor: projection.escrowVolumeMinor,
    escrow_volume_label: projection.escrowVolumeLabel,
    platform_fee_volume_minor: projection.platformFeeVolumeMinor,
    platform_fee_volume_label: projection.platformFeeVolumeLabel,
    refunds_minor: projection.refundsMinor,
    refunds_label: projection.refundsLabel,
    frozen_funds_minor: projection.frozenFundsMinor,
    frozen_funds_label: projection.frozenFundsLabel,
    summary: projection.summary,
  };
}

export function toTrustProjectionView(projection: TrustProjection): TrustProjectionView {
  return {
    evaluations: projection.evaluations,
    disputes: projection.disputes,
    complaints: projection.complaints,
    trust_impact_score: projection.trustImpactScore,
    summary: projection.summary,
  };
}

export function toOperationalProjectionView(
  projection: OperationalProjection
): OperationalProjectionView {
  return {
    evidence_uploads: projection.evidenceUploads,
    notifications: projection.notifications,
    conversations: projection.conversations,
    support_workload: projection.supportWorkload,
    summary: projection.summary,
  };
}

export function toInfrastructureProjectionView(
  projection: InfrastructureProjection
): InfrastructureProjectionView {
  return {
    api_requests_per_day: projection.apiRequestsPerDay,
    storage_growth_gb: projection.storageGrowthGb,
    database_growth_gb: projection.databaseGrowthGb,
    bandwidth_growth_gb: projection.bandwidthGrowthGb,
    summary: projection.summary,
  };
}

export function toBottleneckAnalysisView(bottleneck: BottleneckAnalysis): BottleneckAnalysisView {
  return {
    code: bottleneck.code,
    category: bottleneck.category,
    severity: bottleneck.severity,
    reason: bottleneck.reason,
    projected_threshold: bottleneck.projectedThreshold,
    recommended_action: bottleneck.recommendedAction,
  };
}

export function toSimulationRecommendationView(
  recommendation: SimulationRecommendation
): SimulationRecommendationView {
  return {
    priority: recommendation.priority,
    action: recommendation.action,
    rationale: recommendation.rationale,
  };
}

export function toSimulationCostProjectionView(
  costs: SimulationCostProjection
): SimulationCostProjectionView {
  return {
    storage_cost_minor: costs.storageCostMinor,
    storage_cost_label: costs.storageCostLabel,
    bandwidth_cost_minor: costs.bandwidthCostMinor,
    bandwidth_cost_label: costs.bandwidthCostLabel,
    compute_cost_minor: costs.computeCostMinor,
    compute_cost_label: costs.computeCostLabel,
    support_cost_minor: costs.supportCostMinor,
    support_cost_label: costs.supportCostLabel,
    total_daily_cost_minor: costs.totalDailyCostMinor,
    total_daily_cost_label: costs.totalDailyCostLabel,
    total_monthly_cost_minor: costs.totalMonthlyCostMinor,
    total_monthly_cost_label: costs.totalMonthlyCostLabel,
    currency_code: costs.currencyCode,
    summary: costs.summary,
  };
}

export function toScenarioSimulationView(simulation: ScenarioSimulation): ScenarioSimulationView {
  return {
    scenario: simulation.scenario,
    level: simulation.level,
    target_users: simulation.targetUsers,
    simulation_score: simulation.simulationScore,
    marketplace: toMarketplaceProjectionView(simulation.marketplace),
    financial: toFinancialProjectionView(simulation.financial),
    trust: toTrustProjectionView(simulation.trust),
    operations: toOperationalProjectionView(simulation.operations),
    infrastructure: toInfrastructureProjectionView(simulation.infrastructure),
    bottlenecks: simulation.bottlenecks.map(toBottleneckAnalysisView),
    recommendations: simulation.recommendations.map(toSimulationRecommendationView),
    summary: simulation.summary,
  };
}

export function toLaunchSimulationOverviewView(
  overview: LaunchSimulationOverview
): LaunchSimulationOverviewView {
  return {
    headline: overview.headline,
    executive_simulation_score: overview.executiveSimulationScore,
    simulation_status: overview.simulationStatus,
    default_scenario: overview.defaultScenario,
    baseline_users: overview.baselineUsers,
    baseline_providers: overview.baselineProviders,
    scenario_count: overview.scenarioCount,
    level_count: overview.levelCount,
    summary: overview.summary,
  };
}

export function toLaunchSimulationView(simulation: LaunchSimulation): LaunchSimulationView {
  return {
    overview: toLaunchSimulationOverviewView(simulation.overview),
    baseline: {
      active_users: simulation.baseline.activeUsers,
      active_providers: simulation.baseline.activeProviders,
      daily_requests: simulation.baseline.dailyRequests,
      daily_contracts: simulation.baseline.dailyContracts,
      request_to_contract_rate: simulation.baseline.requestToContractRate,
      release_readiness_score: simulation.baseline.releaseReadinessScore,
      marketplace_health_score: simulation.baseline.marketplaceHealthScore,
      trust_health_score: simulation.baseline.trustHealthScore,
      operational_health_score: simulation.baseline.operationalHealthScore,
      currency_code: simulation.baseline.currencyCode,
    },
    scenarios: simulation.scenarios.map(toScenarioSimulationView),
    bottlenecks: simulation.bottlenecks.map(toBottleneckAnalysisView),
    costs: toSimulationCostProjectionView(simulation.costs),
    recommendations: simulation.recommendations.map(toSimulationRecommendationView),
    generated_at: simulation.generatedAt.toISOString(),
  };
}
