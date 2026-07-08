import {
  buildExecutiveCommandCenterSnapshot,
  type ExecutiveCommandCenterSnapshot,
} from "../../executive-command-center/domain/executive-command-center.js";
import {
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
  type DecisionUrgency,
  type StrategicOperatingRawSnapshot,
  type StrategicOperatingSystem,
  type StrategicSourceLayer,
} from "../../strategic-operating-system/domain/strategic-operating-system.js";
import {
  buildInvestorReadinessSnapshot,
  type InvestorReadinessSnapshot,
} from "../../investor-readiness/domain/investor-readiness.js";
import {
  buildLaunchSimulationSnapshot,
  findScenarioSimulation,
  type LaunchSimulationSnapshot,
} from "../../launch-simulation/domain/launch-simulation.js";
import type { GovernmentPartnershipSnapshot } from "../../government-partnership/domain/government-partnership.js";
import { buildGovernmentPartnershipSnapshot } from "../../government-partnership/domain/government-partnership.js";

export interface MissionControlRawSnapshot {
  strategicRaw: StrategicOperatingRawSnapshot;
}

export type ActionQueueHorizon = "immediate" | "today" | "this_week" | "this_month";

export type MissionControlStatus = "command_ready" | "developing" | "attention_required";

export interface MissionControlOverview {
  headline: string;
  missionScore: number;
  strategicOperatingScore: number;
  executiveHealthScore: number;
  releaseReadinessScore: number;
  marketplaceHealthScore: number;
  investorReadinessScore: number;
  governmentReadinessScore: number;
  summary: string;
}

export interface TopDecisionEntry {
  decision: string;
  urgency: DecisionUrgency;
  expectedImpact: string;
  sourceLayer: string;
}

export interface TopDecisionsPanel {
  decisions: TopDecisionEntry[];
  summary: string;
}

export interface TopRiskEntry {
  category: string;
  severity: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export interface TopRisksPanel {
  risks: TopRiskEntry[];
  summary: string;
}

export interface TopOpportunityEntry {
  category: string;
  valueScore: number;
  requiredAction: string;
  expectedOutcome: string;
}

export interface TopOpportunitiesPanel {
  opportunities: TopOpportunityEntry[];
  summary: string;
}

export interface GrowthCommandPanel {
  userGrowthReadiness: number;
  providerGrowthReadiness: number;
  marketplaceExpansionReadiness: number;
  simulationConfidence: number;
  summary: string;
}

export interface GovernmentPartnershipEntry {
  target: string;
  readinessScore: number;
  requiredNextAction: string;
}

export interface GovernmentCommandPanel {
  partnerships: GovernmentPartnershipEntry[];
  summary: string;
}

export interface InvestorCommandPanel {
  fundingReadinessScore: number;
  investorReadinessScore: number;
  strategicStrengths: string[];
  criticalGaps: string[];
  summary: string;
}

export interface OperationsAlert {
  code: string;
  label: string;
  message: string;
}

export interface OperationsCommandPanel {
  launchBlockers: OperationsAlert[];
  operationalWarnings: OperationsAlert[];
  trustAlerts: OperationsAlert[];
  escrowAlerts: OperationsAlert[];
  summary: string;
}

export interface ExecutiveActionQueueItem {
  actionTitle: string;
  reason: string;
  source: StrategicSourceLayer;
  expectedImpact: string;
  requiredOwnerRole: string;
}

export interface ExecutiveActionQueueGroup {
  horizon: ActionQueueHorizon;
  actions: ExecutiveActionQueueItem[];
}

export interface ExecutiveActionQueue {
  groups: ExecutiveActionQueueGroup[];
  summary: string;
}

export interface MissionControlScore {
  score: number;
  status: MissionControlStatus;
  strategicOperatingWeight: number;
  releaseWeight: number;
  executiveWeight: number;
  marketplaceWeight: number;
  investorWeight: number;
  governmentWeight: number;
  summary: string;
}

export interface MissionControlSnapshot {
  overview: MissionControlOverview;
  decisions: TopDecisionsPanel;
  risks: TopRisksPanel;
  opportunities: TopOpportunitiesPanel;
  growth: GrowthCommandPanel;
  government: GovernmentCommandPanel;
  investors: InvestorCommandPanel;
  operations: OperationsCommandPanel;
  actionQueue: ExecutiveActionQueue;
  missionScore: MissionControlScore;
  generatedAt: Date;
}

export interface MissionControlCenter {
  overview: MissionControlOverview;
  decisions: TopDecisionsPanel;
  risks: TopRisksPanel;
  opportunities: TopOpportunitiesPanel;
  growth: GrowthCommandPanel;
  government: GovernmentCommandPanel;
  investors: InvestorCommandPanel;
  operations: OperationsCommandPanel;
  actionQueue: ExecutiveActionQueue;
  missionScore: MissionControlScore;
  generatedAt: Date;
}

export interface MissionControlOverviewView {
  headline: string;
  mission_score: number;
  strategic_operating_score: number;
  executive_health_score: number;
  release_readiness_score: number;
  marketplace_health_score: number;
  investor_readiness_score: number;
  government_readiness_score: number;
  summary: string;
}

export interface TopDecisionEntryView {
  decision: string;
  urgency: DecisionUrgency;
  expected_impact: string;
  source_layer: string;
}

export interface TopDecisionsPanelView {
  decisions: TopDecisionEntryView[];
  summary: string;
}

export interface TopRiskEntryView {
  category: string;
  severity: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export interface TopRisksPanelView {
  risks: TopRiskEntryView[];
  summary: string;
}

export interface TopOpportunityEntryView {
  category: string;
  value_score: number;
  required_action: string;
  expected_outcome: string;
}

export interface TopOpportunitiesPanelView {
  opportunities: TopOpportunityEntryView[];
  summary: string;
}

export interface GrowthCommandPanelView {
  user_growth_readiness: number;
  provider_growth_readiness: number;
  marketplace_expansion_readiness: number;
  simulation_confidence: number;
  summary: string;
}

export interface GovernmentPartnershipEntryView {
  target: string;
  readiness_score: number;
  required_next_action: string;
}

export interface GovernmentCommandPanelView {
  partnerships: GovernmentPartnershipEntryView[];
  summary: string;
}

export interface InvestorCommandPanelView {
  funding_readiness_score: number;
  investor_readiness_score: number;
  strategic_strengths: string[];
  critical_gaps: string[];
  summary: string;
}

export interface OperationsAlertView {
  code: string;
  label: string;
  message: string;
}

export interface OperationsCommandPanelView {
  launch_blockers: OperationsAlertView[];
  operational_warnings: OperationsAlertView[];
  trust_alerts: OperationsAlertView[];
  escrow_alerts: OperationsAlertView[];
  summary: string;
}

export interface ExecutiveActionQueueItemView {
  action_title: string;
  reason: string;
  source: StrategicSourceLayer;
  expected_impact: string;
  required_owner_role: string;
}

export interface ExecutiveActionQueueGroupView {
  horizon: ActionQueueHorizon;
  actions: ExecutiveActionQueueItemView[];
}

export interface ExecutiveActionQueueView {
  groups: ExecutiveActionQueueGroupView[];
  summary: string;
}

export interface MissionControlScoreView {
  score: number;
  status: MissionControlStatus;
  strategic_operating_weight: number;
  release_weight: number;
  executive_weight: number;
  marketplace_weight: number;
  investor_weight: number;
  government_weight: number;
  summary: string;
}

export interface MissionControlCenterView {
  overview: MissionControlOverviewView;
  decisions: TopDecisionsPanelView;
  risks: TopRisksPanelView;
  opportunities: TopOpportunitiesPanelView;
  growth: GrowthCommandPanelView;
  government: GovernmentCommandPanelView;
  investors: InvestorCommandPanelView;
  operations: OperationsCommandPanelView;
  action_queue: ExecutiveActionQueueView;
  mission_score: MissionControlScoreView;
  generated_at: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMissionContext(raw: MissionControlRawSnapshot, generatedAt?: Date) {
  const strategicSnapshot = buildStrategicOperatingSnapshot({
    raw: raw.strategicRaw,
    generatedAt,
  });
  const strategic = buildStrategicOperatingSystem({ snapshot: strategicSnapshot });

  const investor = buildInvestorReadinessSnapshot({
    raw: raw.strategicRaw.governmentRaw.investorRaw,
    generatedAt,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: raw.strategicRaw.governmentRaw.investorRaw.launchRaw,
    generatedAt,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: raw.strategicRaw.governmentRaw.investorRaw.launchRaw.executiveRaw,
    generatedAt,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: raw.strategicRaw.governmentRaw,
    generatedAt,
  });

  return { strategicSnapshot, strategic, investor, simulation, executive, government };
}

export function computeMissionControlScore(input: {
  strategic: StrategicOperatingSystem;
  investor: InvestorReadinessSnapshot;
  government: GovernmentPartnershipSnapshot;
}): MissionControlScore {
  const strategicOperatingWeight = 25;
  const releaseWeight = 15;
  const executiveWeight = 15;
  const marketplaceWeight = 15;
  const investorWeight = 15;
  const governmentWeight = 15;

  const score = Math.round(
    input.strategic.operatingScore.score * (strategicOperatingWeight / 100) +
      input.investor.overview.releaseReadinessScore * (releaseWeight / 100) +
      input.investor.overview.executiveHealthScore * (executiveWeight / 100) +
      input.investor.overview.marketplaceHealthScore * (marketplaceWeight / 100) +
      input.investor.investorScore.score * (investorWeight / 100) +
      input.government.governmentScore.score * (governmentWeight / 100)
  );

  let status: MissionControlStatus = "attention_required";
  if (score >= 75) status = "command_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    strategicOperatingWeight,
    releaseWeight,
    executiveWeight,
    marketplaceWeight,
    investorWeight,
    governmentWeight,
    summary: `Mission control score ${score} (${status.replace("_", " ")}) across strategic operating, release, executive, marketplace, investor, and government dimensions.`,
  };
}

export function buildMissionControlOverview(input: {
  missionScore: MissionControlScore;
  strategic: StrategicOperatingSystem;
}): MissionControlOverview {
  return {
    headline: "APP13 mission control",
    missionScore: input.missionScore.score,
    strategicOperatingScore: input.strategic.operatingScore.score,
    executiveHealthScore: input.strategic.overview.executiveHealthScore,
    releaseReadinessScore: input.strategic.overview.releaseReadinessScore,
    marketplaceHealthScore: input.strategic.overview.marketplaceHealthScore,
    investorReadinessScore: input.strategic.overview.investorReadinessScore,
    governmentReadinessScore: input.strategic.overview.governmentReadinessScore,
    summary: `Mission control overview with score ${input.missionScore.score}, strategic operating ${input.strategic.operatingScore.score}, and executive health ${input.strategic.overview.executiveHealthScore}.`,
  };
}

export function buildTopDecisionsPanel(input: {
  strategic: StrategicOperatingSystem;
}): TopDecisionsPanel {
  const decisions: TopDecisionEntry[] = input.strategic.decisionBrief.decisions.map((entry) => ({
    decision: entry.decision,
    urgency: entry.urgency,
    expectedImpact: entry.expectedEffect,
    sourceLayer: entry.dependency,
  }));

  return {
    decisions: decisions.slice(0, 5),
    summary: `Top decisions panel presents ${Math.min(decisions.length, 5)} leadership decisions requiring immediate attention.`,
  };
}

export function buildTopRisksPanel(input: {
  strategic: StrategicOperatingSystem;
}): TopRisksPanel {
  const risks: TopRiskEntry[] = input.strategic.riskRegister.risks.map((entry) => ({
    category: entry.category,
    severity: entry.severity,
    probability: entry.probability,
    impact: entry.impact,
    mitigation: entry.mitigationAction,
  }));

  return {
    risks: risks.slice(0, 10),
    summary: `Top risks panel tracks ${Math.min(risks.length, 10)} highest-priority risks across the platform.`,
  };
}

export function buildTopOpportunitiesPanel(input: {
  strategic: StrategicOperatingSystem;
}): TopOpportunitiesPanel {
  const opportunities: TopOpportunityEntry[] = input.strategic.opportunityMap.opportunities.map(
    (entry) => ({
      category: entry.category,
      valueScore: entry.opportunityScore,
      requiredAction: entry.requiredAction,
      expectedOutcome: entry.expectedBenefit,
    })
  );

  return {
    opportunities,
    summary: `Top opportunities panel highlights ${opportunities.length} strategic growth vectors ranked by value score.`,
  };
}

export function buildGrowthCommandPanel(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
}): GrowthCommandPanel {
  const expected100k = findScenarioSimulation(input.simulation.scenarios, "expected", "100k");
  const userGrowthReadiness =
    expected100k?.simulationScore ?? input.investor.scaleReadiness.launchReadinessScore;

  const providerGrowthReadiness = clamp(
    Math.round(
      input.executive.marketplace.availableProviders * 15 +
        input.executive.marketplace.healthScore * 0.5
    ),
    0,
    100
  );

  return {
    userGrowthReadiness,
    providerGrowthReadiness,
    marketplaceExpansionReadiness: input.investor.overview.marketplaceHealthScore,
    simulationConfidence: input.investor.scaleReadiness.simulationConfidenceScore,
    summary: `Growth command panel: user readiness ${userGrowthReadiness}, provider readiness ${providerGrowthReadiness}, marketplace expansion ${input.investor.overview.marketplaceHealthScore}.`,
  };
}

export function buildGovernmentCommandPanel(input: {
  government: GovernmentPartnershipSnapshot;
}): GovernmentCommandPanel {
  const partnerships: GovernmentPartnershipEntry[] = input.government.partnershipMatrix.entries
    .sort((left, right) => right.readinessScore - left.readinessScore)
    .slice(0, 5)
    .map((entry) => ({
      target: entry.target,
      readinessScore: entry.readinessScore,
      requiredNextAction: entry.requiredActions[0] ?? entry.nextMilestone,
    }));

  return {
    partnerships,
    summary: `Government command panel tracks ${partnerships.length} top partnership targets with government readiness ${input.government.governmentScore.score}.`,
  };
}

export function buildInvestorCommandPanel(input: {
  investor: InvestorReadinessSnapshot;
}): InvestorCommandPanel {
  const recommendedStage = input.investor.fundingReadiness.stages.find(
    (entry) => entry.stage === input.investor.fundingReadiness.recommendedStage
  );
  const fundingReadinessScore = recommendedStage?.readinessScore ?? input.investor.investorScore.score;

  const criticalGaps = input.investor.riskMatrix.entries
    .filter((entry) => entry.severity !== "low")
    .map((entry) => entry.label);

  for (const target of input.investor.partnershipReadiness.targets) {
    if (target.readinessScore < 55) {
      criticalGaps.push(`${target.target.replace(/_/g, " ")} partnership gap`);
    }
  }

  return {
    fundingReadinessScore,
    investorReadinessScore: input.investor.investorScore.score,
    strategicStrengths: input.investor.strengths.slice(0, 5).map((entry) => entry.title),
    criticalGaps: criticalGaps.slice(0, 8),
    summary: `Investor command panel: funding readiness ${fundingReadinessScore}, investor score ${input.investor.investorScore.score}, ${criticalGaps.length} critical gaps identified.`,
  };
}

export function buildOperationsCommandPanel(input: {
  executive: ExecutiveCommandCenterSnapshot;
}): OperationsCommandPanel {
  const launchBlockers: OperationsAlert[] = input.executive.blockers
    .filter((entry) => entry.category === "release_readiness")
    .map((entry) => ({
      code: entry.code,
      label: entry.label,
      message: entry.message,
    }));

  const operationalWarnings: OperationsAlert[] = input.executive.warnings.map((entry) => ({
    code: entry.code,
    label: entry.label,
    message: entry.message,
  }));

  const trustAlerts: OperationsAlert[] = [];
  if (input.executive.trust.lowTrustProviderCount > 0) {
    trustAlerts.push({
      code: "low-trust-providers",
      label: "Low-trust providers",
      message: `${input.executive.trust.lowTrustProviderCount} provider${input.executive.trust.lowTrustProviderCount === 1 ? "" : "s"} below trust threshold.`,
    });
  }
  if (input.executive.trust.averageTrustScore < 70) {
    trustAlerts.push({
      code: "trust-score-attention",
      label: "Trust score attention",
      message: `Average trust score ${input.executive.trust.averageTrustScore} requires monitoring.`,
    });
  }

  const escrowAlerts: OperationsAlert[] = [];
  if (input.executive.financial.frozenEscrowCount > 0) {
    escrowAlerts.push({
      code: "frozen-escrows",
      label: "Frozen escrows",
      message: `${input.executive.financial.frozenEscrowCount} escrow${input.executive.financial.frozenEscrowCount === 1 ? "" : "s"} frozen pending resolution.`,
    });
  }
  if (input.executive.financial.pendingFundingCount > 0) {
    escrowAlerts.push({
      code: "pending-funding",
      label: "Pending funding",
      message: `${input.executive.financial.pendingFundingCount} escrow${input.executive.financial.pendingFundingCount === 1 ? "" : "s"} awaiting funding.`,
    });
  }

  return {
    launchBlockers,
    operationalWarnings,
    trustAlerts,
    escrowAlerts,
    summary: `Operations command panel: ${launchBlockers.length} launch blockers, ${operationalWarnings.length} warnings, ${trustAlerts.length} trust alerts, ${escrowAlerts.length} escrow alerts.`,
  };
}

function mapPriorityToHorizon(priorityLevel: string): ActionQueueHorizon {
  if (priorityLevel === "critical") return "immediate";
  if (priorityLevel === "high") return "today";
  if (priorityLevel === "medium") return "this_week";
  return "this_month";
}

export function buildExecutiveActionQueue(input: {
  strategic: StrategicOperatingSystem;
}): ExecutiveActionQueue {
  const groups: ExecutiveActionQueueGroup[] = [
    { horizon: "immediate", actions: [] },
    { horizon: "today", actions: [] },
    { horizon: "this_week", actions: [] },
    { horizon: "this_month", actions: [] },
  ];

  for (const priority of input.strategic.priorities.priorities) {
    const horizon = mapPriorityToHorizon(priority.priorityLevel);
    const group = groups.find((entry) => entry.horizon === horizon);
    if (!group) continue;

    group.actions.push({
      actionTitle: priority.recommendedAction,
      reason: priority.reason,
      source: priority.sourceLayer,
      expectedImpact: `Improve ${priority.impactArea}.`,
      requiredOwnerRole: "platform_admin",
    });
  }

  return {
    groups,
    summary: `Executive action queue groups ${input.strategic.priorities.priorities.length} actions across immediate, today, this week, and this month horizons.`,
  };
}

export function buildMissionControlSnapshot(input: {
  raw: MissionControlRawSnapshot;
  generatedAt?: Date;
}): MissionControlSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const { strategic, investor, simulation, executive, government } = getMissionContext(
    input.raw,
    generatedAt
  );

  const missionScore = computeMissionControlScore({ strategic, investor, government });
  const overview = buildMissionControlOverview({ missionScore, strategic });
  const decisions = buildTopDecisionsPanel({ strategic });
  const risks = buildTopRisksPanel({ strategic });
  const opportunities = buildTopOpportunitiesPanel({ strategic });
  const growth = buildGrowthCommandPanel({ investor, simulation, executive });
  const governmentPanel = buildGovernmentCommandPanel({ government });
  const investors = buildInvestorCommandPanel({ investor });
  const operations = buildOperationsCommandPanel({ executive });
  const actionQueue = buildExecutiveActionQueue({ strategic });

  return {
    overview,
    decisions,
    risks,
    opportunities,
    growth,
    government: governmentPanel,
    investors,
    operations,
    actionQueue,
    missionScore,
    generatedAt,
  };
}

export function buildMissionControlCenter(input: {
  snapshot: MissionControlSnapshot;
}): MissionControlCenter {
  return {
    overview: input.snapshot.overview,
    decisions: input.snapshot.decisions,
    risks: input.snapshot.risks,
    opportunities: input.snapshot.opportunities,
    growth: input.snapshot.growth,
    government: input.snapshot.government,
    investors: input.snapshot.investors,
    operations: input.snapshot.operations,
    actionQueue: input.snapshot.actionQueue,
    missionScore: input.snapshot.missionScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toMissionControlOverviewView(
  overview: MissionControlOverview
): MissionControlOverviewView {
  return {
    headline: overview.headline,
    mission_score: overview.missionScore,
    strategic_operating_score: overview.strategicOperatingScore,
    executive_health_score: overview.executiveHealthScore,
    release_readiness_score: overview.releaseReadinessScore,
    marketplace_health_score: overview.marketplaceHealthScore,
    investor_readiness_score: overview.investorReadinessScore,
    government_readiness_score: overview.governmentReadinessScore,
    summary: overview.summary,
  };
}

export function toTopDecisionEntryView(entry: TopDecisionEntry): TopDecisionEntryView {
  return {
    decision: entry.decision,
    urgency: entry.urgency,
    expected_impact: entry.expectedImpact,
    source_layer: entry.sourceLayer,
  };
}

export function toTopDecisionsPanelView(panel: TopDecisionsPanel): TopDecisionsPanelView {
  return {
    decisions: panel.decisions.map(toTopDecisionEntryView),
    summary: panel.summary,
  };
}

export function toTopRiskEntryView(entry: TopRiskEntry): TopRiskEntryView {
  return {
    category: entry.category,
    severity: entry.severity,
    probability: entry.probability,
    impact: entry.impact,
    mitigation: entry.mitigation,
  };
}

export function toTopRisksPanelView(panel: TopRisksPanel): TopRisksPanelView {
  return {
    risks: panel.risks.map(toTopRiskEntryView),
    summary: panel.summary,
  };
}

export function toTopOpportunityEntryView(entry: TopOpportunityEntry): TopOpportunityEntryView {
  return {
    category: entry.category,
    value_score: entry.valueScore,
    required_action: entry.requiredAction,
    expected_outcome: entry.expectedOutcome,
  };
}

export function toTopOpportunitiesPanelView(
  panel: TopOpportunitiesPanel
): TopOpportunitiesPanelView {
  return {
    opportunities: panel.opportunities.map(toTopOpportunityEntryView),
    summary: panel.summary,
  };
}

export function toGrowthCommandPanelView(panel: GrowthCommandPanel): GrowthCommandPanelView {
  return {
    user_growth_readiness: panel.userGrowthReadiness,
    provider_growth_readiness: panel.providerGrowthReadiness,
    marketplace_expansion_readiness: panel.marketplaceExpansionReadiness,
    simulation_confidence: panel.simulationConfidence,
    summary: panel.summary,
  };
}

export function toGovernmentPartnershipEntryView(
  entry: GovernmentPartnershipEntry
): GovernmentPartnershipEntryView {
  return {
    target: entry.target,
    readiness_score: entry.readinessScore,
    required_next_action: entry.requiredNextAction,
  };
}

export function toGovernmentCommandPanelView(
  panel: GovernmentCommandPanel
): GovernmentCommandPanelView {
  return {
    partnerships: panel.partnerships.map(toGovernmentPartnershipEntryView),
    summary: panel.summary,
  };
}

export function toInvestorCommandPanelView(panel: InvestorCommandPanel): InvestorCommandPanelView {
  return {
    funding_readiness_score: panel.fundingReadinessScore,
    investor_readiness_score: panel.investorReadinessScore,
    strategic_strengths: panel.strategicStrengths,
    critical_gaps: panel.criticalGaps,
    summary: panel.summary,
  };
}

export function toOperationsAlertView(alert: OperationsAlert): OperationsAlertView {
  return {
    code: alert.code,
    label: alert.label,
    message: alert.message,
  };
}

export function toOperationsCommandPanelView(
  panel: OperationsCommandPanel
): OperationsCommandPanelView {
  return {
    launch_blockers: panel.launchBlockers.map(toOperationsAlertView),
    operational_warnings: panel.operationalWarnings.map(toOperationsAlertView),
    trust_alerts: panel.trustAlerts.map(toOperationsAlertView),
    escrow_alerts: panel.escrowAlerts.map(toOperationsAlertView),
    summary: panel.summary,
  };
}

export function toExecutiveActionQueueItemView(
  item: ExecutiveActionQueueItem
): ExecutiveActionQueueItemView {
  return {
    action_title: item.actionTitle,
    reason: item.reason,
    source: item.source,
    expected_impact: item.expectedImpact,
    required_owner_role: item.requiredOwnerRole,
  };
}

export function toExecutiveActionQueueGroupView(
  group: ExecutiveActionQueueGroup
): ExecutiveActionQueueGroupView {
  return {
    horizon: group.horizon,
    actions: group.actions.map(toExecutiveActionQueueItemView),
  };
}

export function toExecutiveActionQueueView(queue: ExecutiveActionQueue): ExecutiveActionQueueView {
  return {
    groups: queue.groups.map(toExecutiveActionQueueGroupView),
    summary: queue.summary,
  };
}

export function toMissionControlScoreView(score: MissionControlScore): MissionControlScoreView {
  return {
    score: score.score,
    status: score.status,
    strategic_operating_weight: score.strategicOperatingWeight,
    release_weight: score.releaseWeight,
    executive_weight: score.executiveWeight,
    marketplace_weight: score.marketplaceWeight,
    investor_weight: score.investorWeight,
    government_weight: score.governmentWeight,
    summary: score.summary,
  };
}

export function toMissionControlCenterView(center: MissionControlCenter): MissionControlCenterView {
  return {
    overview: toMissionControlOverviewView(center.overview),
    decisions: toTopDecisionsPanelView(center.decisions),
    risks: toTopRisksPanelView(center.risks),
    opportunities: toTopOpportunitiesPanelView(center.opportunities),
    growth: toGrowthCommandPanelView(center.growth),
    government: toGovernmentCommandPanelView(center.government),
    investors: toInvestorCommandPanelView(center.investors),
    operations: toOperationsCommandPanelView(center.operations),
    action_queue: toExecutiveActionQueueView(center.actionQueue),
    mission_score: toMissionControlScoreView(center.missionScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
