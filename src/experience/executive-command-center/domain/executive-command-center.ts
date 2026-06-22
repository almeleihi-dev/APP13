import type { PlatformHealthStatus } from "../../../operations/domain/admin-console.js";
import { formatMinorAmount } from "../../../experience/format.js";
import {
  buildFinancialMetrics,
  buildLiveFrameDistribution,
  buildPlatformControlTowerSnapshot,
  buildSystemHealthMetrics,
  type PlatformControlTowerRawSnapshot,
  type PlatformControlTowerSnapshot,
} from "../../platform-control-tower/domain/platform-control-tower.js";
import {
  buildMarketplaceIntelligenceSnapshot,
  type MarketplaceIntelligenceRawSnapshot,
  type MarketplaceIntelligenceSnapshot,
} from "../../marketplace-intelligence/domain/marketplace-intelligence.js";
import {
  buildReleaseReadinessCenterSnapshot,
  type LaunchBlocker,
  type LaunchReadinessStatus,
  type LaunchStrength,
  type LaunchWarning,
  type ReadinessSources,
  type RecommendedAction,
  type ReleaseReadinessCenterSnapshot,
} from "../../release-readiness/domain/release-readiness.js";

export interface ExecutiveCommandCenterRawSnapshot {
  readinessSources: ReadinessSources;
  marketplaceRaw: MarketplaceIntelligenceRawSnapshot;
  controlTowerRaw: PlatformControlTowerRawSnapshot;
}

export interface ExecutiveCommandCenterOverview {
  headline: string;
  executiveHealthScore: number;
  executiveStatus: "strong" | "stable" | "at_risk";
  releaseReadinessScore: number;
  marketplaceHealthScore: number;
  averageTrustScore: number;
  openOperationalBlockers: number;
  summary: string;
}

export interface ReleaseReadinessOverview {
  score: number;
  status: LaunchReadinessStatus;
  readyAreas: number;
  attentionAreas: number;
  blockedAreas: number;
  blockerCount: number;
  warningCount: number;
  strengthCount: number;
  summary: string;
}

export interface MarketplaceOverview {
  healthScore: number;
  healthStatus: MarketplaceIntelligenceSnapshot["health"]["healthStatus"];
  openRequests: number;
  availableProviders: number;
  offerToContractRatePercent: number;
  opportunityCount: number;
  summary: string;
}

export interface TrustReputationOverview {
  averageTrustScore: number;
  providersWithScores: number;
  lowTrustProviderCount: number;
  trustEventsLast7Days: number;
  topTierSharePercent: number;
  liveFrameSummary: string;
  summary: string;
}

export interface FinancialEscrowOverview {
  currencyCode: string;
  fundedMinor: number;
  fundedLabel: string;
  releasedMinor: number;
  releasedLabel: string;
  platformFeeMinor: number;
  platformFeeLabel: string;
  pendingFundingCount: number;
  frozenEscrowCount: number;
  summary: string;
}

export type OperationalItemCategory =
  | "release_readiness"
  | "operations"
  | "marketplace"
  | "financial";

export interface OperationalBlocker {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
}

export interface OperationalWarning {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
}

export interface OperationalStrength {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
  score: number;
}

export interface ExecutiveRecommendedAction {
  priority: RecommendedAction["priority"];
  action: string;
  rationale: string;
  source: OperationalItemCategory | "executive";
}

export interface ExecutiveCommandCenterSnapshot {
  overview: ExecutiveCommandCenterOverview;
  releaseReadiness: ReleaseReadinessOverview;
  marketplace: MarketplaceOverview;
  trust: TrustReputationOverview;
  financial: FinancialEscrowOverview;
  blockers: OperationalBlocker[];
  warnings: OperationalWarning[];
  strengths: OperationalStrength[];
  actions: ExecutiveRecommendedAction[];
  generatedAt: Date;
}

export interface ExecutiveCommandCenter {
  overview: ExecutiveCommandCenterOverview;
  releaseReadiness: ReleaseReadinessOverview;
  marketplace: MarketplaceOverview;
  trust: TrustReputationOverview;
  financial: FinancialEscrowOverview;
  blockers: OperationalBlocker[];
  warnings: OperationalWarning[];
  strengths: OperationalStrength[];
  actions: ExecutiveRecommendedAction[];
  generatedAt: Date;
}

export interface ExecutiveCommandCenterOverviewView {
  headline: string;
  executive_health_score: number;
  executive_status: ExecutiveCommandCenterOverview["executiveStatus"];
  release_readiness_score: number;
  marketplace_health_score: number;
  average_trust_score: number;
  open_operational_blockers: number;
  summary: string;
}

export interface ReleaseReadinessOverviewView {
  score: number;
  status: LaunchReadinessStatus;
  ready_areas: number;
  attention_areas: number;
  blocked_areas: number;
  blocker_count: number;
  warning_count: number;
  strength_count: number;
  summary: string;
}

export interface MarketplaceOverviewView {
  health_score: number;
  health_status: MarketplaceOverview["healthStatus"];
  open_requests: number;
  available_providers: number;
  offer_to_contract_rate_percent: number;
  opportunity_count: number;
  summary: string;
}

export interface TrustReputationOverviewView {
  average_trust_score: number;
  providers_with_scores: number;
  low_trust_provider_count: number;
  trust_events_last_7_days: number;
  top_tier_share_percent: number;
  live_frame_summary: string;
  summary: string;
}

export interface FinancialEscrowOverviewView {
  currency_code: string;
  funded_minor: number;
  funded_label: string;
  released_minor: number;
  released_label: string;
  platform_fee_minor: number;
  platform_fee_label: string;
  pending_funding_count: number;
  frozen_escrow_count: number;
  summary: string;
}

export interface OperationalBlockerView {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
}

export interface OperationalWarningView {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
}

export interface OperationalStrengthView {
  code: string;
  category: OperationalItemCategory;
  label: string;
  message: string;
  score: number;
}

export interface ExecutiveRecommendedActionView {
  priority: ExecutiveRecommendedAction["priority"];
  action: string;
  rationale: string;
  source: ExecutiveRecommendedAction["source"];
}

export interface ExecutiveCommandCenterView {
  overview: ExecutiveCommandCenterOverviewView;
  release_readiness: ReleaseReadinessOverviewView;
  marketplace: MarketplaceOverviewView;
  trust: TrustReputationOverviewView;
  financial: FinancialEscrowOverviewView;
  blockers: OperationalBlockerView[];
  warnings: OperationalWarningView[];
  strengths: OperationalStrengthView[];
  actions: ExecutiveRecommendedActionView[];
  generated_at: string;
}

function systemHealthScore(status: PlatformHealthStatus): number {
  if (status === "healthy") return 100;
  if (status === "attention") return 65;
  return 35;
}

export function computeExecutiveHealthScore(input: {
  releaseScore: number;
  marketplaceHealthScore: number;
  averageTrustScore: number;
  systemHealthStatus: PlatformHealthStatus;
}): number {
  return Math.round(
    input.releaseScore * 0.35 +
      input.marketplaceHealthScore * 0.25 +
      Math.min(100, input.averageTrustScore) * 0.2 +
      systemHealthScore(input.systemHealthStatus) * 0.2
  );
}

export function deriveExecutiveStatus(
  score: number
): ExecutiveCommandCenterOverview["executiveStatus"] {
  if (score >= 80) return "strong";
  if (score >= 55) return "stable";
  return "at_risk";
}

export function buildReleaseReadinessOverview(
  snapshot: ReleaseReadinessCenterSnapshot
): ReleaseReadinessOverview {
  return {
    score: snapshot.score.score,
    status: snapshot.score.status,
    readyAreas: snapshot.score.readyAreas,
    attentionAreas: snapshot.score.attentionAreas,
    blockedAreas: snapshot.score.blockedAreas,
    blockerCount: snapshot.blockers.length,
    warningCount: snapshot.warnings.length,
    strengthCount: snapshot.strengths.length,
    summary: snapshot.score.summary,
  };
}

export function buildMarketplaceOverview(
  snapshot: MarketplaceIntelligenceSnapshot
): MarketplaceOverview {
  return {
    healthScore: snapshot.health.healthScore,
    healthStatus: snapshot.health.healthStatus,
    openRequests: snapshot.demand.openRequests,
    availableProviders: snapshot.supply.availableNowProviders,
    offerToContractRatePercent: snapshot.health.offerToContractRate.ratePercent,
    opportunityCount: snapshot.opportunities.totalInsights,
    summary: snapshot.overview.summary,
  };
}

export function buildTrustReputationOverview(input: {
  controlTower: PlatformControlTowerSnapshot;
}): TrustReputationOverview {
  const liveFrame = buildLiveFrameDistribution({
    platformTrustContext: input.controlTower.platformTrustContext,
    trustMetrics: input.controlTower.analytics.trust,
  });
  const topTierSharePercent = liveFrame.tierDistribution[0]?.sharePercent ?? 0;

  return {
    averageTrustScore: input.controlTower.trust.averageTrustScore,
    providersWithScores: input.controlTower.trust.providersWithScores,
    lowTrustProviderCount: input.controlTower.trust.lowTrustProviderCount,
    trustEventsLast7Days: liveFrame.trustEventsLast7Days,
    topTierSharePercent,
    liveFrameSummary: liveFrame.summary,
    summary: `${input.controlTower.trust.summary} ${liveFrame.summary}`,
  };
}

export function buildFinancialEscrowOverview(input: {
  controlTower: PlatformControlTowerSnapshot;
}): FinancialEscrowOverview {
  const financial = buildFinancialMetrics(input.controlTower.analytics);
  const currencyCode = financial.revenue.currencyCode;
  const fundedMinor = financial.revenue.escrowFundedAmountMinor.allTime;
  const releasedMinor = financial.revenue.escrowReleasedAmountMinor.allTime;
  const platformFeeMinor = financial.revenue.platformFeeTotalMinor.allTime;

  return {
    currencyCode,
    fundedMinor,
    fundedLabel: formatMinorAmount(fundedMinor, currencyCode),
    releasedMinor,
    releasedLabel: formatMinorAmount(releasedMinor, currencyCode),
    platformFeeMinor,
    platformFeeLabel: formatMinorAmount(platformFeeMinor, currencyCode),
    pendingFundingCount: input.controlTower.platformOverview.escrow.pendingFundingCount,
    frozenEscrowCount: input.controlTower.analytics.escrow.frozenEscrows,
    summary: financial.summary,
  };
}

export function buildOperationalBlockers(input: {
  releaseReadiness: ReleaseReadinessCenterSnapshot;
  controlTower: PlatformControlTowerSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
}): OperationalBlocker[] {
  const blockers: OperationalBlocker[] = input.releaseReadiness.blockers.map((blocker) => ({
    code: blocker.code,
    category: "release_readiness" as const,
    label: blocker.label,
    message: blocker.message,
  }));

  const systemHealth = buildSystemHealthMetrics(input.controlTower.platformOverview);

  if (systemHealth.openIssues > 0) {
    blockers.push({
      code: "open-issues",
      category: "operations",
      label: "Open issues",
      message: `${systemHealth.openIssues} open issue${systemHealth.openIssues === 1 ? "" : "s"} require executive attention.`,
    });
  }

  if (systemHealth.frozenEscrows > 0) {
    blockers.push({
      code: "frozen-escrows",
      category: "financial",
      label: "Frozen escrows",
      message: `${systemHealth.frozenEscrows} escrow${systemHealth.frozenEscrows === 1 ? "" : "s"} frozen pending resolution.`,
    });
  }

  if (input.marketplace.health.healthStatus === "constrained") {
    blockers.push({
      code: "marketplace-constrained",
      category: "marketplace",
      label: "Marketplace constrained",
      message: input.marketplace.health.summary,
    });
  }

  return blockers;
}

export function buildOperationalWarnings(input: {
  releaseReadiness: ReleaseReadinessCenterSnapshot;
  controlTower: PlatformControlTowerSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
}): OperationalWarning[] {
  const warnings: OperationalWarning[] = input.releaseReadiness.warnings.map((warning) => ({
    code: warning.code,
    category: "release_readiness" as const,
    label: warning.label,
    message: warning.message,
  }));

  const systemHealth = buildSystemHealthMetrics(input.controlTower.platformOverview);

  if (systemHealth.healthStatus !== "healthy") {
    warnings.push({
      code: "platform-health-attention",
      category: "operations",
      label: "Platform health attention",
      message: systemHealth.summary,
    });
  }

  if (input.marketplace.health.healthStatus === "balanced") {
    warnings.push({
      code: "marketplace-balanced",
      category: "marketplace",
      label: "Marketplace balance",
      message: input.marketplace.health.summary,
    });
  }

  if (input.controlTower.trust.lowTrustProviderCount > 0) {
    warnings.push({
      code: "low-trust-providers",
      category: "operations",
      label: "Low-trust providers",
      message: `${input.controlTower.trust.lowTrustProviderCount} provider${input.controlTower.trust.lowTrustProviderCount === 1 ? "" : "s"} below trust threshold.`,
    });
  }

  return warnings;
}

export function buildOperationalStrengths(input: {
  releaseReadiness: ReleaseReadinessCenterSnapshot;
  controlTower: PlatformControlTowerSnapshot;
  marketplace: MarketplaceIntelligenceSnapshot;
}): OperationalStrength[] {
  const strengths: OperationalStrength[] = input.releaseReadiness.strengths.map((strength) => ({
    code: `readiness-${strength.areaCode}`,
    category: "release_readiness" as const,
    label: strength.label,
    message: strength.summary,
    score: strength.score,
  }));

  if (input.marketplace.health.healthStatus === "healthy") {
    strengths.push({
      code: "marketplace-healthy",
      category: "marketplace",
      label: "Healthy marketplace",
      message: input.marketplace.health.summary,
      score: input.marketplace.health.healthScore,
    });
  }

  if (input.controlTower.trust.averageTrustScore >= 70) {
    strengths.push({
      code: "trust-strong",
      category: "operations",
      label: "Strong platform trust",
      message: `Average trust score ${input.controlTower.trust.averageTrustScore} across ${input.controlTower.trust.providersWithScores} providers.`,
      score: input.controlTower.trust.averageTrustScore,
    });
  }

  const financial = buildFinancialEscrowOverview({ controlTower: input.controlTower });
  if (financial.fundedMinor > 0 && financial.frozenEscrowCount === 0) {
    strengths.push({
      code: "escrow-liquid",
      category: "financial",
      label: "Escrow liquidity healthy",
      message: `${financial.fundedLabel} funded with no frozen escrows.`,
      score: 90,
    });
  }

  return strengths.sort((left, right) => right.score - left.score);
}

export function deriveExecutiveRecommendedActions(input: {
  releaseReadiness: ReleaseReadinessCenterSnapshot;
  blockers: OperationalBlocker[];
  warnings: OperationalWarning[];
  overview: ExecutiveCommandCenterOverview;
}): ExecutiveRecommendedAction[] {
  const actions: ExecutiveRecommendedAction[] = input.releaseReadiness.actions.map((action) => ({
    priority: action.priority,
    action: action.action,
    rationale: action.rationale,
    source: "release_readiness" as const,
  }));

  for (const blocker of input.blockers.filter((entry) => entry.category !== "release_readiness")) {
    actions.push({
      priority: "critical",
      action: `Resolve ${blocker.label.toLowerCase()}`,
      rationale: blocker.message,
      source: blocker.category,
    });
  }

  for (const warning of input.warnings
    .filter((entry) => entry.category !== "release_readiness")
    .slice(0, 3)) {
    actions.push({
      priority: input.blockers.length > 0 ? "medium" : "high",
      action: `Review ${warning.label.toLowerCase()}`,
      rationale: warning.message,
      source: warning.category,
    });
  }

  if (input.overview.executiveStatus === "strong" && actions.length === 0) {
    actions.push({
      priority: "medium",
      action: "Proceed with executive launch review and staged rollout",
      rationale: input.overview.summary,
      source: "executive",
    });
  } else if (input.overview.executiveStatus === "at_risk") {
    actions.push({
      priority: "critical",
      action: "Convene executive review before any launch decision",
      rationale: `${input.blockers.length} operational blocker${input.blockers.length === 1 ? "" : "s"} and executive health score ${input.overview.executiveHealthScore}.`,
      source: "executive",
    });
  }

  return actions;
}

export function buildExecutiveCommandCenterOverview(input: {
  releaseReadiness: ReleaseReadinessOverview;
  marketplace: MarketplaceOverview;
  trust: TrustReputationOverview;
  systemHealthStatus: PlatformHealthStatus;
  blockerCount: number;
}): ExecutiveCommandCenterOverview {
  const executiveHealthScore = computeExecutiveHealthScore({
    releaseScore: input.releaseReadiness.score,
    marketplaceHealthScore: input.marketplace.healthScore,
    averageTrustScore: input.trust.averageTrustScore,
    systemHealthStatus: input.systemHealthStatus,
  });

  return {
    headline: "Executive command center",
    executiveHealthScore,
    executiveStatus: deriveExecutiveStatus(executiveHealthScore),
    releaseReadinessScore: input.releaseReadiness.score,
    marketplaceHealthScore: input.marketplace.healthScore,
    averageTrustScore: input.trust.averageTrustScore,
    openOperationalBlockers: input.blockerCount,
    summary: `Executive health ${executiveHealthScore} with release readiness ${input.releaseReadiness.score}, marketplace ${input.marketplace.healthScore}, and ${input.blockerCount} operational blocker${input.blockerCount === 1 ? "" : "s"}.`,
  };
}

export function buildExecutiveCommandCenterSnapshot(input: {
  raw: ExecutiveCommandCenterRawSnapshot;
  generatedAt?: Date;
}): ExecutiveCommandCenterSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const releaseReadinessSnapshot = buildReleaseReadinessCenterSnapshot({
    sources: input.raw.readinessSources,
    generatedAt,
  });
  const marketplaceSnapshot = buildMarketplaceIntelligenceSnapshot({
    raw: input.raw.marketplaceRaw,
    generatedAt,
  });
  const controlTowerSnapshot = buildPlatformControlTowerSnapshot({
    raw: input.raw.controlTowerRaw,
    generatedAt,
  });

  const releaseReadiness = buildReleaseReadinessOverview(releaseReadinessSnapshot);
  const marketplace = buildMarketplaceOverview(marketplaceSnapshot);
  const trust = buildTrustReputationOverview({ controlTower: controlTowerSnapshot });
  const financial = buildFinancialEscrowOverview({ controlTower: controlTowerSnapshot });
  const blockers = buildOperationalBlockers({
    releaseReadiness: releaseReadinessSnapshot,
    controlTower: controlTowerSnapshot,
    marketplace: marketplaceSnapshot,
  });
  const warnings = buildOperationalWarnings({
    releaseReadiness: releaseReadinessSnapshot,
    controlTower: controlTowerSnapshot,
    marketplace: marketplaceSnapshot,
  });
  const strengths = buildOperationalStrengths({
    releaseReadiness: releaseReadinessSnapshot,
    controlTower: controlTowerSnapshot,
    marketplace: marketplaceSnapshot,
  });
  const overview = buildExecutiveCommandCenterOverview({
    releaseReadiness,
    marketplace,
    trust,
    systemHealthStatus: controlTowerSnapshot.platformOverview.summary.healthStatus,
    blockerCount: blockers.length,
  });
  const actions = deriveExecutiveRecommendedActions({
    releaseReadiness: releaseReadinessSnapshot,
    blockers,
    warnings,
    overview,
  });

  return {
    overview,
    releaseReadiness,
    marketplace,
    trust,
    financial,
    blockers,
    warnings,
    strengths,
    actions,
    generatedAt,
  };
}

export function buildExecutiveCommandCenter(input: {
  snapshot: ExecutiveCommandCenterSnapshot;
}): ExecutiveCommandCenter {
  return {
    overview: input.snapshot.overview,
    releaseReadiness: input.snapshot.releaseReadiness,
    marketplace: input.snapshot.marketplace,
    trust: input.snapshot.trust,
    financial: input.snapshot.financial,
    blockers: input.snapshot.blockers,
    warnings: input.snapshot.warnings,
    strengths: input.snapshot.strengths,
    actions: input.snapshot.actions,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toExecutiveCommandCenterOverviewView(
  overview: ExecutiveCommandCenterOverview
): ExecutiveCommandCenterOverviewView {
  return {
    headline: overview.headline,
    executive_health_score: overview.executiveHealthScore,
    executive_status: overview.executiveStatus,
    release_readiness_score: overview.releaseReadinessScore,
    marketplace_health_score: overview.marketplaceHealthScore,
    average_trust_score: overview.averageTrustScore,
    open_operational_blockers: overview.openOperationalBlockers,
    summary: overview.summary,
  };
}

export function toReleaseReadinessOverviewView(
  releaseReadiness: ReleaseReadinessOverview
): ReleaseReadinessOverviewView {
  return {
    score: releaseReadiness.score,
    status: releaseReadiness.status,
    ready_areas: releaseReadiness.readyAreas,
    attention_areas: releaseReadiness.attentionAreas,
    blocked_areas: releaseReadiness.blockedAreas,
    blocker_count: releaseReadiness.blockerCount,
    warning_count: releaseReadiness.warningCount,
    strength_count: releaseReadiness.strengthCount,
    summary: releaseReadiness.summary,
  };
}

export function toMarketplaceOverviewView(marketplace: MarketplaceOverview): MarketplaceOverviewView {
  return {
    health_score: marketplace.healthScore,
    health_status: marketplace.healthStatus,
    open_requests: marketplace.openRequests,
    available_providers: marketplace.availableProviders,
    offer_to_contract_rate_percent: marketplace.offerToContractRatePercent,
    opportunity_count: marketplace.opportunityCount,
    summary: marketplace.summary,
  };
}

export function toTrustReputationOverviewView(
  trust: TrustReputationOverview
): TrustReputationOverviewView {
  return {
    average_trust_score: trust.averageTrustScore,
    providers_with_scores: trust.providersWithScores,
    low_trust_provider_count: trust.lowTrustProviderCount,
    trust_events_last_7_days: trust.trustEventsLast7Days,
    top_tier_share_percent: trust.topTierSharePercent,
    live_frame_summary: trust.liveFrameSummary,
    summary: trust.summary,
  };
}

export function toFinancialEscrowOverviewView(
  financial: FinancialEscrowOverview
): FinancialEscrowOverviewView {
  return {
    currency_code: financial.currencyCode,
    funded_minor: financial.fundedMinor,
    funded_label: financial.fundedLabel,
    released_minor: financial.releasedMinor,
    released_label: financial.releasedLabel,
    platform_fee_minor: financial.platformFeeMinor,
    platform_fee_label: financial.platformFeeLabel,
    pending_funding_count: financial.pendingFundingCount,
    frozen_escrow_count: financial.frozenEscrowCount,
    summary: financial.summary,
  };
}

export function toOperationalBlockerView(blocker: OperationalBlocker): OperationalBlockerView {
  return {
    code: blocker.code,
    category: blocker.category,
    label: blocker.label,
    message: blocker.message,
  };
}

export function toOperationalWarningView(warning: OperationalWarning): OperationalWarningView {
  return {
    code: warning.code,
    category: warning.category,
    label: warning.label,
    message: warning.message,
  };
}

export function toOperationalStrengthView(strength: OperationalStrength): OperationalStrengthView {
  return {
    code: strength.code,
    category: strength.category,
    label: strength.label,
    message: strength.message,
    score: strength.score,
  };
}

export function toExecutiveRecommendedActionView(
  action: ExecutiveRecommendedAction
): ExecutiveRecommendedActionView {
  return {
    priority: action.priority,
    action: action.action,
    rationale: action.rationale,
    source: action.source,
  };
}

export function toExecutiveCommandCenterView(
  center: ExecutiveCommandCenter
): ExecutiveCommandCenterView {
  return {
    overview: toExecutiveCommandCenterOverviewView(center.overview),
    release_readiness: toReleaseReadinessOverviewView(center.releaseReadiness),
    marketplace: toMarketplaceOverviewView(center.marketplace),
    trust: toTrustReputationOverviewView(center.trust),
    financial: toFinancialEscrowOverviewView(center.financial),
    blockers: center.blockers.map(toOperationalBlockerView),
    warnings: center.warnings.map(toOperationalWarningView),
    strengths: center.strengths.map(toOperationalStrengthView),
    actions: center.actions.map(toExecutiveRecommendedActionView),
    generated_at: center.generatedAt.toISOString(),
  };
}

export type {
  LaunchBlocker,
  LaunchStrength,
  LaunchWarning,
  RecommendedAction,
};
