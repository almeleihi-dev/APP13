import type { PlatformAnalyticsSnapshot } from "../../../analytics/domain/platform-analytics.js";
import { buildAnalyticsSummary, type AnalyticsSummary } from "../../../analytics/domain/platform-analytics.js";
import {
  sumStatusCounts,
  type PlatformHealthStatus,
  type PlatformOverview,
} from "../../../operations/domain/admin-console.js";

export interface PlatformOperationsRawSnapshot {
  analyticsSnapshot: PlatformAnalyticsSnapshot;
  platformOverview: PlatformOverview;
}

export type OperationalRiskLevel = "critical" | "high" | "medium" | "low";
export type RecommendationHorizon = "immediate" | "today" | "this_week" | "this_month";

export interface OperationsOverview {
  headline: string;
  operationsScore: number;
  activeUsers: number;
  activeProviders: number;
  activeContracts: number;
  openIssues: number;
  openComplaints: number;
  escrowVolumeMinor: number;
  platformActivityScore: number;
  summary: string;
}

export interface ContractOperationsView {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  disputedContracts: number;
  cancelledContracts: number;
  summary: string;
}

export interface EscrowOperationsView {
  activeEscrows: number;
  fundedEscrows: number;
  heldEscrows: number;
  frozenEscrows: number;
  releasedEscrows: number;
  escrowVolumeMinor: number;
  summary: string;
}

export interface TrustOperationsView {
  trustEvents: number;
  evaluations: number;
  disputes: number;
  trustWarnings: number;
  trustRecoveryEvents: number;
  summary: string;
}

export interface ComplaintOperationsView {
  openComplaints: number;
  resolvedComplaints: number;
  escalationCount: number;
  complaintHealthScore: number;
  summary: string;
}

export interface ExecutionOperationsView {
  milestonesSubmitted: number;
  milestonesAccepted: number;
  pendingAcceptance: number;
  executionHealthScore: number;
  summary: string;
}

export interface FinancialOperationsView {
  transactionCount: number;
  platformFeesMinor: number;
  escrowBalancesMinor: number;
  refunds: number;
  financialActivityScore: number;
  summary: string;
}

export interface SystemHealthView {
  routeCount: number;
  moduleCount: number;
  verificationChainStatus: string;
  dependencyHealth: number;
  operationalHealthScore: number;
  summary: string;
}

export interface OperationalRisk {
  category:
    | "contract"
    | "escrow"
    | "trust"
    | "complaint"
    | "execution"
    | "financial"
    | "system";
  severity: OperationalRiskLevel;
  message: string;
  mitigation: string;
}

export interface OperationalRiskRegister {
  risks: OperationalRisk[];
  summary: string;
}

export interface OperationalRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface OperationalRecommendations {
  immediate: OperationalRecommendation[];
  today: OperationalRecommendation[];
  thisWeek: OperationalRecommendation[];
  thisMonth: OperationalRecommendation[];
  summary: string;
}

export interface OperationsScore {
  score: number;
  contractsWeight: number;
  escrowWeight: number;
  trustWeight: number;
  complaintsWeight: number;
  executionWeight: number;
  financialWeight: number;
  systemHealthWeight: number;
  summary: string;
}

export interface PlatformOperationsSnapshot {
  overview: OperationsOverview;
  contracts: ContractOperationsView;
  escrow: EscrowOperationsView;
  trust: TrustOperationsView;
  complaints: ComplaintOperationsView;
  execution: ExecutionOperationsView;
  financial: FinancialOperationsView;
  systemHealth: SystemHealthView;
  riskRegister: OperationalRiskRegister;
  recommendations: OperationalRecommendations;
  operationsScore: OperationsScore;
  generatedAt: Date;
}

export interface PlatformOperationsCenter {
  overview: OperationsOverview;
  contracts: ContractOperationsView;
  escrow: EscrowOperationsView;
  trust: TrustOperationsView;
  complaints: ComplaintOperationsView;
  execution: ExecutionOperationsView;
  financial: FinancialOperationsView;
  systemHealth: SystemHealthView;
  riskRegister: OperationalRiskRegister;
  recommendations: OperationalRecommendations;
  operationsScore: OperationsScore;
  generatedAt: Date;
}

export const PLATFORM_OPERATIONS_ROUTES = [
  "/platform-operations",
  "/platform-operations/overview",
  "/platform-operations/contracts",
  "/platform-operations/escrow",
  "/platform-operations/trust",
  "/platform-operations/complaints",
  "/platform-operations/execution",
  "/platform-operations/financial",
  "/platform-operations/system-health",
  "/platform-operations/risks",
  "/platform-operations/recommendations",
];

const TRACKED_OPERATIONAL_MODULES = 9;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function healthStatusScore(status: PlatformHealthStatus): number {
  if (status === "healthy") return 100;
  if (status === "attention") return 70;
  return 40;
}

function scoreFromRatio(numerator: number, denominator: number, penalty = 0): number {
  return clamp(Math.round((numerator / Math.max(1, denominator)) * 100) - penalty, 0, 100);
}

export function buildContractOperationsView(input: {
  platformOverview: PlatformOverview;
  analytics: AnalyticsSummary;
}): ContractOperationsView {
  const contracts = input.platformOverview.contracts;
  const cancelledContracts = sumStatusCounts(contracts.statusDistribution, [
    "cancelled",
    "withdrawn",
  ]);

  return {
    totalContracts: contracts.totalCount,
    activeContracts: contracts.activeCount,
    completedContracts: contracts.completedCount,
    disputedContracts: contracts.disputedCount,
    cancelledContracts,
    summary: `${contracts.totalCount} contracts tracked with ${contracts.activeCount} active and ${contracts.disputedCount} disputed.`,
  };
}

export function buildEscrowOperationsView(input: {
  platformOverview: PlatformOverview;
  analytics: AnalyticsSummary;
}): EscrowOperationsView {
  const escrow = input.platformOverview.escrow;
  const analyticsEscrow = input.analytics.escrow;

  return {
    activeEscrows: escrow.heldCount + escrow.pendingFundingCount,
    fundedEscrows: analyticsEscrow.fundedEscrows,
    heldEscrows: escrow.heldCount,
    frozenEscrows: escrow.frozenCount,
    releasedEscrows: escrow.releasedCount,
    escrowVolumeMinor: input.analytics.revenue.escrowFundedAmountMinor.allTime,
    summary: `${analyticsEscrow.fundedEscrows} funded escrows, ${escrow.frozenCount} frozen, ${input.analytics.revenue.escrowFundedAmountMinor.allTime} minor units funded.`,
  };
}

export function buildTrustOperationsView(input: {
  platformOverview: PlatformOverview;
  analytics: AnalyticsSummary;
}): TrustOperationsView {
  const trust = input.analytics.trust;
  const recoveryEvents = Math.max(0, trust.trustEvents.last7Days - trust.trustEvents.prior7Days);

  return {
    trustEvents: trust.trustEvents.allTime,
    evaluations: trust.providersWithScores,
    disputes: input.platformOverview.contracts.disputedCount,
    trustWarnings: trust.lowTrustProviderCount,
    trustRecoveryEvents: recoveryEvents,
    summary: `${trust.trustEvents.allTime} trust events, ${trust.providersWithScores} provider evaluations, ${trust.lowTrustProviderCount} trust warnings.`,
  };
}

export function buildComplaintOperationsView(input: {
  platformOverview: PlatformOverview;
}): ComplaintOperationsView {
  const issues = input.platformOverview.issues;
  const resolvedComplaints = Math.max(0, issues.totalCount - issues.openCount);
  const complaintHealthScore = scoreFromRatio(
    resolvedComplaints,
    Math.max(1, issues.totalCount),
    issues.escalatedCount * 10
  );

  return {
    openComplaints: issues.openCount,
    resolvedComplaints,
    escalationCount: issues.escalatedCount,
    complaintHealthScore,
    summary: `${issues.openCount} open complaints, ${resolvedComplaints} resolved, ${issues.escalatedCount} escalations.`,
  };
}

export function buildExecutionOperationsView(input: {
  platformOverview: PlatformOverview;
  analytics: AnalyticsSummary;
}): ExecutionOperationsView {
  const execution = input.platformOverview.execution;
  const analyticsExecution = input.analytics.execution;
  const milestonesSubmitted =
    analyticsExecution.completedMilestones + analyticsExecution.inProgressMilestones;
  const executionHealthScore = scoreFromRatio(
    analyticsExecution.completedMilestones,
    Math.max(1, analyticsExecution.totalMilestones),
    execution.inProgressMilestones > execution.totalMilestones * 0.5 ? 10 : 0
  );

  return {
    milestonesSubmitted,
    milestonesAccepted: analyticsExecution.completedMilestones,
    pendingAcceptance: analyticsExecution.inProgressMilestones,
    executionHealthScore,
    summary: `${milestonesSubmitted} milestones submitted, ${analyticsExecution.completedMilestones} accepted, ${analyticsExecution.inProgressMilestones} pending acceptance.`,
  };
}

export function buildFinancialOperationsView(input: {
  analytics: AnalyticsSummary;
}): FinancialOperationsView {
  const transactionCount =
    input.analytics.escrow.totalEscrows + input.analytics.contracts.totalContracts;
  const financialActivityScore = clamp(
    Math.round(
      (input.analytics.revenue.platformFeeTotalMinor.allTime > 0 ? 70 : 50) +
        Math.min(30, input.analytics.escrow.fundedEscrows * 5)
    ),
    0,
    100
  );

  return {
    transactionCount,
    platformFeesMinor: input.analytics.revenue.platformFeeTotalMinor.allTime,
    escrowBalancesMinor: input.analytics.revenue.escrowFundedAmountMinor.allTime,
    refunds: 0,
    financialActivityScore,
    summary: `${transactionCount} financial transactions with ${input.analytics.revenue.platformFeeTotalMinor.allTime} minor units in platform fees.`,
  };
}

export function buildSystemHealthView(input: {
  platformOverview: PlatformOverview;
}): SystemHealthView {
  const summary = input.platformOverview.summary;
  const risks = input.platformOverview.risks;
  const routeCount =
    summary.totalRequests +
    summary.totalOffers +
    summary.totalContracts +
    summary.openIssues;
  const verificationChainStatus =
    summary.healthStatus === "healthy"
      ? "verified"
      : summary.healthStatus === "attention"
        ? "attention"
        : "degraded";
  const dependencyHealth = clamp(
    100 -
      risks.highSeverityCount * 15 -
      risks.mediumSeverityCount * 5 -
      summary.failedOperations * 10,
    0,
    100
  );

  return {
    routeCount,
    moduleCount: TRACKED_OPERATIONAL_MODULES,
    verificationChainStatus,
    dependencyHealth,
    operationalHealthScore: healthStatusScore(summary.healthStatus),
    summary: `System health ${summary.healthStatus} across ${routeCount} operational surfaces and ${TRACKED_OPERATIONAL_MODULES} tracked modules.`,
  };
}

function scoreContracts(view: ContractOperationsView): number {
  return scoreFromRatio(
    view.completedContracts,
    Math.max(1, view.totalContracts),
    view.disputedContracts * 8
  );
}

function scoreEscrow(view: EscrowOperationsView): number {
  return scoreFromRatio(
    view.releasedEscrows + view.fundedEscrows,
    Math.max(1, view.activeEscrows + view.fundedEscrows + view.releasedEscrows),
    view.frozenEscrows * 12
  );
}

function scoreTrust(view: TrustOperationsView): number {
  return clamp(
    100 - view.trustWarnings * 8 - view.disputes * 10 + Math.min(20, view.trustRecoveryEvents * 2),
    0,
    100
  );
}

function scoreExecution(view: ExecutionOperationsView): number {
  return view.executionHealthScore;
}

function scoreFinancial(view: FinancialOperationsView): number {
  return view.financialActivityScore;
}

function scoreComplaints(view: ComplaintOperationsView): number {
  return view.complaintHealthScore;
}

function scoreSystemHealth(view: SystemHealthView): number {
  return clamp(
    Math.round(view.operationalHealthScore * 0.6 + view.dependencyHealth * 0.4),
    0,
    100
  );
}

export function computeOperationsScore(input: {
  contracts: ContractOperationsView;
  escrow: EscrowOperationsView;
  trust: TrustOperationsView;
  complaints: ComplaintOperationsView;
  execution: ExecutionOperationsView;
  financial: FinancialOperationsView;
  systemHealth: SystemHealthView;
}): OperationsScore {
  const contractsWeight = 15;
  const escrowWeight = 15;
  const trustWeight = 15;
  const complaintsWeight = 10;
  const executionWeight = 15;
  const financialWeight = 15;
  const systemHealthWeight = 15;

  const contractsScore = scoreContracts(input.contracts);
  const escrowScore = scoreEscrow(input.escrow);
  const trustScore = scoreTrust(input.trust);
  const complaintsScore = scoreComplaints(input.complaints);
  const executionScore = scoreExecution(input.execution);
  const financialScore = scoreFinancial(input.financial);
  const systemScore = scoreSystemHealth(input.systemHealth);

  const score = Math.round(
    contractsScore * (contractsWeight / 100) +
      escrowScore * (escrowWeight / 100) +
      trustScore * (trustWeight / 100) +
      complaintsScore * (complaintsWeight / 100) +
      executionScore * (executionWeight / 100) +
      financialScore * (financialWeight / 100) +
      systemScore * (systemHealthWeight / 100)
  );

  return {
    score,
    contractsWeight,
    escrowWeight,
    trustWeight,
    complaintsWeight,
    executionWeight,
    financialWeight,
    systemHealthWeight,
    summary: `Operations score ${score} weighted across contracts, escrow, trust, complaints, execution, financial, and system health.`,
  };
}

export function buildOperationalRiskRegister(input: {
  contracts: ContractOperationsView;
  escrow: EscrowOperationsView;
  trust: TrustOperationsView;
  complaints: ComplaintOperationsView;
  execution: ExecutionOperationsView;
  financial: FinancialOperationsView;
  systemHealth: SystemHealthView;
  platformOverview: PlatformOverview;
}): OperationalRiskRegister {
  const risks: OperationalRisk[] = [];

  if (input.contracts.disputedContracts > 0) {
    risks.push({
      category: "contract",
      severity: "high",
      message: `${input.contracts.disputedContracts} contracts are in disputed states.`,
      mitigation: "Review disputed contracts and escalate resolution workflows.",
    });
  }

  if (input.escrow.frozenEscrows > 0) {
    risks.push({
      category: "escrow",
      severity: "critical",
      message: `${input.escrow.frozenEscrows} escrows are frozen.`,
      mitigation: "Investigate frozen escrows and restore funding or release paths.",
    });
  }

  if (input.trust.trustWarnings > 0) {
    risks.push({
      category: "trust",
      severity: "medium",
      message: `${input.trust.trustWarnings} providers flagged with low trust scores.`,
      mitigation: "Monitor low-trust providers and apply trust recovery actions.",
    });
  }

  if (input.complaints.escalationCount > 0) {
    risks.push({
      category: "complaint",
      severity: "high",
      message: `${input.complaints.escalationCount} complaints are escalated.`,
      mitigation: "Prioritize escalated complaint resolution today.",
    });
  }

  if (input.execution.pendingAcceptance > input.execution.milestonesAccepted) {
    risks.push({
      category: "execution",
      severity: "medium",
      message: `${input.execution.pendingAcceptance} milestones await acceptance.`,
      mitigation: "Clear milestone acceptance backlog to maintain execution velocity.",
    });
  }

  if (input.platformOverview.summary.failedOperations > 0) {
    risks.push({
      category: "financial",
      severity: "high",
      message: `${input.platformOverview.summary.failedOperations} failed financial operations detected.`,
      mitigation: "Review failed financial operations and reconcile ledger entries.",
    });
  }

  if (input.systemHealth.operationalHealthScore < 70) {
    risks.push({
      category: "system",
      severity: input.systemHealth.operationalHealthScore < 50 ? "critical" : "medium",
      message: `Operational health score is ${input.systemHealth.operationalHealthScore}.`,
      mitigation: "Address platform health indicators and operational blockers immediately.",
    });
  }

  return {
    risks,
    summary: `Operational risk register tracks ${risks.length} contract, escrow, trust, complaint, execution, financial, and system risks.`,
  };
}

export function buildOperationalRecommendations(input: {
  riskRegister: OperationalRiskRegister;
  platformOverview: PlatformOverview;
  systemHealth: SystemHealthView;
}): OperationalRecommendations {
  const immediate = input.riskRegister.risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 5)
    .map((risk) => ({
      horizon: "immediate" as const,
      title: risk.message,
      reason: risk.category,
      action: risk.mitigation,
    }));

  const today: OperationalRecommendation[] = [];
  if (input.platformOverview.summary.openIssues > 0) {
    today.push({
      horizon: "today",
      title: "Resolve open operational issues",
      reason: "complaint backlog",
      action: `Review ${input.platformOverview.summary.openIssues} open issues in the admin console.`,
    });
  }
  if (input.systemHealth.verificationChainStatus !== "verified") {
    today.push({
      horizon: "today",
      title: "Review verification chain attention items",
      reason: "system health",
      action: "Run operational verification checks and clear degraded indicators.",
    });
  }

  const thisWeek = input.riskRegister.risks
    .filter((risk) => risk.severity === "medium")
    .slice(0, 3)
    .map((risk) => ({
      horizon: "this_week" as const,
      title: risk.message,
      reason: risk.category,
      action: risk.mitigation,
    }));

  const thisMonth = [
    {
      horizon: "this_month" as const,
      title: input.platformOverview.summary.nextRecommendedAction,
      reason: "operations summary",
      action: "Track monthly operational KPIs and maintain platform stability.",
    },
  ];

  return {
    immediate,
    today,
    thisWeek,
    thisMonth,
    summary: `Operational recommendations grouped ${immediate.length} immediate, ${today.length} today, ${thisWeek.length} this week, and ${thisMonth.length} this month actions.`,
  };
}

export function buildOperationsOverview(input: {
  analytics: AnalyticsSummary;
  platformOverview: PlatformOverview;
  operationsScore: OperationsScore;
  escrow: EscrowOperationsView;
}): OperationsOverview {
  const activityScore = clamp(
    Math.round(
      input.analytics.growth.requestsCreated.last7Days * 5 +
        input.analytics.growth.offersCreated.last7Days * 5 +
        input.analytics.growth.contractsCreated.last7Days * 5 +
        Math.min(40, input.analytics.platform.activeUsers)
    ),
    0,
    100
  );

  return {
    headline: "APP13 platform operations center",
    operationsScore: input.operationsScore.score,
    activeUsers: input.analytics.platform.activeUsers,
    activeProviders: input.analytics.platform.activeProviders,
    activeContracts: input.platformOverview.contracts.activeCount,
    openIssues: input.platformOverview.issues.openCount,
    openComplaints: input.platformOverview.issues.openCount,
    escrowVolumeMinor: input.escrow.escrowVolumeMinor,
    platformActivityScore: activityScore,
    summary: `Operations overview: score ${input.operationsScore.score}, ${input.analytics.platform.activeUsers} active users, ${input.platformOverview.contracts.activeCount} active contracts, ${input.platformOverview.issues.openCount} open issues.`,
  };
}

export function buildPlatformOperationsSnapshot(input: {
  raw: PlatformOperationsRawSnapshot;
  generatedAt?: Date;
}): PlatformOperationsSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const analytics = buildAnalyticsSummary(input.raw.analyticsSnapshot, generatedAt);
  const platformOverview = input.raw.platformOverview;

  const contracts = buildContractOperationsView({ platformOverview, analytics });
  const escrow = buildEscrowOperationsView({ platformOverview, analytics });
  const trust = buildTrustOperationsView({ platformOverview, analytics });
  const complaints = buildComplaintOperationsView({ platformOverview });
  const execution = buildExecutionOperationsView({ platformOverview, analytics });
  const financial = buildFinancialOperationsView({ analytics });
  const systemHealth = buildSystemHealthView({ platformOverview });
  const operationsScore = computeOperationsScore({
    contracts,
    escrow,
    trust,
    complaints,
    execution,
    financial,
    systemHealth,
  });
  const riskRegister = buildOperationalRiskRegister({
    contracts,
    escrow,
    trust,
    complaints,
    execution,
    financial,
    systemHealth,
    platformOverview,
  });
  const recommendations = buildOperationalRecommendations({
    riskRegister,
    platformOverview,
    systemHealth,
  });
  const overview = buildOperationsOverview({
    analytics,
    platformOverview,
    operationsScore,
    escrow,
  });

  return {
    overview,
    contracts,
    escrow,
    trust,
    complaints,
    execution,
    financial,
    systemHealth,
    riskRegister,
    recommendations,
    operationsScore,
    generatedAt,
  };
}

export function buildPlatformOperationsCenter(input: {
  snapshot: PlatformOperationsSnapshot;
}): PlatformOperationsCenter {
  return {
    overview: input.snapshot.overview,
    contracts: input.snapshot.contracts,
    escrow: input.snapshot.escrow,
    trust: input.snapshot.trust,
    complaints: input.snapshot.complaints,
    execution: input.snapshot.execution,
    financial: input.snapshot.financial,
    systemHealth: input.snapshot.systemHealth,
    riskRegister: input.snapshot.riskRegister,
    recommendations: input.snapshot.recommendations,
    operationsScore: input.snapshot.operationsScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export interface OperationsOverviewView {
  headline: string;
  operations_score: number;
  active_users: number;
  active_providers: number;
  active_contracts: number;
  open_issues: number;
  open_complaints: number;
  escrow_volume_minor: number;
  platform_activity_score: number;
  summary: string;
}

export interface ContractOperationsViewDto {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  disputed_contracts: number;
  cancelled_contracts: number;
  summary: string;
}

export interface EscrowOperationsViewDto {
  active_escrows: number;
  funded_escrows: number;
  held_escrows: number;
  frozen_escrows: number;
  released_escrows: number;
  escrow_volume_minor: number;
  summary: string;
}

export interface TrustOperationsViewDto {
  trust_events: number;
  evaluations: number;
  disputes: number;
  trust_warnings: number;
  trust_recovery_events: number;
  summary: string;
}

export interface ComplaintOperationsViewDto {
  open_complaints: number;
  resolved_complaints: number;
  escalation_count: number;
  complaint_health_score: number;
  summary: string;
}

export interface ExecutionOperationsViewDto {
  milestones_submitted: number;
  milestones_accepted: number;
  pending_acceptance: number;
  execution_health_score: number;
  summary: string;
}

export interface FinancialOperationsViewDto {
  transaction_count: number;
  platform_fees_minor: number;
  escrow_balances_minor: number;
  refunds: number;
  financial_activity_score: number;
  summary: string;
}

export interface SystemHealthViewDto {
  route_count: number;
  module_count: number;
  verification_chain_status: string;
  dependency_health: number;
  operational_health_score: number;
  summary: string;
}

export interface OperationalRiskView {
  category: OperationalRisk["category"];
  severity: OperationalRiskLevel;
  message: string;
  mitigation: string;
}

export interface OperationalRiskRegisterView {
  risks: OperationalRiskView[];
  summary: string;
}

export interface OperationalRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface OperationalRecommendationsView {
  immediate: OperationalRecommendationView[];
  today: OperationalRecommendationView[];
  this_week: OperationalRecommendationView[];
  this_month: OperationalRecommendationView[];
  summary: string;
}

export interface OperationsScoreView {
  score: number;
  contracts_weight: number;
  escrow_weight: number;
  trust_weight: number;
  complaints_weight: number;
  execution_weight: number;
  financial_weight: number;
  system_health_weight: number;
  summary: string;
}

export interface PlatformOperationsCenterView {
  overview: OperationsOverviewView;
  contracts: ContractOperationsViewDto;
  escrow: EscrowOperationsViewDto;
  trust: TrustOperationsViewDto;
  complaints: ComplaintOperationsViewDto;
  execution: ExecutionOperationsViewDto;
  financial: FinancialOperationsViewDto;
  system_health: SystemHealthViewDto;
  risk_register: OperationalRiskRegisterView;
  recommendations: OperationalRecommendationsView;
  operations_score: OperationsScoreView;
  generated_at: string;
}

export function toOperationsOverviewView(overview: OperationsOverview): OperationsOverviewView {
  return {
    headline: overview.headline,
    operations_score: overview.operationsScore,
    active_users: overview.activeUsers,
    active_providers: overview.activeProviders,
    active_contracts: overview.activeContracts,
    open_issues: overview.openIssues,
    open_complaints: overview.openComplaints,
    escrow_volume_minor: overview.escrowVolumeMinor,
    platform_activity_score: overview.platformActivityScore,
    summary: overview.summary,
  };
}

export function toContractOperationsViewDto(view: ContractOperationsView): ContractOperationsViewDto {
  return {
    total_contracts: view.totalContracts,
    active_contracts: view.activeContracts,
    completed_contracts: view.completedContracts,
    disputed_contracts: view.disputedContracts,
    cancelled_contracts: view.cancelledContracts,
    summary: view.summary,
  };
}

export function toEscrowOperationsViewDto(view: EscrowOperationsView): EscrowOperationsViewDto {
  return {
    active_escrows: view.activeEscrows,
    funded_escrows: view.fundedEscrows,
    held_escrows: view.heldEscrows,
    frozen_escrows: view.frozenEscrows,
    released_escrows: view.releasedEscrows,
    escrow_volume_minor: view.escrowVolumeMinor,
    summary: view.summary,
  };
}

export function toTrustOperationsViewDto(view: TrustOperationsView): TrustOperationsViewDto {
  return {
    trust_events: view.trustEvents,
    evaluations: view.evaluations,
    disputes: view.disputes,
    trust_warnings: view.trustWarnings,
    trust_recovery_events: view.trustRecoveryEvents,
    summary: view.summary,
  };
}

export function toComplaintOperationsViewDto(
  view: ComplaintOperationsView
): ComplaintOperationsViewDto {
  return {
    open_complaints: view.openComplaints,
    resolved_complaints: view.resolvedComplaints,
    escalation_count: view.escalationCount,
    complaint_health_score: view.complaintHealthScore,
    summary: view.summary,
  };
}

export function toExecutionOperationsViewDto(
  view: ExecutionOperationsView
): ExecutionOperationsViewDto {
  return {
    milestones_submitted: view.milestonesSubmitted,
    milestones_accepted: view.milestonesAccepted,
    pending_acceptance: view.pendingAcceptance,
    execution_health_score: view.executionHealthScore,
    summary: view.summary,
  };
}

export function toFinancialOperationsViewDto(
  view: FinancialOperationsView
): FinancialOperationsViewDto {
  return {
    transaction_count: view.transactionCount,
    platform_fees_minor: view.platformFeesMinor,
    escrow_balances_minor: view.escrowBalancesMinor,
    refunds: view.refunds,
    financial_activity_score: view.financialActivityScore,
    summary: view.summary,
  };
}

export function toSystemHealthViewDto(view: SystemHealthView): SystemHealthViewDto {
  return {
    route_count: view.routeCount,
    module_count: view.moduleCount,
    verification_chain_status: view.verificationChainStatus,
    dependency_health: view.dependencyHealth,
    operational_health_score: view.operationalHealthScore,
    summary: view.summary,
  };
}

export function toOperationalRiskView(risk: OperationalRisk): OperationalRiskView {
  return {
    category: risk.category,
    severity: risk.severity,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toOperationalRiskRegisterView(
  register: OperationalRiskRegister
): OperationalRiskRegisterView {
  return {
    risks: register.risks.map(toOperationalRiskView),
    summary: register.summary,
  };
}

export function toOperationalRecommendationView(
  recommendation: OperationalRecommendation
): OperationalRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toOperationalRecommendationsView(
  recommendations: OperationalRecommendations
): OperationalRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toOperationalRecommendationView),
    today: recommendations.today.map(toOperationalRecommendationView),
    this_week: recommendations.thisWeek.map(toOperationalRecommendationView),
    this_month: recommendations.thisMonth.map(toOperationalRecommendationView),
    summary: recommendations.summary,
  };
}

export function toOperationsScoreView(score: OperationsScore): OperationsScoreView {
  return {
    score: score.score,
    contracts_weight: score.contractsWeight,
    escrow_weight: score.escrowWeight,
    trust_weight: score.trustWeight,
    complaints_weight: score.complaintsWeight,
    execution_weight: score.executionWeight,
    financial_weight: score.financialWeight,
    system_health_weight: score.systemHealthWeight,
    summary: score.summary,
  };
}

export function toPlatformOperationsCenterView(
  center: PlatformOperationsCenter
): PlatformOperationsCenterView {
  return {
    overview: toOperationsOverviewView(center.overview),
    contracts: toContractOperationsViewDto(center.contracts),
    escrow: toEscrowOperationsViewDto(center.escrow),
    trust: toTrustOperationsViewDto(center.trust),
    complaints: toComplaintOperationsViewDto(center.complaints),
    execution: toExecutionOperationsViewDto(center.execution),
    financial: toFinancialOperationsViewDto(center.financial),
    system_health: toSystemHealthViewDto(center.systemHealth),
    risk_register: toOperationalRiskRegisterView(center.riskRegister),
    recommendations: toOperationalRecommendationsView(center.recommendations),
    operations_score: toOperationsScoreView(center.operationsScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
