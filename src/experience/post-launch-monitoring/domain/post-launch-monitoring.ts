import type { LaunchSimulationSnapshot } from "../../launch-simulation/domain/launch-simulation.js";
import { findScenarioSimulation } from "../../launch-simulation/domain/launch-simulation.js";
import type {
  LaunchControlSnapshot,
  LaunchDecisionStatus,
  LaunchStatus,
} from "../../launch-control/domain/launch-control.js";
import type { MissionControlSnapshot } from "../../mission-control/domain/mission-control.js";
import type { PlatformOperationsSnapshot } from "../../platform-operations/domain/platform-operations.js";
import type { ProductionReadinessSnapshot } from "../../production-readiness/domain/production-readiness.js";
import type { SecurityReadinessSnapshot } from "../../security-readiness/domain/security-readiness.js";

export type MonitoringStatus = "healthy" | "attention" | "critical";
export type GrowthStatus = "ahead" | "on_track" | "behind" | "at_risk";
export type WarningSeverity = "low" | "medium" | "high" | "critical";
export type WarningCategory = "growth" | "operational" | "trust" | "security";
export type RecommendationHorizon = "immediate" | "today" | "this_week" | "this_month";

export interface PostLaunchMonitoringRawSnapshot {
  launchSimulation: LaunchSimulationSnapshot;
  missionControl: MissionControlSnapshot;
  production: ProductionReadinessSnapshot;
  security: SecurityReadinessSnapshot;
  operations: PlatformOperationsSnapshot;
  launchControl: LaunchControlSnapshot;
}

export interface PostLaunchOverview {
  launchStatus: LaunchStatus;
  monitoringScore: number;
  launchDecision: LaunchDecisionStatus;
  confidenceScore: number;
  generatedAt: Date;
  summary: string;
}

export interface First24HoursMonitoring {
  expectedUsers: number;
  actualUsers: number;
  contractVolume: number;
  trustEvents: number;
  complaintEvents: number;
  platformHealth: number;
  summary: string;
}

export interface FirstWeekMonitoring {
  growthRate: number;
  retentionSignal: number;
  executionHealth: number;
  escrowHealth: number;
  operationalWarnings: number;
  summary: string;
}

export interface FirstMonthMonitoring {
  marketplaceHealth: number;
  revenueSignal: number;
  trustSignal: number;
  platformStability: number;
  launchSuccessIndicator: number;
  summary: string;
}

export interface UserGrowthMonitoring {
  projectedGrowth: number;
  actualGrowth: number;
  variance: number;
  growthStatus: GrowthStatus;
  summary: string;
}

export interface OperationsMonitoring {
  activeContracts: number;
  escrowVolume: number;
  issueCount: number;
  completionRate: number;
  operationalScore: number;
  summary: string;
}

export interface SecurityMonitoring {
  securityScore: number;
  auditabilityScore: number;
  complianceScore: number;
  securityWarnings: number;
  summary: string;
}

export interface EarlyWarningEntry {
  category: WarningCategory;
  severity: WarningSeverity;
  message: string;
  mitigation: string;
}

export interface EarlyWarningSystem {
  growthRisks: EarlyWarningEntry[];
  operationalRisks: EarlyWarningEntry[];
  trustRisks: EarlyWarningEntry[];
  securityRisks: EarlyWarningEntry[];
  summary: string;
}

export interface SuccessIndicators {
  launchSuccessScore: number;
  adoptionSignal: number;
  trustSignal: number;
  executionSignal: number;
  financialSignal: number;
  summary: string;
}

export interface ExecutiveRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ExecutiveRecommendations {
  immediate: ExecutiveRecommendation[];
  today: ExecutiveRecommendation[];
  thisWeek: ExecutiveRecommendation[];
  thisMonth: ExecutiveRecommendation[];
  summary: string;
}

export interface MonitoringScore {
  score: number;
  growthWeight: number;
  operationsWeight: number;
  trustWeight: number;
  securityWeight: number;
  financialWeight: number;
  stabilityWeight: number;
  summary: string;
}

export interface PostLaunchMonitoringSnapshot {
  overview: PostLaunchOverview;
  first24Hours: First24HoursMonitoring;
  firstWeek: FirstWeekMonitoring;
  firstMonth: FirstMonthMonitoring;
  userGrowth: UserGrowthMonitoring;
  operationsMonitoring: OperationsMonitoring;
  securityMonitoring: SecurityMonitoring;
  earlyWarnings: EarlyWarningSystem;
  successIndicators: SuccessIndicators;
  recommendations: ExecutiveRecommendations;
  monitoringScore: MonitoringScore;
  generatedAt: Date;
}

export interface PostLaunchMonitoringCenter {
  overview: PostLaunchOverview;
  first24Hours: First24HoursMonitoring;
  firstWeek: FirstWeekMonitoring;
  firstMonth: FirstMonthMonitoring;
  userGrowth: UserGrowthMonitoring;
  operationsMonitoring: OperationsMonitoring;
  securityMonitoring: SecurityMonitoring;
  earlyWarnings: EarlyWarningSystem;
  successIndicators: SuccessIndicators;
  recommendations: ExecutiveRecommendations;
  monitoringScore: MonitoringScore;
  generatedAt: Date;
}

export const POST_LAUNCH_MONITORING_ROUTES = [
  "/post-launch-monitoring",
  "/post-launch-monitoring/overview",
  "/post-launch-monitoring/day-1",
  "/post-launch-monitoring/week-1",
  "/post-launch-monitoring/month-1",
  "/post-launch-monitoring/growth",
  "/post-launch-monitoring/operations",
  "/post-launch-monitoring/security",
  "/post-launch-monitoring/warnings",
  "/post-launch-monitoring/success",
  "/post-launch-monitoring/recommendations",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function percentChange(current: number, prior: number): number {
  if (prior <= 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - prior) / prior) * 100);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreAuditability(security: SecurityReadinessSnapshot): number {
  const auditability = security.auditability;
  return Math.round(
    auditability.loggingReadiness * 0.35 +
      auditability.eventTrackingReadiness * 0.3 +
      auditability.auditReadiness * 0.35
  );
}

function scoreCompliance(security: SecurityReadinessSnapshot): number {
  const compliance = security.compliance;
  return Math.round(
    (compliance.privacyReadiness +
      compliance.consentReadiness +
      compliance.contractReadiness +
      compliance.evidenceReadiness +
      compliance.termsReadiness) /
      5
  );
}

function growthStatusFromVariance(variance: number): GrowthStatus {
  if (variance >= 15) return "ahead";
  if (variance >= -10) return "on_track";
  if (variance >= -25) return "behind";
  return "at_risk";
}

function monitoringStatusFromScore(score: number): MonitoringStatus {
  if (score >= 75) return "healthy";
  if (score >= 55) return "attention";
  return "critical";
}

function completionRate(operations: PlatformOperationsSnapshot): number {
  const total = operations.contracts.totalContracts;
  if (total <= 0) return 0;
  return Math.round((operations.contracts.completedContracts / total) * 100);
}

function escrowHealthScore(operations: PlatformOperationsSnapshot): number {
  const frozenPenalty = operations.escrow.frozenEscrows * 15;
  const fundedBonus = operations.escrow.fundedEscrows > 0 ? 20 : 0;
  return clamp(operations.operationsScore.score - frozenPenalty + fundedBonus, 0, 100);
}

export function buildPostLaunchOverview(input: {
  launchControl: LaunchControlSnapshot;
  monitoringScore: MonitoringScore;
  generatedAt: Date;
}): PostLaunchOverview {
  return {
    launchStatus: input.launchControl.overview.launchStatus,
    monitoringScore: input.monitoringScore.score,
    launchDecision: input.launchControl.decision.decision,
    confidenceScore: input.launchControl.confidenceScore.score,
    generatedAt: input.generatedAt,
    summary: `Post-launch overview: monitoring score ${input.monitoringScore.score}, launch decision ${input.launchControl.decision.decision}, confidence ${input.launchControl.confidenceScore.score}.`,
  };
}

export function buildFirst24HoursMonitoring(input: {
  launchSimulation: LaunchSimulationSnapshot;
  operations: PlatformOperationsSnapshot;
}): First24HoursMonitoring {
  const dayOneScenario = findScenarioSimulation(
    input.launchSimulation.scenarios,
    "expected",
    "1k"
  );
  const expectedUsers = Math.max(
    input.launchSimulation.baseline.activeUsers,
    dayOneScenario ? Math.round(dayOneScenario.targetUsers / 30) : 0
  );
  const actualUsers = input.operations.overview.activeUsers;
  const contractVolume =
    input.operations.contracts.activeContracts +
    input.operations.contracts.completedContracts;

  return {
    expectedUsers,
    actualUsers,
    contractVolume,
    trustEvents: input.operations.trust.trustEvents,
    complaintEvents:
      input.operations.complaints.openComplaints +
      input.operations.complaints.resolvedComplaints,
    platformHealth: input.operations.systemHealth.operationalHealthScore,
    summary: `First 24 hours: ${actualUsers}/${expectedUsers} users, ${contractVolume} contracts, platform health ${input.operations.systemHealth.operationalHealthScore}.`,
  };
}

export function buildFirstWeekMonitoring(input: {
  operations: PlatformOperationsSnapshot;
  launchSimulation: LaunchSimulationSnapshot;
}): FirstWeekMonitoring {
  const growthRate = percentChange(
    input.operations.overview.activeUsers,
    input.launchSimulation.baseline.activeUsers
  );
  const retentionSignal = clamp(
    100 -
      input.operations.complaints.openComplaints * 10 -
      input.operations.contracts.disputedContracts * 8,
    0,
    100
  );

  return {
    growthRate,
    retentionSignal,
    executionHealth: input.operations.execution.executionHealthScore,
    escrowHealth: escrowHealthScore(input.operations),
    operationalWarnings: input.operations.riskRegister.risks.length,
    summary: `First week: growth ${growthRate}%, retention signal ${retentionSignal}, ${input.operations.riskRegister.risks.length} operational warnings.`,
  };
}

export function buildFirstMonthMonitoring(input: {
  launchSimulation: LaunchSimulationSnapshot;
  missionControl: MissionControlSnapshot;
  operations: PlatformOperationsSnapshot;
  launchControl: LaunchControlSnapshot;
}): FirstMonthMonitoring {
  const marketplaceHealth = input.missionControl.overview.marketplaceHealthScore;
  const revenueSignal = clamp(
    Math.round(input.operations.financial.financialActivityScore * 0.7 +
      input.launchSimulation.baseline.marketplaceHealthScore * 0.3),
    0,
    100
  );
  const trustSignal = clamp(
    average([
      input.operations.trust.trustWarnings === 0 ? 85 : 55,
      input.launchSimulation.baseline.trustHealthScore,
      100 - input.operations.trust.disputes * 5,
    ]),
    0,
    100
  );
  const platformStability = clamp(
    average([
      input.operations.systemHealth.operationalHealthScore,
      input.launchControl.productionReview.score,
      input.launchControl.operationsReview.score,
    ]),
    0,
    100
  );
  const launchSuccessIndicator = clamp(
    Math.round(
      marketplaceHealth * 0.25 +
        revenueSignal * 0.2 +
        trustSignal * 0.2 +
        platformStability * 0.2 +
        input.launchControl.confidenceScore.score * 0.15
    ),
    0,
    100
  );

  return {
    marketplaceHealth,
    revenueSignal,
    trustSignal,
    platformStability,
    launchSuccessIndicator,
    summary: `First month: launch success indicator ${launchSuccessIndicator}, marketplace health ${marketplaceHealth}, platform stability ${platformStability}.`,
  };
}

export function buildUserGrowthMonitoring(input: {
  launchSimulation: LaunchSimulationSnapshot;
  missionControl: MissionControlSnapshot;
  operations: PlatformOperationsSnapshot;
}): UserGrowthMonitoring {
  const projectedGrowth = clamp(
    Math.round(
      input.missionControl.growth.userGrowthReadiness * 0.4 +
        input.missionControl.growth.simulationConfidence * 0.3 +
        input.launchSimulation.baseline.marketplaceHealthScore * 0.3
    ),
    0,
    100
  );
  const actualGrowth = clamp(
    percentChange(
      input.operations.overview.activeUsers,
      input.launchSimulation.baseline.activeUsers
    ) + 50,
    0,
    100
  );
  const variance = actualGrowth - projectedGrowth;

  return {
    projectedGrowth,
    actualGrowth,
    variance,
    growthStatus: growthStatusFromVariance(variance),
    summary: `User growth monitoring: projected ${projectedGrowth}, actual ${actualGrowth}, variance ${variance}, status ${growthStatusFromVariance(variance)}.`,
  };
}

export function buildOperationsMonitoring(
  operations: PlatformOperationsSnapshot
): OperationsMonitoring {
  return {
    activeContracts: operations.contracts.activeContracts,
    escrowVolume: operations.escrow.escrowVolumeMinor,
    issueCount: operations.complaints.openComplaints + operations.complaints.escalationCount,
    completionRate: completionRate(operations),
    operationalScore: operations.operationsScore.score,
    summary: `Operations monitoring: ${operations.contracts.activeContracts} active contracts, operational score ${operations.operationsScore.score}, completion rate ${completionRate(operations)}%.`,
  };
}

export function buildSecurityMonitoring(
  security: SecurityReadinessSnapshot
): SecurityMonitoring {
  const auditabilityScore = scoreAuditability(security);
  const complianceScore = scoreCompliance(security);

  return {
    securityScore: security.readinessScore.securityReadinessScore,
    auditabilityScore,
    complianceScore,
    securityWarnings:
      security.riskRegister.critical.length +
      security.riskRegister.high.length +
      security.riskRegister.medium.length,
    summary: `Security monitoring: score ${security.readinessScore.securityReadinessScore}, auditability ${auditabilityScore}, compliance ${complianceScore}.`,
  };
}

export function buildEarlyWarningSystem(input: {
  userGrowth: UserGrowthMonitoring;
  operations: PlatformOperationsSnapshot;
  security: SecurityReadinessSnapshot;
  launchSimulation: LaunchSimulationSnapshot;
}): EarlyWarningSystem {
  const growthRisks: EarlyWarningEntry[] = [];
  const operationalRisks: EarlyWarningEntry[] = [];
  const trustRisks: EarlyWarningEntry[] = [];
  const securityRisks: EarlyWarningEntry[] = [];

  if (input.userGrowth.growthStatus === "at_risk" || input.userGrowth.growthStatus === "behind") {
    growthRisks.push({
      category: "growth",
      severity: input.userGrowth.growthStatus === "at_risk" ? "high" : "medium",
      message: `User growth variance ${input.userGrowth.variance} against projected launch trajectory.`,
      mitigation: "Review acquisition channels and provider supply against launch simulation targets.",
    });
  }

  for (const bottleneck of input.launchSimulation.bottlenecks.filter(
    (entry) => entry.severity === "high" || entry.severity === "critical"
  ).slice(0, 3)) {
    growthRisks.push({
      category: "growth",
      severity: bottleneck.severity,
      message: bottleneck.reason,
      mitigation: bottleneck.recommendedAction,
    });
  }

  for (const risk of input.operations.riskRegister.risks.slice(0, 5)) {
    const category: WarningCategory =
      risk.category === "trust"
        ? "trust"
        : risk.category === "complaint" || risk.category === "execution"
          ? "operational"
          : "operational";
    const bucket =
      category === "trust"
        ? trustRisks
        : category === "operational"
          ? operationalRisks
          : operationalRisks;
    bucket.push({
      category,
      severity:
        risk.severity === "critical"
          ? "critical"
          : risk.severity === "high"
            ? "high"
            : risk.severity === "medium"
              ? "medium"
              : "low",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.security.riskRegister.critical) {
    securityRisks.push({
      category: "security",
      severity: "critical",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  for (const risk of input.security.riskRegister.high.slice(0, 3)) {
    securityRisks.push({
      category: "security",
      severity: "high",
      message: risk.message,
      mitigation: risk.mitigation,
    });
  }

  if (input.operations.trust.disputes > 0) {
    trustRisks.push({
      category: "trust",
      severity: input.operations.trust.disputes >= 3 ? "high" : "medium",
      message: `${input.operations.trust.disputes} trust disputes detected post launch.`,
      mitigation: "Escalate dispute resolution and monitor trust recovery events.",
    });
  }

  return {
    growthRisks,
    operationalRisks,
    trustRisks,
    securityRisks,
    summary: `Early warning system: ${growthRisks.length} growth, ${operationalRisks.length} operational, ${trustRisks.length} trust, ${securityRisks.length} security risks.`,
  };
}

export function buildSuccessIndicators(input: {
  userGrowth: UserGrowthMonitoring;
  operations: PlatformOperationsSnapshot;
  security: SecurityReadinessSnapshot;
  firstMonth: FirstMonthMonitoring;
  launchControl: LaunchControlSnapshot;
}): SuccessIndicators {
  const adoptionSignal = clamp(
    average([input.userGrowth.actualGrowth, input.operations.overview.platformActivityScore]),
    0,
    100
  );
  const trustSignal = input.firstMonth.trustSignal;
  const executionSignal = input.operations.execution.executionHealthScore;
  const financialSignal = input.operations.financial.financialActivityScore;
  const launchSuccessScore = clamp(
    Math.round(
      adoptionSignal * 0.25 +
        trustSignal * 0.2 +
        executionSignal * 0.2 +
        financialSignal * 0.2 +
        input.launchControl.confidenceScore.score * 0.15
    ),
    0,
    100
  );

  return {
    launchSuccessScore,
    adoptionSignal,
    trustSignal,
    executionSignal,
    financialSignal,
    summary: `Success indicators: launch success score ${launchSuccessScore}, adoption ${adoptionSignal}, trust ${trustSignal}.`,
  };
}

export function buildExecutiveRecommendations(input: {
  missionControl: MissionControlSnapshot;
  operations: PlatformOperationsSnapshot;
  earlyWarnings: EarlyWarningSystem;
  monitoringScore: MonitoringScore;
}): ExecutiveRecommendations {
  const immediate: ExecutiveRecommendation[] = input.operations.recommendations.immediate
    .slice(0, 3)
    .map((item) => ({
      horizon: "immediate" as const,
      title: item.title,
      reason: item.reason,
      action: item.action,
    }));

  for (const risk of input.earlyWarnings.securityRisks.filter(
    (entry) => entry.severity === "critical"
  ).slice(0, 2)) {
    immediate.push({
      horizon: "immediate",
      title: risk.message,
      reason: "security early warning",
      action: risk.mitigation,
    });
  }

  const today = input.missionControl.actionQueue.groups
    .find((group) => group.horizon === "today")
    ?.actions.slice(0, 3)
    .map((item) => ({
      horizon: "today" as const,
      title: item.actionTitle,
      reason: item.reason,
      action: item.expectedImpact,
    })) ?? [];

  const thisWeek = input.missionControl.actionQueue.groups
    .find((group) => group.horizon === "this_week")
    ?.actions.slice(0, 3)
    .map((item) => ({
      horizon: "this_week" as const,
      title: item.actionTitle,
      reason: item.reason,
      action: item.expectedImpact,
    })) ?? [];

  if (input.monitoringScore.score < 75) {
    thisWeek.unshift({
      horizon: "this_week",
      title: "Improve post-launch monitoring score",
      reason: "monitoring score below target",
      action: "Address growth, operations, and security warnings surfaced in the monitoring center.",
    });
  }

  const thisMonth = input.missionControl.actionQueue.groups
    .find((group) => group.horizon === "this_month")
    ?.actions.slice(0, 3)
    .map((item) => ({
      horizon: "this_month" as const,
      title: item.actionTitle,
      reason: item.reason,
      action: item.expectedImpact,
    })) ?? [];

  return {
    immediate,
    today,
    thisWeek,
    thisMonth,
    summary: `Executive recommendations grouped ${immediate.length} immediate, ${today.length} today, ${thisWeek.length} this week, ${thisMonth.length} this month actions.`,
  };
}

export function computeMonitoringScore(input: {
  userGrowth: UserGrowthMonitoring;
  operations: PlatformOperationsSnapshot;
  security: SecurityReadinessSnapshot;
  production: ProductionReadinessSnapshot;
  firstMonth: FirstMonthMonitoring;
}): MonitoringScore {
  const growthWeight = 20;
  const operationsWeight = 20;
  const trustWeight = 15;
  const securityWeight = 15;
  const financialWeight = 15;
  const stabilityWeight = 15;

  const growthScore = clamp(input.userGrowth.actualGrowth, 0, 100);
  const operationsScore = input.operations.operationsScore.score;
  const trustScore = input.firstMonth.trustSignal;
  const securityScore = input.security.readinessScore.securityReadinessScore;
  const financialScore = input.operations.financial.financialActivityScore;
  const stabilityScore = clamp(
    average([
      input.production.readinessScore.score,
      input.operations.systemHealth.operationalHealthScore,
      input.firstMonth.platformStability,
    ]),
    0,
    100
  );

  const score = clamp(
    Math.round(
      growthScore * (growthWeight / 100) +
        operationsScore * (operationsWeight / 100) +
        trustScore * (trustWeight / 100) +
        securityScore * (securityWeight / 100) +
        financialScore * (financialWeight / 100) +
        stabilityScore * (stabilityWeight / 100)
    ),
    0,
    100
  );

  return {
    score,
    growthWeight,
    operationsWeight,
    trustWeight,
    securityWeight,
    financialWeight,
    stabilityWeight,
    summary: `Monitoring score ${score} weighted across growth (${growthWeight}%), operations (${operationsWeight}%), trust (${trustWeight}%), security (${securityWeight}%), financial (${financialWeight}%), and stability (${stabilityWeight}%). Status: ${monitoringStatusFromScore(score)}.`,
  };
}

export function buildPostLaunchMonitoringSnapshot(input: {
  raw: PostLaunchMonitoringRawSnapshot;
  generatedAt?: Date;
}): PostLaunchMonitoringSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const first24Hours = buildFirst24HoursMonitoring({
    launchSimulation: input.raw.launchSimulation,
    operations: input.raw.operations,
  });
  const firstWeek = buildFirstWeekMonitoring({
    operations: input.raw.operations,
    launchSimulation: input.raw.launchSimulation,
  });
  const firstMonth = buildFirstMonthMonitoring({
    launchSimulation: input.raw.launchSimulation,
    missionControl: input.raw.missionControl,
    operations: input.raw.operations,
    launchControl: input.raw.launchControl,
  });
  const userGrowth = buildUserGrowthMonitoring({
    launchSimulation: input.raw.launchSimulation,
    missionControl: input.raw.missionControl,
    operations: input.raw.operations,
  });
  const operationsMonitoring = buildOperationsMonitoring(input.raw.operations);
  const securityMonitoring = buildSecurityMonitoring(input.raw.security);
  const monitoringScore = computeMonitoringScore({
    userGrowth,
    operations: input.raw.operations,
    security: input.raw.security,
    production: input.raw.production,
    firstMonth,
  });
  const earlyWarnings = buildEarlyWarningSystem({
    userGrowth,
    operations: input.raw.operations,
    security: input.raw.security,
    launchSimulation: input.raw.launchSimulation,
  });
  const successIndicators = buildSuccessIndicators({
    userGrowth,
    operations: input.raw.operations,
    security: input.raw.security,
    firstMonth,
    launchControl: input.raw.launchControl,
  });
  const recommendations = buildExecutiveRecommendations({
    missionControl: input.raw.missionControl,
    operations: input.raw.operations,
    earlyWarnings,
    monitoringScore,
  });
  const overview = buildPostLaunchOverview({
    launchControl: input.raw.launchControl,
    monitoringScore,
    generatedAt,
  });

  return {
    overview,
    first24Hours,
    firstWeek,
    firstMonth,
    userGrowth,
    operationsMonitoring,
    securityMonitoring,
    earlyWarnings,
    successIndicators,
    recommendations,
    monitoringScore,
    generatedAt,
  };
}

export function buildPostLaunchMonitoringCenter(input: {
  snapshot: PostLaunchMonitoringSnapshot;
}): PostLaunchMonitoringCenter {
  return {
    overview: input.snapshot.overview,
    first24Hours: input.snapshot.first24Hours,
    firstWeek: input.snapshot.firstWeek,
    firstMonth: input.snapshot.firstMonth,
    userGrowth: input.snapshot.userGrowth,
    operationsMonitoring: input.snapshot.operationsMonitoring,
    securityMonitoring: input.snapshot.securityMonitoring,
    earlyWarnings: input.snapshot.earlyWarnings,
    successIndicators: input.snapshot.successIndicators,
    recommendations: input.snapshot.recommendations,
    monitoringScore: input.snapshot.monitoringScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export interface PostLaunchOverviewView {
  launch_status: LaunchStatus;
  monitoring_score: number;
  launch_decision: LaunchDecisionStatus;
  confidence_score: number;
  generated_at: string;
  summary: string;
}

export interface First24HoursMonitoringView {
  expected_users: number;
  actual_users: number;
  contract_volume: number;
  trust_events: number;
  complaint_events: number;
  platform_health: number;
  summary: string;
}

export interface FirstWeekMonitoringView {
  growth_rate: number;
  retention_signal: number;
  execution_health: number;
  escrow_health: number;
  operational_warnings: number;
  summary: string;
}

export interface FirstMonthMonitoringView {
  marketplace_health: number;
  revenue_signal: number;
  trust_signal: number;
  platform_stability: number;
  launch_success_indicator: number;
  summary: string;
}

export interface UserGrowthMonitoringView {
  projected_growth: number;
  actual_growth: number;
  variance: number;
  growth_status: GrowthStatus;
  summary: string;
}

export interface OperationsMonitoringView {
  active_contracts: number;
  escrow_volume: number;
  issue_count: number;
  completion_rate: number;
  operational_score: number;
  summary: string;
}

export interface SecurityMonitoringView {
  security_score: number;
  auditability_score: number;
  compliance_score: number;
  security_warnings: number;
  summary: string;
}

export interface EarlyWarningEntryView {
  category: WarningCategory;
  severity: WarningSeverity;
  message: string;
  mitigation: string;
}

export interface EarlyWarningSystemView {
  growth_risks: EarlyWarningEntryView[];
  operational_risks: EarlyWarningEntryView[];
  trust_risks: EarlyWarningEntryView[];
  security_risks: EarlyWarningEntryView[];
  summary: string;
}

export interface SuccessIndicatorsView {
  launch_success_score: number;
  adoption_signal: number;
  trust_signal: number;
  execution_signal: number;
  financial_signal: number;
  summary: string;
}

export interface ExecutiveRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface ExecutiveRecommendationsView {
  immediate: ExecutiveRecommendationView[];
  today: ExecutiveRecommendationView[];
  this_week: ExecutiveRecommendationView[];
  this_month: ExecutiveRecommendationView[];
  summary: string;
}

export interface MonitoringScoreView {
  score: number;
  growth_weight: number;
  operations_weight: number;
  trust_weight: number;
  security_weight: number;
  financial_weight: number;
  stability_weight: number;
  summary: string;
}

export interface PostLaunchMonitoringCenterView {
  overview: PostLaunchOverviewView;
  first_24_hours: First24HoursMonitoringView;
  first_week: FirstWeekMonitoringView;
  first_month: FirstMonthMonitoringView;
  user_growth: UserGrowthMonitoringView;
  operations_monitoring: OperationsMonitoringView;
  security_monitoring: SecurityMonitoringView;
  early_warnings: EarlyWarningSystemView;
  success_indicators: SuccessIndicatorsView;
  recommendations: ExecutiveRecommendationsView;
  monitoring_score: MonitoringScoreView;
  generated_at: string;
}

export function toPostLaunchOverviewView(overview: PostLaunchOverview): PostLaunchOverviewView {
  return {
    launch_status: overview.launchStatus,
    monitoring_score: overview.monitoringScore,
    launch_decision: overview.launchDecision,
    confidence_score: overview.confidenceScore,
    generated_at: overview.generatedAt.toISOString(),
    summary: overview.summary,
  };
}

export function toFirst24HoursMonitoringView(
  view: First24HoursMonitoring
): First24HoursMonitoringView {
  return {
    expected_users: view.expectedUsers,
    actual_users: view.actualUsers,
    contract_volume: view.contractVolume,
    trust_events: view.trustEvents,
    complaint_events: view.complaintEvents,
    platform_health: view.platformHealth,
    summary: view.summary,
  };
}

export function toFirstWeekMonitoringView(view: FirstWeekMonitoring): FirstWeekMonitoringView {
  return {
    growth_rate: view.growthRate,
    retention_signal: view.retentionSignal,
    execution_health: view.executionHealth,
    escrow_health: view.escrowHealth,
    operational_warnings: view.operationalWarnings,
    summary: view.summary,
  };
}

export function toFirstMonthMonitoringView(view: FirstMonthMonitoring): FirstMonthMonitoringView {
  return {
    marketplace_health: view.marketplaceHealth,
    revenue_signal: view.revenueSignal,
    trust_signal: view.trustSignal,
    platform_stability: view.platformStability,
    launch_success_indicator: view.launchSuccessIndicator,
    summary: view.summary,
  };
}

export function toUserGrowthMonitoringView(view: UserGrowthMonitoring): UserGrowthMonitoringView {
  return {
    projected_growth: view.projectedGrowth,
    actual_growth: view.actualGrowth,
    variance: view.variance,
    growth_status: view.growthStatus,
    summary: view.summary,
  };
}

export function toOperationsMonitoringView(view: OperationsMonitoring): OperationsMonitoringView {
  return {
    active_contracts: view.activeContracts,
    escrow_volume: view.escrowVolume,
    issue_count: view.issueCount,
    completion_rate: view.completionRate,
    operational_score: view.operationalScore,
    summary: view.summary,
  };
}

export function toSecurityMonitoringView(view: SecurityMonitoring): SecurityMonitoringView {
  return {
    security_score: view.securityScore,
    auditability_score: view.auditabilityScore,
    compliance_score: view.complianceScore,
    security_warnings: view.securityWarnings,
    summary: view.summary,
  };
}

export function toEarlyWarningEntryView(entry: EarlyWarningEntry): EarlyWarningEntryView {
  return {
    category: entry.category,
    severity: entry.severity,
    message: entry.message,
    mitigation: entry.mitigation,
  };
}

export function toEarlyWarningSystemView(system: EarlyWarningSystem): EarlyWarningSystemView {
  return {
    growth_risks: system.growthRisks.map(toEarlyWarningEntryView),
    operational_risks: system.operationalRisks.map(toEarlyWarningEntryView),
    trust_risks: system.trustRisks.map(toEarlyWarningEntryView),
    security_risks: system.securityRisks.map(toEarlyWarningEntryView),
    summary: system.summary,
  };
}

export function toSuccessIndicatorsView(view: SuccessIndicators): SuccessIndicatorsView {
  return {
    launch_success_score: view.launchSuccessScore,
    adoption_signal: view.adoptionSignal,
    trust_signal: view.trustSignal,
    execution_signal: view.executionSignal,
    financial_signal: view.financialSignal,
    summary: view.summary,
  };
}

export function toExecutiveRecommendationView(
  recommendation: ExecutiveRecommendation
): ExecutiveRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toExecutiveRecommendationsView(
  recommendations: ExecutiveRecommendations
): ExecutiveRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toExecutiveRecommendationView),
    today: recommendations.today.map(toExecutiveRecommendationView),
    this_week: recommendations.thisWeek.map(toExecutiveRecommendationView),
    this_month: recommendations.thisMonth.map(toExecutiveRecommendationView),
    summary: recommendations.summary,
  };
}

export function toMonitoringScoreView(score: MonitoringScore): MonitoringScoreView {
  return {
    score: score.score,
    growth_weight: score.growthWeight,
    operations_weight: score.operationsWeight,
    trust_weight: score.trustWeight,
    security_weight: score.securityWeight,
    financial_weight: score.financialWeight,
    stability_weight: score.stabilityWeight,
    summary: score.summary,
  };
}

export function toPostLaunchMonitoringCenterView(
  center: PostLaunchMonitoringCenter
): PostLaunchMonitoringCenterView {
  return {
    overview: toPostLaunchOverviewView(center.overview),
    first_24_hours: toFirst24HoursMonitoringView(center.first24Hours),
    first_week: toFirstWeekMonitoringView(center.firstWeek),
    first_month: toFirstMonthMonitoringView(center.firstMonth),
    user_growth: toUserGrowthMonitoringView(center.userGrowth),
    operations_monitoring: toOperationsMonitoringView(center.operationsMonitoring),
    security_monitoring: toSecurityMonitoringView(center.securityMonitoring),
    early_warnings: toEarlyWarningSystemView(center.earlyWarnings),
    success_indicators: toSuccessIndicatorsView(center.successIndicators),
    recommendations: toExecutiveRecommendationsView(center.recommendations),
    monitoring_score: toMonitoringScoreView(center.monitoringScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
