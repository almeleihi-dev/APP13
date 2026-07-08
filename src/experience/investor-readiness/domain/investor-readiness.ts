import { formatMinorAmount } from "../../../experience/format.js";
import {
  buildExecutiveCommandCenterSnapshot,
} from "../../executive-command-center/domain/executive-command-center.js";
import {
  buildLaunchSimulationSnapshot,
  findScenarioSimulation,
  type LaunchSimulationRawSnapshot,
  type LaunchSimulationSnapshot,
  type ScenarioSimulation,
  type SimulationLevel,
} from "../../launch-simulation/domain/launch-simulation.js";

export interface InvestorReadinessRawSnapshot {
  launchRaw: LaunchSimulationRawSnapshot;
}

export type RiskSeverity = "low" | "medium" | "high";

export type RevenueScaleLevel = "100k" | "1m" | "10m";

export type FundingStage =
  | "bootstrap"
  | "angel"
  | "seed"
  | "series_a"
  | "strategic_partnership";

export type PartnershipTarget =
  | "government"
  | "insurance"
  | "banking"
  | "workforce_development"
  | "enterprise_partners";

export interface InvestmentOverview {
  headline: string;
  executiveHealthScore: number;
  releaseReadinessScore: number;
  marketplaceHealthScore: number;
  simulationScore: number;
  trustScore: number;
  financialScore: number;
  summary: string;
}

export interface MarketOpportunity {
  demandGrowthPercent: number;
  supplyGrowthPercent: number;
  opportunityCount: number;
  demandSupplyBalance: number;
  estimatedAddressableActivityVolumeMinor: number;
  estimatedAddressableActivityVolumeLabel: string;
  summary: string;
}

export interface RevenueScaleProjection {
  level: RevenueScaleLevel;
  targetUsers: number;
  projectedRevenueMinor: number;
  projectedRevenueLabel: string;
  projectedEscrowVolumeMinor: number;
  projectedEscrowVolumeLabel: string;
  projectedTransactionVolumeMinor: number;
  projectedTransactionVolumeLabel: string;
  platformFeeGrowthPercent: number;
}

export interface RevenuePotential {
  currentPlatformRevenueMinor: number;
  currentPlatformRevenueLabel: string;
  currencyCode: string;
  projections: RevenueScaleProjection[];
  summary: string;
}

export interface ScaleReadiness {
  launchReadinessScore: number;
  operationalReadinessScore: number;
  infrastructureReadinessScore: number;
  bottleneckExposureCount: number;
  simulationConfidenceScore: number;
  summary: string;
}

export interface RiskMatrixEntry {
  category: "operational" | "trust" | "financial" | "marketplace" | "growth";
  severity: RiskSeverity;
  label: string;
  message: string;
}

export interface RiskMatrix {
  entries: RiskMatrixEntry[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  summary: string;
}

export interface StrategicStrength {
  strengthCode: string;
  title: string;
  message: string;
  score: number;
}

export interface FundingStageReadiness {
  stage: FundingStage;
  readinessScore: number;
  supportingIndicators: string[];
  gaps: string[];
  nextActions: string[];
}

export interface FundingReadiness {
  stages: FundingStageReadiness[];
  recommendedStage: FundingStage;
  summary: string;
}

export interface PartnershipTargetReadiness {
  target: PartnershipTarget;
  readinessScore: number;
  integrationMaturity: "emerging" | "developing" | "mature";
  requiredActions: string[];
}

export interface PartnershipReadiness {
  targets: PartnershipTargetReadiness[];
  summary: string;
}

export interface InvestorReadinessScore {
  score: number;
  status: "investment_ready" | "partner_ready" | "developing" | "not_ready";
  executiveWeight: number;
  releaseWeight: number;
  marketplaceWeight: number;
  scaleWeight: number;
  financialWeight: number;
  summary: string;
}

export interface InvestorReadinessSnapshot {
  overview: InvestmentOverview;
  marketOpportunity: MarketOpportunity;
  revenuePotential: RevenuePotential;
  scaleReadiness: ScaleReadiness;
  riskMatrix: RiskMatrix;
  strengths: StrategicStrength[];
  fundingReadiness: FundingReadiness;
  partnershipReadiness: PartnershipReadiness;
  investorScore: InvestorReadinessScore;
  generatedAt: Date;
}

export interface InvestorReadinessCenter {
  overview: InvestmentOverview;
  marketOpportunity: MarketOpportunity;
  revenuePotential: RevenuePotential;
  scaleReadiness: ScaleReadiness;
  riskMatrix: RiskMatrix;
  strengths: StrategicStrength[];
  fundingReadiness: FundingReadiness;
  partnershipReadiness: PartnershipReadiness;
  investorScore: InvestorReadinessScore;
  generatedAt: Date;
}

export interface InvestmentOverviewView {
  headline: string;
  executive_health_score: number;
  release_readiness_score: number;
  marketplace_health_score: number;
  simulation_score: number;
  trust_score: number;
  financial_score: number;
  summary: string;
}

export interface MarketOpportunityView {
  demand_growth_percent: number;
  supply_growth_percent: number;
  opportunity_count: number;
  demand_supply_balance: number;
  estimated_addressable_activity_volume_minor: number;
  estimated_addressable_activity_volume_label: string;
  summary: string;
}

export interface RevenueScaleProjectionView {
  level: RevenueScaleLevel;
  target_users: number;
  projected_revenue_minor: number;
  projected_revenue_label: string;
  projected_escrow_volume_minor: number;
  projected_escrow_volume_label: string;
  projected_transaction_volume_minor: number;
  projected_transaction_volume_label: string;
  platform_fee_growth_percent: number;
}

export interface RevenuePotentialView {
  current_platform_revenue_minor: number;
  current_platform_revenue_label: string;
  currency_code: string;
  projections: RevenueScaleProjectionView[];
  summary: string;
}

export interface ScaleReadinessView {
  launch_readiness_score: number;
  operational_readiness_score: number;
  infrastructure_readiness_score: number;
  bottleneck_exposure_count: number;
  simulation_confidence_score: number;
  summary: string;
}

export interface RiskMatrixEntryView {
  category: RiskMatrixEntry["category"];
  severity: RiskSeverity;
  label: string;
  message: string;
}

export interface RiskMatrixView {
  entries: RiskMatrixEntryView[];
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  summary: string;
}

export interface StrategicStrengthView {
  strength_code: string;
  title: string;
  message: string;
  score: number;
}

export interface FundingStageReadinessView {
  stage: FundingStage;
  readiness_score: number;
  supporting_indicators: string[];
  gaps: string[];
  next_actions: string[];
}

export interface FundingReadinessView {
  stages: FundingStageReadinessView[];
  recommended_stage: FundingStage;
  summary: string;
}

export interface PartnershipTargetReadinessView {
  target: PartnershipTarget;
  readiness_score: number;
  integration_maturity: PartnershipTargetReadiness["integrationMaturity"];
  required_actions: string[];
}

export interface PartnershipReadinessView {
  targets: PartnershipTargetReadinessView[];
  summary: string;
}

export interface InvestorReadinessScoreView {
  score: number;
  status: InvestorReadinessScore["status"];
  executive_weight: number;
  release_weight: number;
  marketplace_weight: number;
  scale_weight: number;
  financial_weight: number;
  summary: string;
}

export interface InvestorReadinessCenterView {
  overview: InvestmentOverviewView;
  market_opportunity: MarketOpportunityView;
  revenue_potential: RevenuePotentialView;
  scale_readiness: ScaleReadinessView;
  risk_matrix: RiskMatrixView;
  strengths: StrategicStrengthView[];
  funding_readiness: FundingReadinessView;
  partnership_readiness: PartnershipReadinessView;
  investor_score: InvestorReadinessScoreView;
  generated_at: string;
}

const REVENUE_SCALE_LEVELS: RevenueScaleLevel[] = ["100k", "1m", "10m"];

const REVENUE_LEVEL_MAP: Record<RevenueScaleLevel, SimulationLevel> = {
  "100k": "100k",
  "1m": "1m",
  "10m": "10m",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveRiskSeverity(score: number): RiskSeverity {
  if (score >= 70) return "low";
  if (score >= 45) return "medium";
  return "high";
}

function computeFinancialScore(input: {
  fundedMinor: number;
  platformFeeMinor: number;
  frozenEscrowCount: number;
  pendingFundingCount: number;
}): number {
  const liquidityScore = input.fundedMinor > 0 ? 70 : 40;
  const feeScore = input.platformFeeMinor > 0 ? 20 : 0;
  const penalty = input.frozenEscrowCount * 10 + input.pendingFundingCount * 5;

  return clamp(liquidityScore + feeScore - penalty, 0, 100);
}

function getExpectedScenario(
  simulation: LaunchSimulationSnapshot,
  level: SimulationLevel
): ScenarioSimulation | undefined {
  return findScenarioSimulation(simulation.scenarios, "expected", level);
}

export function buildInvestmentOverview(input: {
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): InvestmentOverview {
  const financialScore = computeFinancialScore({
    fundedMinor: input.executive.financial.fundedMinor,
    platformFeeMinor: input.executive.financial.platformFeeMinor,
    frozenEscrowCount: input.executive.financial.frozenEscrowCount,
    pendingFundingCount: input.executive.financial.pendingFundingCount,
  });

  return {
    headline: "Investor readiness center",
    executiveHealthScore: input.executive.overview.executiveHealthScore,
    releaseReadinessScore: input.executive.releaseReadiness.score,
    marketplaceHealthScore: input.executive.marketplace.healthScore,
    simulationScore: input.simulation.overview.executiveSimulationScore,
    trustScore: input.executive.trust.averageTrustScore,
    financialScore,
    summary: `Investment overview with executive health ${input.executive.overview.executiveHealthScore}, release readiness ${input.executive.releaseReadiness.score}, and simulation score ${input.simulation.overview.executiveSimulationScore}.`,
  };
}

export function buildMarketOpportunity(input: {
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): MarketOpportunity {
  const analytics = input.simulation.baseline;
  const expected1m = getExpectedScenario(input.simulation, "1m");
  const demandGrowthPercent = clamp(
    Math.round(
      ((expected1m?.marketplace.dailyRequests ?? analytics.dailyRequests) /
        Math.max(1, analytics.dailyRequests) -
        1) *
        100
    ),
    0,
    10_000
  );
  const supplyGrowthPercent = clamp(
    Math.round(
      ((expected1m?.marketplace.providerDemandRatio ?? analytics.providerDemandRatio) > 0
        ? 100 / Math.max(0.1, expected1m?.marketplace.providerDemandRatio ?? 1)
        : 100) - 100
    ),
    0,
    10_000
  );

  return {
    demandGrowthPercent,
    supplyGrowthPercent,
    opportunityCount: input.executive.marketplace.opportunityCount,
    demandSupplyBalance: expected1m?.marketplace.providerDemandRatio ?? analytics.providerDemandRatio,
    estimatedAddressableActivityVolumeMinor:
      expected1m?.financial.dailyContractValueMinor ?? analytics.averageContractValueMinor,
    estimatedAddressableActivityVolumeLabel: formatMinorAmount(
      expected1m?.financial.dailyContractValueMinor ?? analytics.averageContractValueMinor,
      analytics.currencyCode
    ),
    summary: `${demandGrowthPercent}% projected demand growth with ${input.executive.marketplace.opportunityCount} active marketplace opportunities.`,
  };
}

export function buildRevenueScaleProjection(input: {
  level: RevenueScaleLevel;
  simulation: LaunchSimulationSnapshot;
}): RevenueScaleProjection {
  const scenario = getExpectedScenario(input.simulation, REVENUE_LEVEL_MAP[input.level]);
  const baseline = input.simulation.baseline;
  const currentRevenue = baseline.averageContractValueMinor * baseline.dailyContracts;
  const projectedRevenueMinor = scenario?.financial.platformFeeVolumeMinor ?? 0;
  const growthPercent =
    currentRevenue > 0
      ? Math.round(((projectedRevenueMinor - currentRevenue) / currentRevenue) * 100)
      : 0;

  return {
    level: input.level,
    targetUsers: scenario?.targetUsers ?? 0,
    projectedRevenueMinor,
    projectedRevenueLabel: formatMinorAmount(projectedRevenueMinor, baseline.currencyCode),
    projectedEscrowVolumeMinor: scenario?.financial.escrowVolumeMinor ?? 0,
    projectedEscrowVolumeLabel: formatMinorAmount(
      scenario?.financial.escrowVolumeMinor ?? 0,
      baseline.currencyCode
    ),
    projectedTransactionVolumeMinor: scenario?.financial.dailyContractValueMinor ?? 0,
    projectedTransactionVolumeLabel: formatMinorAmount(
      scenario?.financial.dailyContractValueMinor ?? 0,
      baseline.currencyCode
    ),
    platformFeeGrowthPercent: growthPercent,
  };
}

export function buildRevenuePotential(input: {
  simulation: LaunchSimulationSnapshot;
}): RevenuePotential {
  const baseline = input.simulation.baseline;
  const currentPlatformRevenueMinor = Math.round(
    baseline.averageContractValueMinor * baseline.dailyContracts * (baseline.platformFeeRatePercent / 100)
  );
  const projections = REVENUE_SCALE_LEVELS.map((level) =>
    buildRevenueScaleProjection({ level, simulation: input.simulation })
  );

  return {
    currentPlatformRevenueMinor,
    currentPlatformRevenueLabel: formatMinorAmount(
      currentPlatformRevenueMinor,
      baseline.currencyCode
    ),
    currencyCode: baseline.currencyCode,
    projections,
    summary: `Current platform revenue ${formatMinorAmount(currentPlatformRevenueMinor, baseline.currencyCode)} with projections through 10m users.`,
  };
}

export function buildScaleReadiness(input: {
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): ScaleReadiness {
  const expected1m = getExpectedScenario(input.simulation, "1m");
  const criticalBottlenecks = input.simulation.bottlenecks.filter(
    (entry) => entry.severity === "high" || entry.severity === "critical"
  ).length;

  return {
    launchReadinessScore: input.executive.releaseReadiness.score,
    operationalReadinessScore: input.simulation.baseline.operationalHealthScore,
    infrastructureReadinessScore: expected1m?.simulationScore ?? 0,
    bottleneckExposureCount: criticalBottlenecks,
    simulationConfidenceScore: expected1m?.simulationScore ?? input.simulation.overview.executiveSimulationScore,
    summary: `Scale readiness with launch ${input.executive.releaseReadiness.score}, operational ${input.simulation.baseline.operationalHealthScore}, and ${criticalBottlenecks} critical bottlenecks at 1m expected scale.`,
  };
}

export function buildRiskMatrix(input: {
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): RiskMatrix {
  const entries: RiskMatrixEntry[] = [
    {
      category: "operational",
      severity: deriveRiskSeverity(input.simulation.baseline.operationalHealthScore),
      label: "Operational execution",
      message: `${input.executive.blockers.length} executive blockers and ${input.executive.warnings.length} warnings active.`,
    },
    {
      category: "trust",
      severity: deriveRiskSeverity(input.executive.trust.averageTrustScore),
      label: "Trust and reputation",
      message: `Average trust score ${input.executive.trust.averageTrustScore} with ${input.executive.trust.lowTrustProviderCount} low-trust providers.`,
    },
    {
      category: "financial",
      severity: deriveRiskSeverity(
        computeFinancialScore({
          fundedMinor: input.executive.financial.fundedMinor,
          platformFeeMinor: input.executive.financial.platformFeeMinor,
          frozenEscrowCount: input.executive.financial.frozenEscrowCount,
          pendingFundingCount: input.executive.financial.pendingFundingCount,
        })
      ),
      label: "Financial and escrow",
      message: input.executive.financial.summary,
    },
    {
      category: "marketplace",
      severity: deriveRiskSeverity(input.executive.marketplace.healthScore),
      label: "Marketplace balance",
      message: input.executive.marketplace.summary,
    },
    {
      category: "growth",
      severity: deriveRiskSeverity(input.simulation.overview.executiveSimulationScore),
      label: "Growth simulation",
      message: input.simulation.overview.summary,
    },
  ];

  return {
    entries,
    highRiskCount: entries.filter((entry) => entry.severity === "high").length,
    mediumRiskCount: entries.filter((entry) => entry.severity === "medium").length,
    lowRiskCount: entries.filter((entry) => entry.severity === "low").length,
    summary: `${entries.filter((entry) => entry.severity === "high").length} high-risk categories across operational, trust, financial, marketplace, and growth dimensions.`,
  };
}

export function buildStrategicStrengths(input: {
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): StrategicStrength[] {
  const strengths: StrategicStrength[] = [];

  strengths.push({
    strengthCode: "trust-infrastructure",
    title: "Trust infrastructure",
    message: `Live trust scoring across ${input.executive.trust.providersWithScores} providers with ${input.executive.trust.trustEventsLast7Days} events in the last 7 days.`,
    score: input.executive.trust.averageTrustScore,
  });

  strengths.push({
    strengthCode: "escrow-protection",
    title: "Escrow protection",
    message: `${input.executive.financial.fundedLabel} funded with controlled release mechanics.`,
    score: input.executive.financial.frozenEscrowCount === 0 ? 90 : 70,
  });

  strengths.push({
    strengthCode: "marketplace-intelligence",
    title: "Marketplace intelligence",
    message: input.executive.marketplace.summary,
    score: input.executive.marketplace.healthScore,
  });

  strengths.push({
    strengthCode: "execution-controls",
    title: "Execution controls",
    message: `${input.executive.releaseReadiness.readyAreas} of ${input.executive.releaseReadiness.readyAreas + input.executive.releaseReadiness.attentionAreas + input.executive.releaseReadiness.blockedAreas} readiness areas are launch-ready.`,
    score: input.executive.releaseReadiness.score,
  });

  strengths.push({
    strengthCode: "simulation-capability",
    title: "Simulation capability",
    message: input.simulation.overview.summary,
    score: input.simulation.overview.executiveSimulationScore,
  });

  for (const strength of input.executive.strengths.slice(0, 3)) {
    strengths.push({
      strengthCode: `operational-${strength.code}`,
      title: strength.label,
      message: strength.message,
      score: strength.score,
    });
  }

  return strengths.sort((left, right) => right.score - left.score);
}

function buildFundingStageReadiness(input: {
  stage: FundingStage;
  threshold: number;
  overview: InvestmentOverview;
  scaleReadiness: ScaleReadiness;
  riskMatrix: RiskMatrix;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
}): FundingStageReadiness {
  const composite = Math.round(
    input.overview.releaseReadinessScore * 0.25 +
      input.overview.marketplaceHealthScore * 0.2 +
      input.scaleReadiness.simulationConfidenceScore * 0.25 +
      input.overview.financialScore * 0.2 +
      input.overview.trustScore * 0.1
  );
  const readinessScore = clamp(composite, 0, 100);
  const supportingIndicators: string[] = [];
  const gaps: string[] = [];
  const nextActions: string[] = [];

  if (input.overview.releaseReadinessScore >= input.threshold) {
    supportingIndicators.push("Release readiness meets stage threshold");
  } else {
    gaps.push("Release readiness below stage threshold");
    nextActions.push("Close remaining launch readiness gaps");
  }

  if (input.scaleReadiness.bottleneckExposureCount === 0) {
    supportingIndicators.push("No critical scale bottlenecks detected");
  } else {
    gaps.push(`${input.scaleReadiness.bottleneckExposureCount} critical bottlenecks at target scale`);
    nextActions.push("Resolve simulation bottlenecks before fundraising close");
  }

  if (input.riskMatrix.highRiskCount <= 1) {
    supportingIndicators.push("Risk matrix within acceptable bounds");
  } else {
    gaps.push(`${input.riskMatrix.highRiskCount} high-risk categories`);
    nextActions.push("Reduce high-risk categories in the investor risk matrix");
  }

  if (input.executive.financial.fundedMinor > 0) {
    supportingIndicators.push("Platform revenue and escrow activity validated");
  }

  if (readinessScore >= input.threshold && nextActions.length === 0) {
    nextActions.push(`Proceed with ${input.stage.replace("_", " ")} investor conversations`);
  }

  return {
    stage: input.stage,
    readinessScore,
    supportingIndicators,
    gaps,
    nextActions,
  };
}

export function buildFundingReadiness(input: {
  overview: InvestmentOverview;
  scaleReadiness: ScaleReadiness;
  riskMatrix: RiskMatrix;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
}): FundingReadiness {
  const stages: FundingStageReadiness[] = [
    buildFundingStageReadiness({ stage: "bootstrap", threshold: 40, ...input }),
    buildFundingStageReadiness({ stage: "angel", threshold: 55, ...input }),
    buildFundingStageReadiness({ stage: "seed", threshold: 65, ...input }),
    buildFundingStageReadiness({ stage: "series_a", threshold: 75, ...input }),
    buildFundingStageReadiness({
      stage: "strategic_partnership",
      threshold: 70,
      ...input,
    }),
  ];

  const recommendedStage =
    stages.find((entry) => entry.readinessScore >= 75)?.stage ??
    stages.find((entry) => entry.readinessScore >= 65)?.stage ??
    stages.find((entry) => entry.readinessScore >= 55)?.stage ??
    "bootstrap";

  return {
    stages,
    recommendedStage,
    summary: `Funding readiness recommends ${recommendedStage.replace("_", " ")} conversations based on deterministic stage scoring.`,
  };
}

function deriveIntegrationMaturity(
  score: number
): PartnershipTargetReadiness["integrationMaturity"] {
  if (score >= 75) return "mature";
  if (score >= 55) return "developing";
  return "emerging";
}

export function buildPartnershipReadiness(input: {
  overview: InvestmentOverview;
  scaleReadiness: ScaleReadiness;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): PartnershipReadiness {
  const governmentScore = clamp(
    Math.round(
      input.overview.releaseReadinessScore * 0.35 +
        input.scaleReadiness.simulationConfidenceScore * 0.35 +
        input.overview.trustScore * 0.3
    ),
    0,
    100
  );
  const insuranceScore = clamp(
    Math.round(
      input.overview.trustScore * 0.35 +
        input.overview.financialScore * 0.35 +
        (input.executive.financial.frozenEscrowCount === 0 ? 30 : 10)
    ),
    0,
    100
  );
  const bankingScore = clamp(
    Math.round(input.overview.financialScore * 0.5 + input.overview.trustScore * 0.3 + 20),
    0,
    100
  );
  const workforceScore = clamp(
    Math.round(
      input.executive.marketplace.healthScore * 0.4 +
        input.simulation.baseline.activeProviders * 5 +
        20
    ),
    0,
    100
  );
  const enterpriseScore = clamp(
    Math.round(
      input.overview.executiveHealthScore * 0.35 +
        input.scaleReadiness.operationalReadinessScore * 0.35 +
        input.overview.marketplaceHealthScore * 0.3
    ),
    0,
    100
  );

  const targets: PartnershipTargetReadiness[] = [
    {
      target: "government",
      readinessScore: governmentScore,
      integrationMaturity: deriveIntegrationMaturity(governmentScore),
      requiredActions:
        governmentScore >= 70
          ? ["Prepare compliance and audit package for public-sector review"]
          : ["Complete release readiness and simulation confidence improvements"],
    },
    {
      target: "insurance",
      readinessScore: insuranceScore,
      integrationMaturity: deriveIntegrationMaturity(insuranceScore),
      requiredActions:
        insuranceScore >= 70
          ? ["Document escrow and dispute resolution controls for underwriters"]
          : ["Reduce trust and financial risk indicators before insurer review"],
    },
    {
      target: "banking",
      readinessScore: bankingScore,
      integrationMaturity: deriveIntegrationMaturity(bankingScore),
      requiredActions:
        bankingScore >= 70
          ? ["Package ledger, escrow, and settlement metrics for banking partners"]
          : ["Strengthen financial controls and escrow liquidity metrics"],
    },
    {
      target: "workforce_development",
      readinessScore: workforceScore,
      integrationMaturity: deriveIntegrationMaturity(workforceScore),
      requiredActions:
        workforceScore >= 70
          ? ["Launch provider onboarding programs with workforce partners"]
          : ["Expand provider supply and marketplace action coverage"],
    },
    {
      target: "enterprise_partners",
      readinessScore: enterpriseScore,
      integrationMaturity: deriveIntegrationMaturity(enterpriseScore),
      requiredActions:
        enterpriseScore >= 70
          ? ["Prepare enterprise integration and SLA documentation"]
          : ["Improve operational readiness and executive health metrics"],
    },
  ];

  return {
    targets,
    summary: `Partnership readiness assessed across ${targets.length} strategic partner categories with highest score ${Math.max(...targets.map((entry) => entry.readinessScore))}.`,
  };
}

export function computeInvestorReadinessScore(input: {
  overview: InvestmentOverview;
  scaleReadiness: ScaleReadiness;
}): InvestorReadinessScore {
  const executiveWeight = 20;
  const releaseWeight = 20;
  const marketplaceWeight = 15;
  const scaleWeight = 20;
  const financialWeight = 25;

  const score = Math.round(
    input.overview.executiveHealthScore * (executiveWeight / 100) +
      input.overview.releaseReadinessScore * (releaseWeight / 100) +
      input.overview.marketplaceHealthScore * (marketplaceWeight / 100) +
      input.scaleReadiness.simulationConfidenceScore * (scaleWeight / 100) +
      input.overview.financialScore * (financialWeight / 100)
  );

  let status: InvestorReadinessScore["status"] = "not_ready";
  if (score >= 80) status = "investment_ready";
  else if (score >= 70) status = "partner_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    executiveWeight,
    releaseWeight,
    marketplaceWeight,
    scaleWeight,
    financialWeight,
    summary: `Investor readiness score ${score} (${status.replace("_", " ")}) weighted across executive, release, marketplace, scale, and financial readiness.`,
  };
}

export function buildInvestorReadinessSnapshot(input: {
  raw: InvestorReadinessRawSnapshot;
  generatedAt?: Date;
}): InvestorReadinessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const simulation = buildLaunchSimulationSnapshot({
    raw: input.raw.launchRaw,
    generatedAt,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: input.raw.launchRaw.executiveRaw,
    generatedAt,
  });

  const overview = buildInvestmentOverview({ executive, simulation });
  const marketOpportunity = buildMarketOpportunity({ executive, simulation });
  const revenuePotential = buildRevenuePotential({ simulation });
  const scaleReadiness = buildScaleReadiness({ executive, simulation });
  const riskMatrix = buildRiskMatrix({ executive, simulation });
  const strengths = buildStrategicStrengths({ executive, simulation });
  const fundingReadiness = buildFundingReadiness({
    overview,
    scaleReadiness,
    riskMatrix,
    executive,
  });
  const partnershipReadiness = buildPartnershipReadiness({
    overview,
    scaleReadiness,
    executive,
    simulation,
  });
  const investorScore = computeInvestorReadinessScore({ overview, scaleReadiness });

  return {
    overview,
    marketOpportunity,
    revenuePotential,
    scaleReadiness,
    riskMatrix,
    strengths,
    fundingReadiness,
    partnershipReadiness,
    investorScore,
    generatedAt,
  };
}

export function buildInvestorReadinessCenter(input: {
  snapshot: InvestorReadinessSnapshot;
}): InvestorReadinessCenter {
  return {
    overview: input.snapshot.overview,
    marketOpportunity: input.snapshot.marketOpportunity,
    revenuePotential: input.snapshot.revenuePotential,
    scaleReadiness: input.snapshot.scaleReadiness,
    riskMatrix: input.snapshot.riskMatrix,
    strengths: input.snapshot.strengths,
    fundingReadiness: input.snapshot.fundingReadiness,
    partnershipReadiness: input.snapshot.partnershipReadiness,
    investorScore: input.snapshot.investorScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toInvestmentOverviewView(overview: InvestmentOverview): InvestmentOverviewView {
  return {
    headline: overview.headline,
    executive_health_score: overview.executiveHealthScore,
    release_readiness_score: overview.releaseReadinessScore,
    marketplace_health_score: overview.marketplaceHealthScore,
    simulation_score: overview.simulationScore,
    trust_score: overview.trustScore,
    financial_score: overview.financialScore,
    summary: overview.summary,
  };
}

export function toMarketOpportunityView(opportunity: MarketOpportunity): MarketOpportunityView {
  return {
    demand_growth_percent: opportunity.demandGrowthPercent,
    supply_growth_percent: opportunity.supplyGrowthPercent,
    opportunity_count: opportunity.opportunityCount,
    demand_supply_balance: opportunity.demandSupplyBalance,
    estimated_addressable_activity_volume_minor: opportunity.estimatedAddressableActivityVolumeMinor,
    estimated_addressable_activity_volume_label: opportunity.estimatedAddressableActivityVolumeLabel,
    summary: opportunity.summary,
  };
}

export function toRevenueScaleProjectionView(
  projection: RevenueScaleProjection
): RevenueScaleProjectionView {
  return {
    level: projection.level,
    target_users: projection.targetUsers,
    projected_revenue_minor: projection.projectedRevenueMinor,
    projected_revenue_label: projection.projectedRevenueLabel,
    projected_escrow_volume_minor: projection.projectedEscrowVolumeMinor,
    projected_escrow_volume_label: projection.projectedEscrowVolumeLabel,
    projected_transaction_volume_minor: projection.projectedTransactionVolumeMinor,
    projected_transaction_volume_label: projection.projectedTransactionVolumeLabel,
    platform_fee_growth_percent: projection.platformFeeGrowthPercent,
  };
}

export function toRevenuePotentialView(revenue: RevenuePotential): RevenuePotentialView {
  return {
    current_platform_revenue_minor: revenue.currentPlatformRevenueMinor,
    current_platform_revenue_label: revenue.currentPlatformRevenueLabel,
    currency_code: revenue.currencyCode,
    projections: revenue.projections.map(toRevenueScaleProjectionView),
    summary: revenue.summary,
  };
}

export function toScaleReadinessView(readiness: ScaleReadiness): ScaleReadinessView {
  return {
    launch_readiness_score: readiness.launchReadinessScore,
    operational_readiness_score: readiness.operationalReadinessScore,
    infrastructure_readiness_score: readiness.infrastructureReadinessScore,
    bottleneck_exposure_count: readiness.bottleneckExposureCount,
    simulation_confidence_score: readiness.simulationConfidenceScore,
    summary: readiness.summary,
  };
}

export function toRiskMatrixEntryView(entry: RiskMatrixEntry): RiskMatrixEntryView {
  return {
    category: entry.category,
    severity: entry.severity,
    label: entry.label,
    message: entry.message,
  };
}

export function toRiskMatrixView(matrix: RiskMatrix): RiskMatrixView {
  return {
    entries: matrix.entries.map(toRiskMatrixEntryView),
    high_risk_count: matrix.highRiskCount,
    medium_risk_count: matrix.mediumRiskCount,
    low_risk_count: matrix.lowRiskCount,
    summary: matrix.summary,
  };
}

export function toStrategicStrengthView(strength: StrategicStrength): StrategicStrengthView {
  return {
    strength_code: strength.strengthCode,
    title: strength.title,
    message: strength.message,
    score: strength.score,
  };
}

export function toFundingStageReadinessView(
  stage: FundingStageReadiness
): FundingStageReadinessView {
  return {
    stage: stage.stage,
    readiness_score: stage.readinessScore,
    supporting_indicators: stage.supportingIndicators,
    gaps: stage.gaps,
    next_actions: stage.nextActions,
  };
}

export function toFundingReadinessView(readiness: FundingReadiness): FundingReadinessView {
  return {
    stages: readiness.stages.map(toFundingStageReadinessView),
    recommended_stage: readiness.recommendedStage,
    summary: readiness.summary,
  };
}

export function toPartnershipTargetReadinessView(
  target: PartnershipTargetReadiness
): PartnershipTargetReadinessView {
  return {
    target: target.target,
    readiness_score: target.readinessScore,
    integration_maturity: target.integrationMaturity,
    required_actions: target.requiredActions,
  };
}

export function toPartnershipReadinessView(
  readiness: PartnershipReadiness
): PartnershipReadinessView {
  return {
    targets: readiness.targets.map(toPartnershipTargetReadinessView),
    summary: readiness.summary,
  };
}

export function toInvestorReadinessScoreView(score: InvestorReadinessScore): InvestorReadinessScoreView {
  return {
    score: score.score,
    status: score.status,
    executive_weight: score.executiveWeight,
    release_weight: score.releaseWeight,
    marketplace_weight: score.marketplaceWeight,
    scale_weight: score.scaleWeight,
    financial_weight: score.financialWeight,
    summary: score.summary,
  };
}

export function toInvestorReadinessCenterView(
  center: InvestorReadinessCenter
): InvestorReadinessCenterView {
  return {
    overview: toInvestmentOverviewView(center.overview),
    market_opportunity: toMarketOpportunityView(center.marketOpportunity),
    revenue_potential: toRevenuePotentialView(center.revenuePotential),
    scale_readiness: toScaleReadinessView(center.scaleReadiness),
    risk_matrix: toRiskMatrixView(center.riskMatrix),
    strengths: center.strengths.map(toStrategicStrengthView),
    funding_readiness: toFundingReadinessView(center.fundingReadiness),
    partnership_readiness: toPartnershipReadinessView(center.partnershipReadiness),
    investor_score: toInvestorReadinessScoreView(center.investorScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
