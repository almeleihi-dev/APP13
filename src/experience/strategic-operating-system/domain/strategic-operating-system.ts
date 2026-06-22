import {
  buildExecutiveCommandCenterSnapshot,
  type ExecutiveCommandCenterSnapshot,
} from "../../executive-command-center/domain/executive-command-center.js";
import {
  buildGovernmentPartnershipSnapshot,
  type GovernmentPartnershipRawSnapshot,
  type GovernmentPartnershipSnapshot,
} from "../../government-partnership/domain/government-partnership.js";
import {
  buildInvestorReadinessSnapshot,
  type InvestorReadinessSnapshot,
} from "../../investor-readiness/domain/investor-readiness.js";
import {
  buildLaunchSimulationSnapshot,
  findScenarioSimulation,
  type LaunchSimulationSnapshot,
} from "../../launch-simulation/domain/launch-simulation.js";

export interface StrategicOperatingRawSnapshot {
  governmentRaw: GovernmentPartnershipRawSnapshot;
}

export type StrategicPriorityLevel = "critical" | "high" | "medium" | "low";

export type StrategicSourceLayer =
  | "release_readiness"
  | "marketplace_intelligence"
  | "launch_simulation"
  | "investor_readiness"
  | "government_partnership"
  | "trust"
  | "financial";

export type StrategicRiskCategory =
  | "launch"
  | "marketplace"
  | "trust"
  | "financial"
  | "operational"
  | "infrastructure"
  | "investor"
  | "government";

export type StrategicRiskSeverity = "critical" | "high" | "medium" | "low";

export type StrategicRiskProbability = "high" | "medium" | "low";

export type StrategicOpportunityCategory =
  | "marketplace_growth"
  | "provider_supply"
  | "revenue_expansion"
  | "trust_improvement"
  | "investor_readiness"
  | "government_partnership"
  | "insurance_integration"
  | "workforce_development";

export type StrategicGoalLevel = "10k" | "100k" | "1m" | "10m";

export type OperatingCadence = "daily" | "weekly" | "monthly" | "quarterly";

export type ActionPlanHorizon = "immediate" | "this_week" | "this_month" | "this_quarter";

export type DecisionUrgency = "immediate" | "this_week" | "this_month" | "this_quarter";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface StrategicOperatingOverview {
  headline: string;
  strategicReadinessScore: number;
  releaseReadinessScore: number;
  executiveHealthScore: number;
  simulationScore: number;
  investorReadinessScore: number;
  governmentReadinessScore: number;
  marketplaceHealthScore: number;
  summary: string;
}

export interface StrategicPriority {
  priorityLevel: StrategicPriorityLevel;
  sourceLayer: StrategicSourceLayer;
  reason: string;
  impactArea: string;
  recommendedAction: string;
}

export interface StrategicPriorityView {
  priorities: StrategicPriority[];
  summary: string;
}

export interface StrategicRisk {
  category: StrategicRiskCategory;
  severity: StrategicRiskSeverity;
  probability: StrategicRiskProbability;
  impact: string;
  source: string;
  mitigationAction: string;
}

export interface StrategicRiskRegister {
  risks: StrategicRisk[];
  summary: string;
}

export interface StrategicOpportunity {
  category: StrategicOpportunityCategory;
  opportunityScore: number;
  strategicValue: string;
  requiredAction: string;
  expectedBenefit: string;
}

export interface StrategicOpportunityMap {
  opportunities: StrategicOpportunity[];
  summary: string;
}

export interface ExecutiveDecision {
  decision: string;
  whyNow: string;
  expectedEffect: string;
  dependency: string;
  urgency: DecisionUrgency;
}

export interface ExecutiveDecisionBrief {
  decisions: ExecutiveDecision[];
  summary: string;
}

export interface StrategicGoal {
  level: StrategicGoalLevel;
  targetUsers: number;
  readinessScore: number;
  blockingFactors: string[];
  requiredActions: string[];
  confidenceLevel: ConfidenceLevel;
}

export interface StrategicGoalsView {
  goals: StrategicGoal[];
  summary: string;
}

export interface OperatingCadenceEntry {
  cadence: OperatingCadence;
  metricsToReview: string[];
  decisionsToMake: string[];
  alertsToMonitor: string[];
  ownerRole: string;
}

export interface OperatingCadenceView {
  entries: OperatingCadenceEntry[];
  summary: string;
}

export interface StrategicAction {
  actionTitle: string;
  reason: string;
  source: StrategicSourceLayer;
  expectedImpact: string;
  requiredOwnerRole: string;
}

export interface StrategicActionPlanGroup {
  horizon: ActionPlanHorizon;
  actions: StrategicAction[];
}

export interface StrategicActionPlan {
  groups: StrategicActionPlanGroup[];
  summary: string;
}

export interface StrategicScorecardEntry {
  dimension: string;
  score: number;
  weight: number;
}

export interface StrategicScorecard {
  entries: StrategicScorecardEntry[];
  summary: string;
}

export interface StrategicOperatingScore {
  score: number;
  status: "operating_ready" | "developing" | "attention_required";
  releaseWeight: number;
  marketplaceWeight: number;
  executiveWeight: number;
  simulationWeight: number;
  investorWeight: number;
  governmentWeight: number;
  trustFinancialWeight: number;
  summary: string;
}

export interface StrategicOperatingSnapshot {
  overview: StrategicOperatingOverview;
  priorities: StrategicPriorityView;
  riskRegister: StrategicRiskRegister;
  opportunityMap: StrategicOpportunityMap;
  decisionBrief: ExecutiveDecisionBrief;
  goals: StrategicGoalsView;
  cadence: OperatingCadenceView;
  actionPlan: StrategicActionPlan;
  scorecard: StrategicScorecard;
  operatingScore: StrategicOperatingScore;
  generatedAt: Date;
}

export interface StrategicOperatingSystem {
  overview: StrategicOperatingOverview;
  priorities: StrategicPriorityView;
  riskRegister: StrategicRiskRegister;
  opportunityMap: StrategicOpportunityMap;
  decisionBrief: ExecutiveDecisionBrief;
  goals: StrategicGoalsView;
  cadence: OperatingCadenceView;
  actionPlan: StrategicActionPlan;
  scorecard: StrategicScorecard;
  operatingScore: StrategicOperatingScore;
  generatedAt: Date;
}

export interface StrategicOperatingOverviewView {
  headline: string;
  strategic_readiness_score: number;
  release_readiness_score: number;
  executive_health_score: number;
  simulation_score: number;
  investor_readiness_score: number;
  government_readiness_score: number;
  marketplace_health_score: number;
  summary: string;
}

export interface StrategicPriorityItemView {
  priority_level: StrategicPriorityLevel;
  source_layer: StrategicSourceLayer;
  reason: string;
  impact_area: string;
  recommended_action: string;
}

export interface StrategicPriorityViewResponse {
  priorities: StrategicPriorityItemView[];
  summary: string;
}

export interface StrategicRiskView {
  category: StrategicRiskCategory;
  severity: StrategicRiskSeverity;
  probability: StrategicRiskProbability;
  impact: string;
  source: string;
  mitigation_action: string;
}

export interface StrategicRiskRegisterView {
  risks: StrategicRiskView[];
  summary: string;
}

export interface StrategicOpportunityView {
  category: StrategicOpportunityCategory;
  opportunity_score: number;
  strategic_value: string;
  required_action: string;
  expected_benefit: string;
}

export interface StrategicOpportunityMapView {
  opportunities: StrategicOpportunityView[];
  summary: string;
}

export interface ExecutiveDecisionView {
  decision: string;
  why_now: string;
  expected_effect: string;
  dependency: string;
  urgency: DecisionUrgency;
}

export interface ExecutiveDecisionBriefView {
  decisions: ExecutiveDecisionView[];
  summary: string;
}

export interface StrategicGoalView {
  level: StrategicGoalLevel;
  target_users: number;
  readiness_score: number;
  blocking_factors: string[];
  required_actions: string[];
  confidence_level: ConfidenceLevel;
}

export interface StrategicGoalsViewResponse {
  goals: StrategicGoalView[];
  summary: string;
}

export interface OperatingCadenceEntryView {
  cadence: OperatingCadence;
  metrics_to_review: string[];
  decisions_to_make: string[];
  alerts_to_monitor: string[];
  owner_role: string;
}

export interface OperatingCadenceViewResponse {
  entries: OperatingCadenceEntryView[];
  summary: string;
}

export interface StrategicActionView {
  action_title: string;
  reason: string;
  source: StrategicSourceLayer;
  expected_impact: string;
  required_owner_role: string;
}

export interface StrategicActionPlanGroupView {
  horizon: ActionPlanHorizon;
  actions: StrategicActionView[];
}

export interface StrategicActionPlanView {
  groups: StrategicActionPlanGroupView[];
  summary: string;
}

export interface StrategicScorecardEntryView {
  dimension: string;
  score: number;
  weight: number;
}

export interface StrategicScorecardView {
  entries: StrategicScorecardEntryView[];
  summary: string;
}

export interface StrategicOperatingScoreView {
  score: number;
  status: StrategicOperatingScore["status"];
  release_weight: number;
  marketplace_weight: number;
  executive_weight: number;
  simulation_weight: number;
  investor_weight: number;
  government_weight: number;
  trust_financial_weight: number;
  summary: string;
}

export interface StrategicOperatingSystemView {
  overview: StrategicOperatingOverviewView;
  priorities: StrategicPriorityViewResponse;
  risk_register: StrategicRiskRegisterView;
  opportunity_map: StrategicOpportunityMapView;
  decision_brief: ExecutiveDecisionBriefView;
  goals: StrategicGoalsViewResponse;
  cadence: OperatingCadenceViewResponse;
  action_plan: StrategicActionPlanView;
  scorecard: StrategicScorecardView;
  operating_score: StrategicOperatingScoreView;
  generated_at: string;
}

const GOAL_LEVELS: StrategicGoalLevel[] = ["10k", "100k", "1m", "10m"];

const GOAL_USER_COUNTS: Record<StrategicGoalLevel, number> = {
  "10k": 10_000,
  "100k": 100_000,
  "1m": 1_000_000,
  "10m": 10_000_000,
};

const PRIORITY_WEIGHT: Record<StrategicPriorityLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getStrategicContext(raw: StrategicOperatingRawSnapshot, generatedAt?: Date) {
  const investor = buildInvestorReadinessSnapshot({
    raw: raw.governmentRaw.investorRaw,
    generatedAt,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: raw.governmentRaw.investorRaw.launchRaw,
    generatedAt,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: raw.governmentRaw.investorRaw.launchRaw.executiveRaw,
    generatedAt,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: raw.governmentRaw,
    generatedAt,
  });

  return { investor, simulation, executive, government };
}

function mapBottleneckSeverity(
  severity: "low" | "medium" | "high" | "critical"
): StrategicPriorityLevel {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function mapRiskSeverity(severity: "low" | "medium" | "high"): StrategicRiskSeverity {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function deriveProbability(severity: StrategicRiskSeverity): StrategicRiskProbability {
  if (severity === "critical" || severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function deriveConfidenceLevel(
  readinessScore: number,
  blockingFactorCount: number
): ConfidenceLevel {
  if (readinessScore >= 75 && blockingFactorCount === 0) return "high";
  if (readinessScore >= 55 && blockingFactorCount <= 2) return "medium";
  return "low";
}

function deriveUrgency(priorityLevel: StrategicPriorityLevel): DecisionUrgency {
  if (priorityLevel === "critical") return "immediate";
  if (priorityLevel === "high") return "this_week";
  if (priorityLevel === "medium") return "this_month";
  return "this_quarter";
}

function deriveHorizon(priorityLevel: StrategicPriorityLevel): ActionPlanHorizon {
  return deriveUrgency(priorityLevel);
}

function sortPriorities(priorities: StrategicPriority[]): StrategicPriority[] {
  return [...priorities].sort(
    (left, right) => PRIORITY_WEIGHT[right.priorityLevel] - PRIORITY_WEIGHT[left.priorityLevel]
  );
}

export function computeStrategicOperatingScore(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicOperatingScore {
  const releaseWeight = 15;
  const marketplaceWeight = 15;
  const executiveWeight = 15;
  const simulationWeight = 15;
  const investorWeight = 15;
  const governmentWeight = 15;
  const trustFinancialWeight = 10;

  const trustFinancialScore = Math.round(
    (input.investor.overview.trustScore + input.investor.overview.financialScore) / 2
  );

  const score = Math.round(
    input.investor.overview.releaseReadinessScore * (releaseWeight / 100) +
      input.investor.overview.marketplaceHealthScore * (marketplaceWeight / 100) +
      input.investor.overview.executiveHealthScore * (executiveWeight / 100) +
      input.simulation.overview.executiveSimulationScore * (simulationWeight / 100) +
      input.investor.investorScore.score * (investorWeight / 100) +
      input.government.governmentScore.score * (governmentWeight / 100) +
      trustFinancialScore * (trustFinancialWeight / 100)
  );

  let status: StrategicOperatingScore["status"] = "attention_required";
  if (score >= 75) status = "operating_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    releaseWeight,
    marketplaceWeight,
    executiveWeight,
    simulationWeight,
    investorWeight,
    governmentWeight,
    trustFinancialWeight,
    summary: `Strategic operating score ${score} (${status.replace("_", " ")}) across release, marketplace, executive, simulation, investor, government, and trust-financial dimensions.`,
  };
}

export function buildStrategicScorecard(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicScorecard {
  const trustFinancialScore = Math.round(
    (input.investor.overview.trustScore + input.investor.overview.financialScore) / 2
  );

  const entries: StrategicScorecardEntry[] = [
    {
      dimension: "release_readiness",
      score: input.investor.overview.releaseReadinessScore,
      weight: 15,
    },
    {
      dimension: "marketplace_health",
      score: input.investor.overview.marketplaceHealthScore,
      weight: 15,
    },
    {
      dimension: "executive_health",
      score: input.investor.overview.executiveHealthScore,
      weight: 15,
    },
    {
      dimension: "simulation_readiness",
      score: input.simulation.overview.executiveSimulationScore,
      weight: 15,
    },
    {
      dimension: "investor_readiness",
      score: input.investor.investorScore.score,
      weight: 15,
    },
    {
      dimension: "government_readiness",
      score: input.government.governmentScore.score,
      weight: 15,
    },
    {
      dimension: "trust_and_financial_health",
      score: trustFinancialScore,
      weight: 10,
    },
  ];

  return {
    entries,
    summary: `Strategic scorecard across ${entries.length} weighted dimensions with composite readiness ${Math.round(entries.reduce((total, entry) => total + entry.score * (entry.weight / 100), 0))}.`,
  };
}

export function buildStrategicOperatingOverview(input: {
  operatingScore: StrategicOperatingScore;
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicOperatingOverview {
  return {
    headline: "APP13 strategic operating system",
    strategicReadinessScore: input.operatingScore.score,
    releaseReadinessScore: input.investor.overview.releaseReadinessScore,
    executiveHealthScore: input.investor.overview.executiveHealthScore,
    simulationScore: input.simulation.overview.executiveSimulationScore,
    investorReadinessScore: input.investor.investorScore.score,
    governmentReadinessScore: input.government.governmentScore.score,
    marketplaceHealthScore: input.investor.overview.marketplaceHealthScore,
    summary: `Strategic operating overview with readiness ${input.operatingScore.score}, release ${input.investor.overview.releaseReadinessScore}, and government ${input.government.governmentScore.score}.`,
  };
}

export function buildStrategicPriorityView(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicPriorityView {
  const priorities: StrategicPriority[] = [];

  for (const blocker of input.executive.blockers) {
    priorities.push({
      priorityLevel: blocker.category === "release_readiness" ? "critical" : "high",
      sourceLayer:
        blocker.category === "marketplace"
          ? "marketplace_intelligence"
          : blocker.category === "financial"
            ? "financial"
            : "release_readiness",
      reason: blocker.message,
      impactArea: blocker.label,
      recommendedAction: `Resolve ${blocker.label.toLowerCase()} before scaling operations.`,
    });
  }

  for (const warning of input.executive.warnings) {
    priorities.push({
      priorityLevel: "medium",
      sourceLayer:
        warning.category === "marketplace" ? "marketplace_intelligence" : "release_readiness",
      reason: warning.message,
      impactArea: warning.label,
      recommendedAction: `Monitor and address ${warning.label.toLowerCase()} in the next operating cycle.`,
    });
  }

  for (const bottleneck of input.simulation.bottlenecks) {
    priorities.push({
      priorityLevel: mapBottleneckSeverity(bottleneck.severity),
      sourceLayer: "launch_simulation",
      reason: bottleneck.reason,
      impactArea: bottleneck.category.replace(/_/g, " "),
      recommendedAction: bottleneck.recommendedAction,
    });
  }

  for (const recommendation of input.simulation.recommendations) {
    priorities.push({
      priorityLevel: recommendation.priority,
      sourceLayer: "launch_simulation",
      reason: recommendation.rationale,
      impactArea: "simulation readiness",
      recommendedAction: recommendation.action,
    });
  }

  for (const entry of input.investor.riskMatrix.entries) {
    if (entry.severity === "low") continue;
    priorities.push({
      priorityLevel: entry.severity === "high" ? "high" : "medium",
      sourceLayer:
        entry.category === "trust"
          ? "trust"
          : entry.category === "financial"
            ? "financial"
            : "investor_readiness",
      reason: entry.message,
      impactArea: entry.label,
      recommendedAction: `Mitigate ${entry.category} risk: ${entry.label}.`,
    });
  }

  for (const target of input.investor.partnershipReadiness.targets) {
    if (target.readinessScore >= 75) continue;
    priorities.push({
      priorityLevel: target.readinessScore < 50 ? "high" : "medium",
      sourceLayer: "investor_readiness",
      reason: `${target.target} partnership readiness at ${target.readinessScore}.`,
      impactArea: target.target.replace(/_/g, " "),
      recommendedAction: target.requiredActions[0] ?? `Improve ${target.target} partnership readiness.`,
    });
  }

  for (const entry of input.government.regulatoryAlignment.entries) {
    if (entry.status === "aligned") continue;
    priorities.push({
      priorityLevel: entry.status === "attention_required" ? "high" : "medium",
      sourceLayer: "government_partnership",
      reason: entry.message,
      impactArea: entry.category,
      recommendedAction: `Align ${entry.category} regulatory posture for government partnership.`,
    });
  }

  for (const entry of input.government.partnershipMatrix.entries) {
    if (entry.readinessScore >= 75) continue;
    priorities.push({
      priorityLevel: entry.readinessScore < 50 ? "high" : "medium",
      sourceLayer: "government_partnership",
      reason: `${entry.target} partnership readiness at ${entry.readinessScore}.`,
      impactArea: entry.target,
      recommendedAction: entry.requiredActions[0] ?? entry.nextMilestone,
    });
  }

  const sorted = sortPriorities(priorities);

  return {
    priorities: sorted.slice(0, 20),
    summary: `Strategic priority engine identified ${sorted.length} priorities with ${sorted.filter((entry) => entry.priorityLevel === "critical").length} critical items requiring leadership attention.`,
  };
}

export function buildStrategicRiskRegister(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicRiskRegister {
  const risks: StrategicRisk[] = [];

  for (const blocker of input.executive.blockers) {
    const category: StrategicRiskCategory =
      blocker.category === "release_readiness"
        ? "launch"
        : blocker.category === "marketplace"
          ? "marketplace"
          : blocker.category === "financial"
            ? "financial"
            : "operational";
    const severity: StrategicRiskSeverity =
      blocker.category === "release_readiness" ? "critical" : "high";

    risks.push({
      category,
      severity,
      probability: deriveProbability(severity),
      impact: blocker.message,
      source: "X16 Executive Command Center",
      mitigationAction: `Resolve ${blocker.label.toLowerCase()}.`,
    });
  }

  for (const entry of input.investor.riskMatrix.entries) {
    const category: StrategicRiskCategory =
      entry.category === "marketplace"
        ? "marketplace"
        : entry.category === "trust"
          ? "trust"
          : entry.category === "financial"
            ? "financial"
            : entry.category === "growth"
              ? "investor"
              : "operational";

    risks.push({
      category,
      severity: mapRiskSeverity(entry.severity),
      probability: deriveProbability(mapRiskSeverity(entry.severity)),
      impact: entry.message,
      source: "X18 Investor Readiness Center",
      mitigationAction: `Address ${entry.label.toLowerCase()}.`,
    });
  }

  for (const bottleneck of input.simulation.bottlenecks) {
    const severity = mapBottleneckSeverity(bottleneck.severity);
    risks.push({
      category: "infrastructure",
      severity: severity === "low" ? "medium" : severity,
      probability: deriveProbability(severity === "low" ? "medium" : severity),
      impact: bottleneck.reason,
      source: "X17 Launch Simulation Engine",
      mitigationAction: bottleneck.recommendedAction,
    });
  }

  for (const entry of input.government.regulatoryAlignment.entries) {
    if (entry.status === "aligned") continue;
    risks.push({
      category: "government",
      severity: entry.status === "attention_required" ? "high" : "medium",
      probability: entry.status === "attention_required" ? "high" : "medium",
      impact: entry.message,
      source: "X19 Government Partnership Center",
      mitigationAction: `Align ${entry.category} for government partnership readiness.`,
    });
  }

  if (input.executive.trust.lowTrustProviderCount > 0) {
    risks.push({
      category: "trust",
      severity: "medium",
      probability: "medium",
      impact: `${input.executive.trust.lowTrustProviderCount} providers below trust threshold.`,
      source: "Trust metrics",
      mitigationAction: "Review low-trust providers and enforce trust remediation.",
    });
  }

  if (input.executive.financial.frozenEscrowCount > 0) {
    risks.push({
      category: "financial",
      severity: "high",
      probability: "high",
      impact: `${input.executive.financial.frozenEscrowCount} frozen escrow accounts.`,
      source: "Financial and Escrow metrics",
      mitigationAction: "Resolve frozen escrow cases to restore financial flow.",
    });
  }

  return {
    risks,
    summary: `Strategic risk register tracks ${risks.length} risks across launch, marketplace, trust, financial, operational, infrastructure, investor, and government categories.`,
  };
}

export function buildStrategicOpportunityMap(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicOpportunityMap {
  const opportunities: StrategicOpportunity[] = [];

  opportunities.push({
    category: "marketplace_growth",
    opportunityScore: clamp(input.executive.marketplace.healthScore, 0, 100),
    strategicValue: "Expand verified marketplace demand and contract conversion.",
    requiredAction: "Increase provider coverage for high-demand actions.",
    expectedBenefit: `${input.executive.marketplace.opportunityCount} open opportunities ready for conversion.`,
  });

  opportunities.push({
    category: "provider_supply",
    opportunityScore: clamp(
      Math.round(input.executive.marketplace.availableProviders * 10),
      0,
      100
    ),
    strategicValue: "Grow qualified provider supply to meet demand.",
    requiredAction: "Recruit providers for underserved action categories.",
    expectedBenefit: `${input.executive.marketplace.availableProviders} providers available now.`,
  });

  opportunities.push({
    category: "revenue_expansion",
    opportunityScore: clamp(
      Math.round(input.investor.revenuePotential.projections[0]?.platformFeeGrowthPercent ?? 0),
      0,
      100
    ),
    strategicValue: "Scale platform fee revenue through transaction growth.",
    requiredAction: "Accelerate contract completion and escrow release velocity.",
    expectedBenefit: input.investor.revenuePotential.summary,
  });

  opportunities.push({
    category: "trust_improvement",
    opportunityScore: clamp(input.investor.overview.trustScore, 0, 100),
    strategicValue: "Strengthen trust infrastructure for enterprise and government adoption.",
    requiredAction: "Maintain high trust scores and expand verified provider tiers.",
    expectedBenefit: `Average trust score ${input.executive.trust.averageTrustScore}.`,
  });

  opportunities.push({
    category: "investor_readiness",
    opportunityScore: input.investor.investorScore.score,
    strategicValue: "Position APP13 for strategic investment and partnerships.",
    requiredAction: input.investor.fundingReadiness.stages[0]?.nextActions[0] ?? "Advance funding readiness milestones.",
    expectedBenefit: `Recommended funding stage: ${input.investor.fundingReadiness.recommendedStage.replace(/_/g, " ")}.`,
  });

  const governmentTarget = input.government.partnershipMatrix.entries.find(
    (entry) => entry.target === "government"
  );
  opportunities.push({
    category: "government_partnership",
    opportunityScore: governmentTarget?.readinessScore ?? input.government.governmentScore.score,
    strategicValue: "Enable government-grade platform partnerships.",
    requiredAction:
      governmentTarget?.requiredActions[0] ?? "Advance government partnership readiness milestones.",
    expectedBenefit: input.government.governmentScore.summary,
  });

  const insuranceTarget = input.government.partnershipMatrix.entries.find(
    (entry) => entry.target === "insurance"
  );
  opportunities.push({
    category: "insurance_integration",
    opportunityScore: insuranceTarget?.readinessScore ?? 0,
    strategicValue: "Integrate insurance coverage for insurable contracts.",
    requiredAction:
      insuranceTarget?.requiredActions[0] ?? "Partner with insurers for contract coverage.",
    expectedBenefit: "Expand insurable contract volume and claim transparency.",
  });

  const workforceTarget = input.government.partnershipMatrix.entries.find(
    (entry) => entry.target === "workforce"
  );
  opportunities.push({
    category: "workforce_development",
    opportunityScore: workforceTarget?.readinessScore ?? 0,
    strategicValue: "Align workforce programs with platform opportunity demand.",
    requiredAction:
      workforceTarget?.requiredActions[0] ?? "Connect workforce programs to provider onboarding.",
    expectedBenefit: input.government.workforceDevelopment.summary,
  });

  return {
    opportunities: opportunities.sort((left, right) => right.opportunityScore - left.opportunityScore),
    summary: `Strategic opportunity map highlights ${opportunities.length} growth vectors ranked by opportunity score.`,
  };
}

export function buildExecutiveDecisionBrief(input: {
  priorities: StrategicPriorityView;
  investor: InvestorReadinessSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
}): ExecutiveDecisionBrief {
  const topPriorities = input.priorities.priorities.slice(0, 5);
  const executiveActions = input.executive.actions.slice(0, 5);

  const decisions: ExecutiveDecision[] = topPriorities.map((priority, index) => {
    const matchingAction = executiveActions[index];
    return {
      decision: priority.recommendedAction,
      whyNow: priority.reason,
      expectedEffect: matchingAction?.rationale ?? `Improve ${priority.impactArea}.`,
      dependency:
        priority.sourceLayer === "launch_simulation"
          ? "X17 Launch Simulation Engine"
          : priority.sourceLayer === "government_partnership"
            ? "X19 Government Partnership Center"
            : priority.sourceLayer === "investor_readiness"
              ? "X18 Investor Readiness Center"
              : "X16 Executive Command Center",
      urgency: deriveUrgency(priority.priorityLevel),
    };
  });

  if (decisions.length < 5) {
    for (const action of executiveActions.slice(decisions.length, 5)) {
      decisions.push({
        decision: action.action,
        whyNow: action.rationale,
        expectedEffect: `Advance ${action.source.replace(/_/g, " ")} readiness.`,
        dependency: "X16 Executive Command Center",
        urgency: deriveUrgency(action.priority),
      });
    }
  }

  return {
    decisions: decisions.slice(0, 5),
    summary: `Executive decision brief presents ${Math.min(decisions.length, 5)} leadership decisions derived from strategic priorities and executive recommendations.`,
  };
}

export function buildStrategicGoalsView(input: {
  simulation: LaunchSimulationSnapshot;
  investor: InvestorReadinessSnapshot;
}): StrategicGoalsView {
  const goals: StrategicGoal[] = GOAL_LEVELS.map((level) => {
    const scenario = findScenarioSimulation(input.simulation.scenarios, "expected", level);
    const blockingFactors = scenario?.bottlenecks.map((entry) => entry.reason) ?? [
      "Simulation scenario unavailable for this scale level.",
    ];
    const requiredActions =
      scenario?.recommendations.map((entry) => entry.action) ??
      input.investor.scaleReadiness.summary.split(". ").filter(Boolean);

    return {
      level,
      targetUsers: GOAL_USER_COUNTS[level],
      readinessScore: scenario?.simulationScore ?? input.investor.scaleReadiness.launchReadinessScore,
      blockingFactors,
      requiredActions,
      confidenceLevel: deriveConfidenceLevel(
        scenario?.simulationScore ?? input.investor.scaleReadiness.simulationConfidenceScore,
        blockingFactors.length
      ),
    };
  });

  return {
    goals,
    summary: `Strategic goals view tracks readiness across ${goals.length} user scale milestones from 10k to 10m users.`,
  };
}

export function buildOperatingCadenceView(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ExecutiveCommandCenterSnapshot;
  government: GovernmentPartnershipSnapshot;
}): OperatingCadenceView {
  const entries: OperatingCadenceEntry[] = [
    {
      cadence: "daily",
      metricsToReview: [
        "Open operational blockers",
        "Frozen escrow count",
        "Trust events last 7 days",
        "Pending funding escrows",
      ],
      decisionsToMake: [
        "Escalate frozen escrow cases",
        "Clear release blockers",
        "Address critical simulation bottlenecks",
      ],
      alertsToMonitor: [
        `${input.executive.blockers.length} open blockers`,
        `${input.executive.financial.frozenEscrowCount} frozen escrows`,
        `${input.executive.trust.trustEventsLast7Days} trust events (7d)`,
      ],
      ownerRole: "platform_admin",
    },
    {
      cadence: "weekly",
      metricsToReview: [
        "Marketplace health score",
        "Simulation readiness score",
        "Provider utilization",
        "Offer-to-contract rate",
      ],
      decisionsToMake: [
        "Adjust provider supply for demand gaps",
        "Review simulation recommendations",
        "Prioritize marketplace growth actions",
      ],
      alertsToMonitor: [
        `Marketplace health ${input.executive.marketplace.healthScore}`,
        `Simulation score ${input.simulation.overview.executiveSimulationScore}`,
        `${input.executive.marketplace.openRequests} open requests`,
      ],
      ownerRole: "platform_admin",
    },
    {
      cadence: "monthly",
      metricsToReview: [
        "Investor readiness score",
        "Government readiness score",
        "Partnership matrix progress",
        "Risk register high-severity items",
      ],
      decisionsToMake: [
        "Advance investor funding milestones",
        "Review government partnership gaps",
        "Update strategic action plan",
      ],
      alertsToMonitor: [
        `Investor readiness ${input.investor.investorScore.score}`,
        `Government readiness ${input.government.governmentScore.score}`,
        `${input.investor.riskMatrix.highRiskCount} high investor risks`,
      ],
      ownerRole: "platform_admin",
    },
    {
      cadence: "quarterly",
      metricsToReview: [
        "Strategic operating score",
        "Scale goal readiness (10k–10m)",
        "Revenue potential projections",
        "Partnership maturity scores",
      ],
      decisionsToMake: [
        "Set next-quarter strategic priorities",
        "Approve scale investment decisions",
        "Review enterprise and government partnership roadmap",
      ],
      alertsToMonitor: [
        `Strategic goals at 1m users: ${findScenarioSimulation(input.simulation.scenarios, "expected", "1m")?.simulationScore ?? 0}`,
        `Partnership maturity ${input.government.overview.partnershipMaturityScore}`,
      ],
      ownerRole: "platform_admin",
    },
  ];

  return {
    entries,
    summary: `Operating cadence defines daily, weekly, monthly, and quarterly review cycles for APP13 leadership.`,
  };
}

export function buildStrategicActionPlan(input: {
  priorities: StrategicPriorityView;
}): StrategicActionPlan {
  const groups: StrategicActionPlanGroup[] = [
    { horizon: "immediate", actions: [] },
    { horizon: "this_week", actions: [] },
    { horizon: "this_month", actions: [] },
    { horizon: "this_quarter", actions: [] },
  ];

  for (const priority of input.priorities.priorities) {
    const horizon = deriveHorizon(priority.priorityLevel);
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
    summary: `Strategic action plan groups ${input.priorities.priorities.length} actions across immediate, weekly, monthly, and quarterly horizons.`,
  };
}

export function buildStrategicOperatingSnapshot(input: {
  raw: StrategicOperatingRawSnapshot;
  generatedAt?: Date;
}): StrategicOperatingSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const { investor, simulation, executive, government } = getStrategicContext(
    input.raw,
    generatedAt
  );

  const operatingScore = computeStrategicOperatingScore({ investor, simulation, government });
  const overview = buildStrategicOperatingOverview({
    operatingScore,
    investor,
    simulation,
    government,
  });
  const priorities = buildStrategicPriorityView({ investor, simulation, executive, government });
  const riskRegister = buildStrategicRiskRegister({ investor, simulation, executive, government });
  const opportunityMap = buildStrategicOpportunityMap({
    investor,
    simulation,
    executive,
    government,
  });
  const decisionBrief = buildExecutiveDecisionBrief({ priorities, investor, executive });
  const goals = buildStrategicGoalsView({ simulation, investor });
  const cadence = buildOperatingCadenceView({ investor, simulation, executive, government });
  const actionPlan = buildStrategicActionPlan({ priorities });
  const scorecard = buildStrategicScorecard({ investor, simulation, government });

  return {
    overview,
    priorities,
    riskRegister,
    opportunityMap,
    decisionBrief,
    goals,
    cadence,
    actionPlan,
    scorecard,
    operatingScore,
    generatedAt,
  };
}

export function buildStrategicOperatingSystem(input: {
  snapshot: StrategicOperatingSnapshot;
}): StrategicOperatingSystem {
  return {
    overview: input.snapshot.overview,
    priorities: input.snapshot.priorities,
    riskRegister: input.snapshot.riskRegister,
    opportunityMap: input.snapshot.opportunityMap,
    decisionBrief: input.snapshot.decisionBrief,
    goals: input.snapshot.goals,
    cadence: input.snapshot.cadence,
    actionPlan: input.snapshot.actionPlan,
    scorecard: input.snapshot.scorecard,
    operatingScore: input.snapshot.operatingScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toStrategicOperatingOverviewView(
  overview: StrategicOperatingOverview
): StrategicOperatingOverviewView {
  return {
    headline: overview.headline,
    strategic_readiness_score: overview.strategicReadinessScore,
    release_readiness_score: overview.releaseReadinessScore,
    executive_health_score: overview.executiveHealthScore,
    simulation_score: overview.simulationScore,
    investor_readiness_score: overview.investorReadinessScore,
    government_readiness_score: overview.governmentReadinessScore,
    marketplace_health_score: overview.marketplaceHealthScore,
    summary: overview.summary,
  };
}

export function toStrategicPriorityItemView(priority: StrategicPriority): StrategicPriorityItemView {
  return {
    priority_level: priority.priorityLevel,
    source_layer: priority.sourceLayer,
    reason: priority.reason,
    impact_area: priority.impactArea,
    recommended_action: priority.recommendedAction,
  };
}

export function toStrategicPriorityViewResponse(
  view: StrategicPriorityView
): StrategicPriorityViewResponse {
  return {
    priorities: view.priorities.map(toStrategicPriorityItemView),
    summary: view.summary,
  };
}

export function toStrategicRiskView(risk: StrategicRisk): StrategicRiskView {
  return {
    category: risk.category,
    severity: risk.severity,
    probability: risk.probability,
    impact: risk.impact,
    source: risk.source,
    mitigation_action: risk.mitigationAction,
  };
}

export function toStrategicRiskRegisterView(
  register: StrategicRiskRegister
): StrategicRiskRegisterView {
  return {
    risks: register.risks.map(toStrategicRiskView),
    summary: register.summary,
  };
}

export function toStrategicOpportunityView(opportunity: StrategicOpportunity): StrategicOpportunityView {
  return {
    category: opportunity.category,
    opportunity_score: opportunity.opportunityScore,
    strategic_value: opportunity.strategicValue,
    required_action: opportunity.requiredAction,
    expected_benefit: opportunity.expectedBenefit,
  };
}

export function toStrategicOpportunityMapView(
  map: StrategicOpportunityMap
): StrategicOpportunityMapView {
  return {
    opportunities: map.opportunities.map(toStrategicOpportunityView),
    summary: map.summary,
  };
}

export function toExecutiveDecisionView(decision: ExecutiveDecision): ExecutiveDecisionView {
  return {
    decision: decision.decision,
    why_now: decision.whyNow,
    expected_effect: decision.expectedEffect,
    dependency: decision.dependency,
    urgency: decision.urgency,
  };
}

export function toExecutiveDecisionBriefView(
  brief: ExecutiveDecisionBrief
): ExecutiveDecisionBriefView {
  return {
    decisions: brief.decisions.map(toExecutiveDecisionView),
    summary: brief.summary,
  };
}

export function toStrategicGoalView(goal: StrategicGoal): StrategicGoalView {
  return {
    level: goal.level,
    target_users: goal.targetUsers,
    readiness_score: goal.readinessScore,
    blocking_factors: goal.blockingFactors,
    required_actions: goal.requiredActions,
    confidence_level: goal.confidenceLevel,
  };
}

export function toStrategicGoalsViewResponse(goals: StrategicGoalsView): StrategicGoalsViewResponse {
  return {
    goals: goals.goals.map(toStrategicGoalView),
    summary: goals.summary,
  };
}

export function toOperatingCadenceEntryView(entry: OperatingCadenceEntry): OperatingCadenceEntryView {
  return {
    cadence: entry.cadence,
    metrics_to_review: entry.metricsToReview,
    decisions_to_make: entry.decisionsToMake,
    alerts_to_monitor: entry.alertsToMonitor,
    owner_role: entry.ownerRole,
  };
}

export function toOperatingCadenceViewResponse(
  cadence: OperatingCadenceView
): OperatingCadenceViewResponse {
  return {
    entries: cadence.entries.map(toOperatingCadenceEntryView),
    summary: cadence.summary,
  };
}

export function toStrategicActionView(action: StrategicAction): StrategicActionView {
  return {
    action_title: action.actionTitle,
    reason: action.reason,
    source: action.source,
    expected_impact: action.expectedImpact,
    required_owner_role: action.requiredOwnerRole,
  };
}

export function toStrategicActionPlanGroupView(
  group: StrategicActionPlanGroup
): StrategicActionPlanGroupView {
  return {
    horizon: group.horizon,
    actions: group.actions.map(toStrategicActionView),
  };
}

export function toStrategicActionPlanView(plan: StrategicActionPlan): StrategicActionPlanView {
  return {
    groups: plan.groups.map(toStrategicActionPlanGroupView),
    summary: plan.summary,
  };
}

export function toStrategicScorecardEntryView(
  entry: StrategicScorecardEntry
): StrategicScorecardEntryView {
  return {
    dimension: entry.dimension,
    score: entry.score,
    weight: entry.weight,
  };
}

export function toStrategicScorecardView(scorecard: StrategicScorecard): StrategicScorecardView {
  return {
    entries: scorecard.entries.map(toStrategicScorecardEntryView),
    summary: scorecard.summary,
  };
}

export function toStrategicOperatingScoreView(
  score: StrategicOperatingScore
): StrategicOperatingScoreView {
  return {
    score: score.score,
    status: score.status,
    release_weight: score.releaseWeight,
    marketplace_weight: score.marketplaceWeight,
    executive_weight: score.executiveWeight,
    simulation_weight: score.simulationWeight,
    investor_weight: score.investorWeight,
    government_weight: score.governmentWeight,
    trust_financial_weight: score.trustFinancialWeight,
    summary: score.summary,
  };
}

export function toStrategicOperatingSystemView(
  system: StrategicOperatingSystem
): StrategicOperatingSystemView {
  return {
    overview: toStrategicOperatingOverviewView(system.overview),
    priorities: toStrategicPriorityViewResponse(system.priorities),
    risk_register: toStrategicRiskRegisterView(system.riskRegister),
    opportunity_map: toStrategicOpportunityMapView(system.opportunityMap),
    decision_brief: toExecutiveDecisionBriefView(system.decisionBrief),
    goals: toStrategicGoalsViewResponse(system.goals),
    cadence: toOperatingCadenceViewResponse(system.cadence),
    action_plan: toStrategicActionPlanView(system.actionPlan),
    scorecard: toStrategicScorecardView(system.scorecard),
    operating_score: toStrategicOperatingScoreView(system.operatingScore),
    generated_at: system.generatedAt.toISOString(),
  };
}
