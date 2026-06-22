import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ConversionStatus } from "../../conversion/domain/match-contract-conversion.js";
import type { IssueStatus } from "../../complaint/domain/issue.js";

export type PlatformHealthStatus = "healthy" | "attention" | "degraded";

export interface StatusCount {
  status: string;
  count: number;
}

export interface TrendSummary {
  periodDays: number;
  recentCount: number;
  priorCount: number;
  direction: "up" | "down" | "flat";
  summary: string;
}

export interface RequestOverview {
  totalCount: number;
  statusDistribution: StatusCount[];
  openCount: number;
  matchedCount: number;
  trend: TrendSummary;
  summary: string;
}

export interface OfferOverview {
  totalCount: number;
  statusDistribution: StatusCount[];
  activeCount: number;
  convertedCount: number;
  conversionRate: number;
  trend: TrendSummary;
  summary: string;
}

export interface ContractOverview {
  totalCount: number;
  statusDistribution: StatusCount[];
  activeCount: number;
  completedCount: number;
  disputedCount: number;
  trend: TrendSummary;
  summary: string;
}

export interface EscrowOverview {
  totalCount: number;
  statusDistribution: StatusCount[];
  frozenCount: number;
  pendingFundingCount: number;
  heldCount: number;
  releasedCount: number;
  trend: TrendSummary;
  summary: string;
}

export interface ExecutionOverview {
  totalMilestones: number;
  milestoneStatusDistribution: StatusCount[];
  totalEvidence: number;
  contractsWithMilestones: number;
  inProgressMilestones: number;
  trend: TrendSummary;
  summary: string;
}

export interface IssueOverview {
  totalCount: number;
  statusDistribution: StatusCount[];
  openCount: number;
  escalatedCount: number;
  trend: TrendSummary;
  summary: string;
}

export interface TrustOverview {
  providersWithScores: number;
  averageTrustScore: number;
  lowTrustProviderCount: number;
  frameTierDistribution: StatusCount[];
  trend: TrendSummary;
  summary: string;
}

export interface RiskIndicator {
  code: string;
  severity: "low" | "medium" | "high";
  label: string;
  count: number;
  summary: string;
}

export interface RiskOverview {
  indicators: RiskIndicator[];
  highSeverityCount: number;
  mediumSeverityCount: number;
  summary: string;
}

export interface OperationsSummary {
  healthStatus: PlatformHealthStatus;
  totalRequests: number;
  totalOffers: number;
  totalContracts: number;
  openIssues: number;
  frozenEscrows: number;
  failedOperations: number;
  riskIndicatorCount: number;
  nextRecommendedAction: string;
  summary: string;
}

export interface PlatformOverview {
  summary: OperationsSummary;
  requests: RequestOverview;
  offers: OfferOverview;
  contracts: ContractOverview;
  escrow: EscrowOverview;
  execution: ExecutionOverview;
  issues: IssueOverview;
  trust: TrustOverview;
  risks: RiskOverview;
  generatedAt: Date;
}

export interface StatusCountView {
  status: string;
  count: number;
}

export interface TrendSummaryView {
  period_days: number;
  recent_count: number;
  prior_count: number;
  direction: TrendSummary["direction"];
  summary: string;
}

export interface RequestOverviewView {
  total_count: number;
  status_distribution: StatusCountView[];
  open_count: number;
  matched_count: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface OfferOverviewView {
  total_count: number;
  status_distribution: StatusCountView[];
  active_count: number;
  converted_count: number;
  conversion_rate: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface ContractOverviewView {
  total_count: number;
  status_distribution: StatusCountView[];
  active_count: number;
  completed_count: number;
  disputed_count: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface EscrowOverviewView {
  total_count: number;
  status_distribution: StatusCountView[];
  frozen_count: number;
  pending_funding_count: number;
  held_count: number;
  released_count: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface ExecutionOverviewView {
  total_milestones: number;
  milestone_status_distribution: StatusCountView[];
  total_evidence: number;
  contracts_with_milestones: number;
  in_progress_milestones: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface IssueOverviewView {
  total_count: number;
  status_distribution: StatusCountView[];
  open_count: number;
  escalated_count: number;
  trend: TrendSummaryView;
  summary: string;
}

export interface TrustOverviewView {
  providers_with_scores: number;
  average_trust_score: number;
  low_trust_provider_count: number;
  frame_tier_distribution: StatusCountView[];
  trend: TrendSummaryView;
  summary: string;
}

export interface RiskIndicatorView {
  code: string;
  severity: RiskIndicator["severity"];
  label: string;
  count: number;
  summary: string;
}

export interface RiskOverviewView {
  indicators: RiskIndicatorView[];
  high_severity_count: number;
  medium_severity_count: number;
  summary: string;
}

export interface OperationsSummaryView {
  health_status: PlatformHealthStatus;
  total_requests: number;
  total_offers: number;
  total_contracts: number;
  open_issues: number;
  frozen_escrows: number;
  failed_operations: number;
  risk_indicator_count: number;
  next_recommended_action: string;
  summary: string;
}

export interface PlatformOverviewView {
  summary: OperationsSummaryView;
  requests: RequestOverviewView;
  offers: OfferOverviewView;
  contracts: ContractOverviewView;
  escrow: EscrowOverviewView;
  execution: ExecutionOverviewView;
  issues: IssueOverviewView;
  trust: TrustOverviewView;
  risks: RiskOverviewView;
  generated_at: string;
}

const ACTIVE_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "proposed",
  "accepted",
  "active",
  "issue_raised",
  "disputed",
]);

const COMPLETED_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "completed",
  "resolved",
  "closed",
]);

const ACTIVE_OFFER_STATUSES: ReadonlySet<ConversionStatus> = new Set([
  "offer_created",
  "draft_previewed",
  "accepted",
]);

const OPEN_ISSUE_STATUSES: ReadonlySet<IssueStatus> = new Set(["raised", "escalated"]);

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function buildTrendSummary(input: {
  periodDays: number;
  recentCount: number;
  priorCount: number;
  entityLabel: string;
}): TrendSummary {
  let direction: TrendSummary["direction"] = "flat";
  if (input.recentCount > input.priorCount) direction = "up";
  if (input.recentCount < input.priorCount) direction = "down";

  const summary =
    direction === "flat"
      ? `${input.recentCount} ${input.entityLabel}${input.recentCount === 1 ? "" : "s"} in the last ${input.periodDays} days, unchanged from the prior period.`
      : direction === "up"
        ? `${input.recentCount} ${input.entityLabel}${input.recentCount === 1 ? "" : "s"} in the last ${input.periodDays} days, up from ${input.priorCount}.`
        : `${input.recentCount} ${input.entityLabel}${input.recentCount === 1 ? "" : "s"} in the last ${input.periodDays} days, down from ${input.priorCount}.`;

  return {
    periodDays: input.periodDays,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    direction,
    summary,
  };
}

export function countByStatus<T extends string>(
  rows: Array<{ status: T; count: number }>
): StatusCount[] {
  return rows
    .map((row) => ({ status: row.status, count: row.count }))
    .sort((a, b) => b.count - a.count);
}

export function sumStatusCounts(distribution: StatusCount[], statuses: string[]): number {
  return distribution
    .filter((entry) => statuses.includes(entry.status))
    .reduce((total, entry) => total + entry.count, 0);
}

export function buildRequestOverview(input: {
  totalCount: number;
  statusDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): RequestOverview {
  const openCount = sumStatusCounts(input.statusDistribution, ["open"]);
  const matchedCount = sumStatusCounts(input.statusDistribution, ["matched"]);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "new request",
  });

  return {
    totalCount: input.totalCount,
    statusDistribution: input.statusDistribution,
    openCount,
    matchedCount,
    trend,
    summary: `${input.totalCount} customer request${input.totalCount === 1 ? "" : "s"} tracked; ${openCount} open and ${matchedCount} matched.`,
  };
}

export function buildOfferOverview(input: {
  totalCount: number;
  statusDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): OfferOverview {
  const activeCount = sumStatusCounts(
    input.statusDistribution,
    Array.from(ACTIVE_OFFER_STATUSES)
  );
  const convertedCount = sumStatusCounts(input.statusDistribution, ["contract_created"]);
  const eligible = Math.max(1, input.totalCount - sumStatusCounts(input.statusDistribution, ["cancelled"]));
  const conversionRate = Math.round((convertedCount / eligible) * 100);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "new offer",
  });

  return {
    totalCount: input.totalCount,
    statusDistribution: input.statusDistribution,
    activeCount,
    convertedCount,
    conversionRate,
    trend,
    summary: `${input.totalCount} conversion offer${input.totalCount === 1 ? "" : "s"}; ${convertedCount} converted (${conversionRate}%).`,
  };
}

export function buildContractOverview(input: {
  totalCount: number;
  statusDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): ContractOverview {
  const activeCount = sumStatusCounts(
    input.statusDistribution,
    Array.from(ACTIVE_CONTRACT_STATUSES)
  );
  const completedCount = sumStatusCounts(
    input.statusDistribution,
    Array.from(COMPLETED_CONTRACT_STATUSES)
  );
  const disputedCount = sumStatusCounts(input.statusDistribution, ["issue_raised", "disputed"]);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "new contract",
  });

  return {
    totalCount: input.totalCount,
    statusDistribution: input.statusDistribution,
    activeCount,
    completedCount,
    disputedCount,
    trend,
    summary: `${input.totalCount} contract${input.totalCount === 1 ? "" : "s"}; ${activeCount} active and ${completedCount} completed.`,
  };
}

export function buildEscrowOverview(input: {
  totalCount: number;
  statusDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): EscrowOverview {
  const frozenCount = sumStatusCounts(input.statusDistribution, ["frozen"]);
  const pendingFundingCount = sumStatusCounts(input.statusDistribution, ["pending_funding"]);
  const heldCount = sumStatusCounts(input.statusDistribution, [
    "held",
    "in_execution",
    "awaiting_acceptance",
    "funded",
  ]);
  const releasedCount = sumStatusCounts(input.statusDistribution, ["released"]);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "new escrow",
  });

  return {
    totalCount: input.totalCount,
    statusDistribution: input.statusDistribution,
    frozenCount,
    pendingFundingCount,
    heldCount,
    releasedCount,
    trend,
    summary: `${input.totalCount} escrow agreement${input.totalCount === 1 ? "" : "s"}; ${heldCount} funded or held, ${frozenCount} frozen.`,
  };
}

export function buildExecutionOverview(input: {
  totalMilestones: number;
  milestoneStatusDistribution: StatusCount[];
  totalEvidence: number;
  contractsWithMilestones: number;
  recentCount: number;
  priorCount: number;
}): ExecutionOverview {
  const inProgressMilestones = sumStatusCounts(input.milestoneStatusDistribution, [
    "in_progress",
    "submitted",
    "disputed",
  ]);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "milestone update",
  });

  return {
    totalMilestones: input.totalMilestones,
    milestoneStatusDistribution: input.milestoneStatusDistribution,
    totalEvidence: input.totalEvidence,
    contractsWithMilestones: input.contractsWithMilestones,
    inProgressMilestones,
    trend,
    summary: `${input.totalMilestones} milestone${input.totalMilestones === 1 ? "" : "s"} across ${input.contractsWithMilestones} contract${input.contractsWithMilestones === 1 ? "" : "s"}; ${input.totalEvidence} evidence item${input.totalEvidence === 1 ? "" : "s"}.`,
  };
}

export function buildIssueOverview(input: {
  totalCount: number;
  statusDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): IssueOverview {
  const openCount = sumStatusCounts(input.statusDistribution, Array.from(OPEN_ISSUE_STATUSES));
  const escalatedCount = sumStatusCounts(input.statusDistribution, ["escalated"]);
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "new issue",
  });

  return {
    totalCount: input.totalCount,
    statusDistribution: input.statusDistribution,
    openCount,
    escalatedCount,
    trend,
    summary: `${input.totalCount} issue${input.totalCount === 1 ? "" : "s"} recorded; ${openCount} currently open.`,
  };
}

export function buildTrustOverview(input: {
  providersWithScores: number;
  averageTrustScore: number;
  lowTrustProviderCount: number;
  frameTierDistribution: StatusCount[];
  recentCount: number;
  priorCount: number;
}): TrustOverview {
  const trend = buildTrendSummary({
    periodDays: 7,
    recentCount: input.recentCount,
    priorCount: input.priorCount,
    entityLabel: "trust event",
  });

  return {
    providersWithScores: input.providersWithScores,
    averageTrustScore: input.averageTrustScore,
    lowTrustProviderCount: input.lowTrustProviderCount,
    frameTierDistribution: input.frameTierDistribution,
    trend,
    summary: `${input.providersWithScores} provider${input.providersWithScores === 1 ? "" : "s"} scored; average trust ${input.averageTrustScore}, ${input.lowTrustProviderCount} below threshold.`,
  };
}

export function buildRiskOverview(input: {
  frozenEscrows: number;
  openIssues: number;
  escalatedIssues: number;
  disputedContracts: number;
  failedOperations: number;
  staleOffers: number;
  lowTrustProviders: number;
  pendingFundingEscrows: number;
}): RiskOverview {
  const indicators: RiskIndicator[] = [];

  if (input.frozenEscrows > 0) {
    indicators.push({
      code: "frozen_escrow",
      severity: "high",
      label: "Frozen escrow",
      count: input.frozenEscrows,
      summary: `${input.frozenEscrows} escrow agreement${input.frozenEscrows === 1 ? "" : "s"} frozen.`,
    });
  }
  if (input.openIssues > 0) {
    indicators.push({
      code: "open_issue",
      severity: input.escalatedIssues > 0 ? "high" : "medium",
      label: "Open issues",
      count: input.openIssues,
      summary: `${input.openIssues} open issue${input.openIssues === 1 ? "" : "s"} require review.`,
    });
  }
  if (input.disputedContracts > 0) {
    indicators.push({
      code: "disputed_contract",
      severity: "high",
      label: "Disputed contracts",
      count: input.disputedContracts,
      summary: `${input.disputedContracts} contract${input.disputedContracts === 1 ? "" : "s"} in dispute.`,
    });
  }
  if (input.failedOperations > 0) {
    indicators.push({
      code: "failed_operation",
      severity: "medium",
      label: "Failed operations",
      count: input.failedOperations,
      summary: `${input.failedOperations} async operation${input.failedOperations === 1 ? "" : "s"} failed.`,
    });
  }
  if (input.staleOffers > 0) {
    indicators.push({
      code: "stale_offer",
      severity: "medium",
      label: "Stale offers",
      count: input.staleOffers,
      summary: `${input.staleOffers} offer${input.staleOffers === 1 ? "" : "s"} pending beyond 7 days.`,
    });
  }
  if (input.lowTrustProviders > 0) {
    indicators.push({
      code: "low_trust_provider",
      severity: "low",
      label: "Low trust providers",
      count: input.lowTrustProviders,
      summary: `${input.lowTrustProviders} provider${input.lowTrustProviders === 1 ? "" : "s"} below trust threshold.`,
    });
  }
  if (input.pendingFundingEscrows > 0) {
    indicators.push({
      code: "pending_funding",
      severity: "low",
      label: "Pending funding",
      count: input.pendingFundingEscrows,
      summary: `${input.pendingFundingEscrows} escrow${input.pendingFundingEscrows === 1 ? "" : "s"} awaiting funding.`,
    });
  }

  const highSeverityCount = indicators.filter((entry) => entry.severity === "high").length;
  const mediumSeverityCount = indicators.filter((entry) => entry.severity === "medium").length;
  const summary =
    indicators.length === 0
      ? "No elevated operational risks detected."
      : `${indicators.length} operational risk indicator${indicators.length === 1 ? "" : "s"} active.`;

  return {
    indicators,
    highSeverityCount,
    mediumSeverityCount,
    summary,
  };
}

export function deriveOperationsHealthStatus(input: {
  highSeverityCount: number;
  mediumSeverityCount: number;
  failedOperations: number;
  openIssues: number;
}): PlatformHealthStatus {
  if (input.highSeverityCount > 0 || input.failedOperations > 5) {
    return "degraded";
  }
  if (input.mediumSeverityCount > 0 || input.openIssues > 0 || input.failedOperations > 0) {
    return "attention";
  }
  return "healthy";
}

export function deriveOperationsNextAction(input: {
  healthStatus: PlatformHealthStatus;
  risks: RiskOverview;
}): string {
  const top = input.risks.indicators.find((entry) => entry.severity === "high");
  if (top) {
    return `Review ${top.label.toLowerCase()}`;
  }
  if (input.healthStatus === "attention") {
    const medium = input.risks.indicators.find((entry) => entry.severity === "medium");
    if (medium) return `Monitor ${medium.label.toLowerCase()}`;
    return "Monitor platform activity";
  }
  return "No immediate action required";
}

export function buildOperationsSummary(input: {
  requests: RequestOverview;
  offers: OfferOverview;
  contracts: ContractOverview;
  escrow: EscrowOverview;
  issues: IssueOverview;
  risks: RiskOverview;
  failedOperations: number;
}): OperationsSummary {
  const healthStatus = deriveOperationsHealthStatus({
    highSeverityCount: input.risks.highSeverityCount,
    mediumSeverityCount: input.risks.mediumSeverityCount,
    failedOperations: input.failedOperations,
    openIssues: input.issues.openCount,
  });

  const summary =
    healthStatus === "healthy"
      ? "Platform operations are stable across requests, contracts, escrow, and trust signals."
      : healthStatus === "attention"
        ? "Platform operations require monitoring based on current risk indicators."
        : "Platform operations show elevated risk and require administrator review.";

  return {
    healthStatus,
    totalRequests: input.requests.totalCount,
    totalOffers: input.offers.totalCount,
    totalContracts: input.contracts.totalCount,
    openIssues: input.issues.openCount,
    frozenEscrows: input.escrow.frozenCount,
    failedOperations: input.failedOperations,
    riskIndicatorCount: input.risks.indicators.length,
    nextRecommendedAction: deriveOperationsNextAction({ healthStatus, risks: input.risks }),
    summary,
  };
}

export function buildPlatformOverview(input: {
  requests: RequestOverview;
  offers: OfferOverview;
  contracts: ContractOverview;
  escrow: EscrowOverview;
  execution: ExecutionOverview;
  issues: IssueOverview;
  trust: TrustOverview;
  risks: RiskOverview;
  failedOperations: number;
  generatedAt?: Date;
}): PlatformOverview {
  const summary = buildOperationsSummary({
    requests: input.requests,
    offers: input.offers,
    contracts: input.contracts,
    escrow: input.escrow,
    issues: input.issues,
    risks: input.risks,
    failedOperations: input.failedOperations,
  });

  return {
    summary,
    requests: input.requests,
    offers: input.offers,
    contracts: input.contracts,
    escrow: input.escrow,
    execution: input.execution,
    issues: input.issues,
    trust: input.trust,
    risks: input.risks,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toStatusCountView(entry: StatusCount): StatusCountView {
  return { status: entry.status, count: entry.count };
}

export function toTrendSummaryView(trend: TrendSummary): TrendSummaryView {
  return {
    period_days: trend.periodDays,
    recent_count: trend.recentCount,
    prior_count: trend.priorCount,
    direction: trend.direction,
    summary: trend.summary,
  };
}

export function toRequestOverviewView(overview: RequestOverview): RequestOverviewView {
  return {
    total_count: overview.totalCount,
    status_distribution: overview.statusDistribution.map(toStatusCountView),
    open_count: overview.openCount,
    matched_count: overview.matchedCount,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toOfferOverviewView(overview: OfferOverview): OfferOverviewView {
  return {
    total_count: overview.totalCount,
    status_distribution: overview.statusDistribution.map(toStatusCountView),
    active_count: overview.activeCount,
    converted_count: overview.convertedCount,
    conversion_rate: overview.conversionRate,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toContractOverviewView(overview: ContractOverview): ContractOverviewView {
  return {
    total_count: overview.totalCount,
    status_distribution: overview.statusDistribution.map(toStatusCountView),
    active_count: overview.activeCount,
    completed_count: overview.completedCount,
    disputed_count: overview.disputedCount,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toEscrowOverviewView(overview: EscrowOverview): EscrowOverviewView {
  return {
    total_count: overview.totalCount,
    status_distribution: overview.statusDistribution.map(toStatusCountView),
    frozen_count: overview.frozenCount,
    pending_funding_count: overview.pendingFundingCount,
    held_count: overview.heldCount,
    released_count: overview.releasedCount,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toExecutionOverviewView(overview: ExecutionOverview): ExecutionOverviewView {
  return {
    total_milestones: overview.totalMilestones,
    milestone_status_distribution: overview.milestoneStatusDistribution.map(toStatusCountView),
    total_evidence: overview.totalEvidence,
    contracts_with_milestones: overview.contractsWithMilestones,
    in_progress_milestones: overview.inProgressMilestones,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toIssueOverviewView(overview: IssueOverview): IssueOverviewView {
  return {
    total_count: overview.totalCount,
    status_distribution: overview.statusDistribution.map(toStatusCountView),
    open_count: overview.openCount,
    escalated_count: overview.escalatedCount,
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toTrustOverviewView(overview: TrustOverview): TrustOverviewView {
  return {
    providers_with_scores: overview.providersWithScores,
    average_trust_score: overview.averageTrustScore,
    low_trust_provider_count: overview.lowTrustProviderCount,
    frame_tier_distribution: overview.frameTierDistribution.map(toStatusCountView),
    trend: toTrendSummaryView(overview.trend),
    summary: overview.summary,
  };
}

export function toRiskIndicatorView(indicator: RiskIndicator): RiskIndicatorView {
  return {
    code: indicator.code,
    severity: indicator.severity,
    label: indicator.label,
    count: indicator.count,
    summary: indicator.summary,
  };
}

export function toRiskOverviewView(overview: RiskOverview): RiskOverviewView {
  return {
    indicators: overview.indicators.map(toRiskIndicatorView),
    high_severity_count: overview.highSeverityCount,
    medium_severity_count: overview.mediumSeverityCount,
    summary: overview.summary,
  };
}

export function toOperationsSummaryView(summary: OperationsSummary): OperationsSummaryView {
  return {
    health_status: summary.healthStatus,
    total_requests: summary.totalRequests,
    total_offers: summary.totalOffers,
    total_contracts: summary.totalContracts,
    open_issues: summary.openIssues,
    frozen_escrows: summary.frozenEscrows,
    failed_operations: summary.failedOperations,
    risk_indicator_count: summary.riskIndicatorCount,
    next_recommended_action: summary.nextRecommendedAction,
    summary: summary.summary,
  };
}

export function toPlatformOverviewView(overview: PlatformOverview): PlatformOverviewView {
  return {
    summary: toOperationsSummaryView(overview.summary),
    requests: toRequestOverviewView(overview.requests),
    offers: toOfferOverviewView(overview.offers),
    contracts: toContractOverviewView(overview.contracts),
    escrow: toEscrowOverviewView(overview.escrow),
    execution: toExecutionOverviewView(overview.execution),
    issues: toIssueOverviewView(overview.issues),
    trust: toTrustOverviewView(overview.trust),
    risks: toRiskOverviewView(overview.risks),
    generated_at: toIsoString(overview.generatedAt),
  };
}
