import type { GovernmentPartnershipSnapshot } from "../../government-partnership/domain/government-partnership.js";
import { buildGovernmentPartnershipSnapshot } from "../../government-partnership/domain/government-partnership.js";
import {
  buildInvestorReadinessSnapshot,
  type InvestorReadinessSnapshot,
} from "../../investor-readiness/domain/investor-readiness.js";
import {
  buildLaunchSimulationSnapshot,
  findScenarioSimulation,
  type LaunchSimulationSnapshot,
} from "../../launch-simulation/domain/launch-simulation.js";
import {
  buildMissionControlCenter,
  buildMissionControlSnapshot,
  type MissionControlCenter,
  type MissionControlRawSnapshot,
  type TopDecisionEntry,
  type TopOpportunityEntry,
  type TopRiskEntry,
} from "../../mission-control/domain/mission-control.js";
import {
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
  type StrategicOperatingSystem,
} from "../../strategic-operating-system/domain/strategic-operating-system.js";

export interface ExecutiveExperienceRawSnapshot {
  missionRaw: MissionControlRawSnapshot;
}

export type ExecutiveExperienceStatus = "presentation_ready" | "developing" | "attention_required";

export type GrowthTargetLevel = "10k" | "100k" | "1m" | "10m";

export interface ExecutiveDashboardExperience {
  headline: string;
  missionScore: number;
  strategicScore: number;
  investorScore: number;
  governmentScore: number;
  marketplaceScore: number;
  releaseScore: number;
  summary: string;
}

export interface ExecutiveSummaryExperience {
  platformStatus: string;
  topDecisions: TopDecisionEntry[];
  topRisks: TopRiskEntry[];
  topOpportunities: TopOpportunityEntry[];
  actionQueueSummary: string;
  summary: string;
}

export interface InvestorPresentationExperience {
  investorReadinessScore: number;
  marketOpportunitySummary: string;
  revenuePotentialSummary: string;
  scaleReadinessScore: number;
  strategicStrengths: string[];
  summary: string;
}

export interface GovernmentPresentationExperience {
  governmentReadinessScore: number;
  economicImpactSummary: string;
  workforceImpactSummary: string;
  digitalAlignmentScore: number;
  partnershipReadinessSummary: string;
  summary: string;
}

export interface GrowthTargetEntry {
  level: GrowthTargetLevel;
  targetUsers: number;
  readinessScore: number;
  summary: string;
}

export interface GrowthExperience {
  currentGrowthPosition: string;
  currentReadinessScore: number;
  targets: GrowthTargetEntry[];
  summary: string;
}

export interface StrategicNarrativeExperience {
  whereApp13IsToday: string;
  whereApp13IsGoing: string;
  biggestRisks: string[];
  biggestOpportunities: string[];
  recommendedFocusAreas: string[];
  summary: string;
}

export interface ExecutiveSnapshotScores {
  missionScore: number;
  strategicScore: number;
  investorScore: number;
  governmentScore: number;
  releaseScore: number;
  marketplaceScore: number;
}

export interface ExecutiveSnapshotAction {
  actionTitle: string;
  horizon: string;
  expectedImpact: string;
}

export interface ExecutiveSnapshot {
  scores: ExecutiveSnapshotScores;
  topDecisions: TopDecisionEntry[];
  topRisks: TopRiskEntry[];
  topOpportunities: TopOpportunityEntry[];
  topActions: ExecutiveSnapshotAction[];
  summary: string;
}

export interface ExecutiveExperienceScore {
  score: number;
  status: ExecutiveExperienceStatus;
  missionControlWeight: number;
  strategicOperatingWeight: number;
  investorReadinessWeight: number;
  governmentReadinessWeight: number;
  releaseReadinessWeight: number;
  summary: string;
}

export interface ExecutiveExperienceSnapshot {
  dashboard: ExecutiveDashboardExperience;
  summary: ExecutiveSummaryExperience;
  investorPresentation: InvestorPresentationExperience;
  governmentPresentation: GovernmentPresentationExperience;
  growth: GrowthExperience;
  narrative: StrategicNarrativeExperience;
  snapshot: ExecutiveSnapshot;
  experienceScore: ExecutiveExperienceScore;
  generatedAt: Date;
}

export interface ExecutiveExperienceLayer {
  dashboard: ExecutiveDashboardExperience;
  summary: ExecutiveSummaryExperience;
  investorPresentation: InvestorPresentationExperience;
  governmentPresentation: GovernmentPresentationExperience;
  growth: GrowthExperience;
  narrative: StrategicNarrativeExperience;
  snapshot: ExecutiveSnapshot;
  experienceScore: ExecutiveExperienceScore;
  generatedAt: Date;
}

export interface ExecutiveDashboardExperienceView {
  headline: string;
  mission_score: number;
  strategic_score: number;
  investor_score: number;
  government_score: number;
  marketplace_score: number;
  release_score: number;
  summary: string;
}

export interface TopDecisionEntryView {
  decision: string;
  urgency: string;
  expected_impact: string;
  source_layer: string;
}

export interface TopRiskEntryView {
  category: string;
  severity: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export interface TopOpportunityEntryView {
  category: string;
  value_score: number;
  required_action: string;
  expected_outcome: string;
}

export interface ExecutiveSummaryExperienceView {
  platform_status: string;
  top_decisions: TopDecisionEntryView[];
  top_risks: TopRiskEntryView[];
  top_opportunities: TopOpportunityEntryView[];
  action_queue_summary: string;
  summary: string;
}

export interface InvestorPresentationExperienceView {
  investor_readiness_score: number;
  market_opportunity_summary: string;
  revenue_potential_summary: string;
  scale_readiness_score: number;
  strategic_strengths: string[];
  summary: string;
}

export interface GovernmentPresentationExperienceView {
  government_readiness_score: number;
  economic_impact_summary: string;
  workforce_impact_summary: string;
  digital_alignment_score: number;
  partnership_readiness_summary: string;
  summary: string;
}

export interface GrowthTargetEntryView {
  level: GrowthTargetLevel;
  target_users: number;
  readiness_score: number;
  summary: string;
}

export interface GrowthExperienceView {
  current_growth_position: string;
  current_readiness_score: number;
  targets: GrowthTargetEntryView[];
  summary: string;
}

export interface StrategicNarrativeExperienceView {
  where_app13_is_today: string;
  where_app13_is_going: string;
  biggest_risks: string[];
  biggest_opportunities: string[];
  recommended_focus_areas: string[];
  summary: string;
}

export interface ExecutiveSnapshotScoresView {
  mission_score: number;
  strategic_score: number;
  investor_score: number;
  government_score: number;
  release_score: number;
  marketplace_score: number;
}

export interface ExecutiveSnapshotActionView {
  action_title: string;
  horizon: string;
  expected_impact: string;
}

export interface ExecutiveSnapshotView {
  scores: ExecutiveSnapshotScoresView;
  top_decisions: TopDecisionEntryView[];
  top_risks: TopRiskEntryView[];
  top_opportunities: TopOpportunityEntryView[];
  top_actions: ExecutiveSnapshotActionView[];
  summary: string;
}

export interface ExecutiveExperienceScoreView {
  score: number;
  status: ExecutiveExperienceStatus;
  mission_control_weight: number;
  strategic_operating_weight: number;
  investor_readiness_weight: number;
  government_readiness_weight: number;
  release_readiness_weight: number;
  summary: string;
}

export interface ExecutiveExperienceLayerView {
  dashboard: ExecutiveDashboardExperienceView;
  summary: ExecutiveSummaryExperienceView;
  investor_presentation: InvestorPresentationExperienceView;
  government_presentation: GovernmentPresentationExperienceView;
  growth: GrowthExperienceView;
  narrative: StrategicNarrativeExperienceView;
  snapshot: ExecutiveSnapshotView;
  experience_score: ExecutiveExperienceScoreView;
  generated_at: string;
}

const GROWTH_LEVELS: GrowthTargetLevel[] = ["10k", "100k", "1m", "10m"];

const GROWTH_USER_COUNTS: Record<GrowthTargetLevel, number> = {
  "10k": 10_000,
  "100k": 100_000,
  "1m": 1_000_000,
  "10m": 10_000_000,
};

function derivePlatformStatus(missionScore: number): string {
  if (missionScore >= 75) return "operating_with_confidence";
  if (missionScore >= 55) return "scaling_with_monitoring";
  return "attention_required";
}

function getExecutiveContext(raw: ExecutiveExperienceRawSnapshot, generatedAt?: Date) {
  const missionSnapshot = buildMissionControlSnapshot({
    raw: raw.missionRaw,
    generatedAt,
  });
  const mission = buildMissionControlCenter({ snapshot: missionSnapshot });

  const strategicSnapshot = buildStrategicOperatingSnapshot({
    raw: raw.missionRaw.strategicRaw,
    generatedAt,
  });
  const strategic = buildStrategicOperatingSystem({ snapshot: strategicSnapshot });

  const investor = buildInvestorReadinessSnapshot({
    raw: raw.missionRaw.strategicRaw.governmentRaw.investorRaw,
    generatedAt,
  });
  const simulation = buildLaunchSimulationSnapshot({
    raw: raw.missionRaw.strategicRaw.governmentRaw.investorRaw.launchRaw,
    generatedAt,
  });
  const government = buildGovernmentPartnershipSnapshot({
    raw: raw.missionRaw.strategicRaw.governmentRaw,
    generatedAt,
  });

  return { mission, strategic, investor, simulation, government };
}

export function computeExecutiveExperienceScore(input: {
  mission: MissionControlCenter;
  strategic: StrategicOperatingSystem;
  investor: InvestorReadinessSnapshot;
  government: GovernmentPartnershipSnapshot;
}): ExecutiveExperienceScore {
  const missionControlWeight = 25;
  const strategicOperatingWeight = 20;
  const investorReadinessWeight = 20;
  const governmentReadinessWeight = 20;
  const releaseReadinessWeight = 15;

  const score = Math.round(
    input.mission.missionScore.score * (missionControlWeight / 100) +
      input.strategic.operatingScore.score * (strategicOperatingWeight / 100) +
      input.investor.investorScore.score * (investorReadinessWeight / 100) +
      input.government.governmentScore.score * (governmentReadinessWeight / 100) +
      input.investor.overview.releaseReadinessScore * (releaseReadinessWeight / 100)
  );

  let status: ExecutiveExperienceStatus = "attention_required";
  if (score >= 75) status = "presentation_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    missionControlWeight,
    strategicOperatingWeight,
    investorReadinessWeight,
    governmentReadinessWeight,
    releaseReadinessWeight,
    summary: `Executive experience score ${score} (${status.replace("_", " ")}) across mission control, strategic operating, investor, government, and release readiness.`,
  };
}

export function buildExecutiveDashboardExperience(input: {
  mission: MissionControlCenter;
  strategic: StrategicOperatingSystem;
}): ExecutiveDashboardExperience {
  return {
    headline: "Executive dashboard",
    missionScore: input.mission.missionScore.score,
    strategicScore: input.strategic.operatingScore.score,
    investorScore: input.mission.overview.investorReadinessScore,
    governmentScore: input.mission.overview.governmentReadinessScore,
    marketplaceScore: input.mission.overview.marketplaceHealthScore,
    releaseScore: input.mission.overview.releaseReadinessScore,
    summary: `Executive dashboard with mission ${input.mission.missionScore.score}, strategic ${input.strategic.operatingScore.score}, and investor ${input.mission.overview.investorReadinessScore}.`,
  };
}

export function buildExecutiveSummaryExperience(input: {
  mission: MissionControlCenter;
}): ExecutiveSummaryExperience {
  return {
    platformStatus: derivePlatformStatus(input.mission.missionScore.score),
    topDecisions: input.mission.decisions.decisions.slice(0, 5),
    topRisks: input.mission.risks.risks.slice(0, 5),
    topOpportunities: input.mission.opportunities.opportunities.slice(0, 5),
    actionQueueSummary: input.mission.actionQueue.summary,
    summary: `Executive summary with platform status ${derivePlatformStatus(input.mission.missionScore.score)} and ${input.mission.decisions.decisions.length} top decisions.`,
  };
}

export function buildInvestorPresentationExperience(input: {
  investor: InvestorReadinessSnapshot;
  mission: MissionControlCenter;
}): InvestorPresentationExperience {
  return {
    investorReadinessScore: input.investor.investorScore.score,
    marketOpportunitySummary: input.investor.marketOpportunity.summary,
    revenuePotentialSummary: input.investor.revenuePotential.summary,
    scaleReadinessScore: input.investor.scaleReadiness.launchReadinessScore,
    strategicStrengths: input.investor.strengths.slice(0, 5).map((entry) => entry.title),
    summary: `Investor presentation: readiness ${input.investor.investorScore.score}, funding stage ${input.investor.fundingReadiness.recommendedStage.replace(/_/g, " ")}, ${input.mission.investors.strategicStrengths.length} strengths highlighted.`,
  };
}

export function buildGovernmentPresentationExperience(input: {
  government: GovernmentPartnershipSnapshot;
}): GovernmentPresentationExperience {
  const digitalScore = Math.round(
    input.government.digitalGovernment.targets.reduce(
      (total, entry) => total + entry.digitalReadinessScore,
      0
    ) / Math.max(1, input.government.digitalGovernment.targets.length)
  );

  return {
    governmentReadinessScore: input.government.governmentScore.score,
    economicImpactSummary: input.government.economicImpact.summary,
    workforceImpactSummary: input.government.workforceImpact.summary,
    digitalAlignmentScore: digitalScore,
    partnershipReadinessSummary: input.government.partnershipMatrix.summary,
    summary: `Government presentation: readiness ${input.government.governmentScore.score}, digital alignment ${digitalScore}, partnership matrix across ${input.government.partnershipMatrix.entries.length} targets.`,
  };
}

export function buildGrowthExperience(input: {
  simulation: LaunchSimulationSnapshot;
  mission: MissionControlCenter;
}): GrowthExperience {
  const baselineUsers = input.simulation.baseline.activeUsers;
  const currentReadinessScore = input.mission.growth.userGrowthReadiness;

  const targets: GrowthTargetEntry[] = GROWTH_LEVELS.map((level) => {
    const scenario = findScenarioSimulation(input.simulation.scenarios, "expected", level);
    return {
      level,
      targetUsers: GROWTH_USER_COUNTS[level],
      readinessScore: scenario?.simulationScore ?? currentReadinessScore,
      summary:
        scenario?.summary ??
        `Expected scenario readiness for ${GROWTH_USER_COUNTS[level].toLocaleString()} users.`,
    };
  });

  return {
    currentGrowthPosition: `${baselineUsers} active users with growth readiness ${currentReadinessScore}.`,
    currentReadinessScore,
    targets,
    summary: `Growth experience tracks current position at ${baselineUsers} users and readiness across ${targets.length} scale targets.`,
  };
}

export function buildStrategicNarrativeExperience(input: {
  mission: MissionControlCenter;
  strategic: StrategicOperatingSystem;
  investor: InvestorReadinessSnapshot;
  government: GovernmentPartnershipSnapshot;
}): StrategicNarrativeExperience {
  const platformStatus = derivePlatformStatus(input.mission.missionScore.score);

  const whereApp13IsToday = `APP13 is ${platformStatus.replace(/_/g, " ")} with mission score ${input.mission.missionScore.score}, marketplace health ${input.mission.overview.marketplaceHealthScore}, and release readiness ${input.mission.overview.releaseReadinessScore}.`;

  const topGoal = input.strategic.goals.goals.find((entry) => entry.level === "1m");
  const whereApp13IsGoing = `APP13 is scaling toward ${topGoal?.targetUsers.toLocaleString() ?? "1,000,000"} users with ${topGoal?.readinessScore ?? input.investor.scaleReadiness.launchReadinessScore} readiness, investor stage ${input.investor.fundingReadiness.recommendedStage.replace(/_/g, " ")}, and government readiness ${input.government.governmentScore.score}.`;

  const biggestRisks = input.mission.risks.risks.slice(0, 3).map((entry) => entry.impact);

  const biggestOpportunities = input.mission.opportunities.opportunities
    .slice(0, 3)
    .map((entry) => entry.expectedOutcome);

  const recommendedFocusAreas = [
    input.mission.decisions.decisions[0]?.decision ?? "Advance release readiness",
    input.strategic.priorities.priorities[0]?.recommendedAction ?? "Address top strategic priority",
    input.government.partnershipMatrix.entries[0]?.requiredActions[0] ??
      "Advance government partnership readiness",
  ].filter(Boolean);

  return {
    whereApp13IsToday,
    whereApp13IsGoing,
    biggestRisks,
    biggestOpportunities,
    recommendedFocusAreas,
    summary: `Strategic narrative for leadership, investors, partners, and government stakeholders with ${biggestRisks.length} highlighted risks and ${biggestOpportunities.length} opportunities.`,
  };
}

export function buildExecutiveSnapshot(input: {
  mission: MissionControlCenter;
  strategic: StrategicOperatingSystem;
}): ExecutiveSnapshot {
  const topActions: ExecutiveSnapshotAction[] = [];

  for (const group of input.mission.actionQueue.groups) {
    if (group.horizon !== "immediate" && group.horizon !== "today") continue;
    for (const action of group.actions.slice(0, 3)) {
      topActions.push({
        actionTitle: action.actionTitle,
        horizon: group.horizon,
        expectedImpact: action.expectedImpact,
      });
    }
  }

  return {
    scores: {
      missionScore: input.mission.missionScore.score,
      strategicScore: input.strategic.operatingScore.score,
      investorScore: input.mission.overview.investorReadinessScore,
      governmentScore: input.mission.overview.governmentReadinessScore,
      releaseScore: input.mission.overview.releaseReadinessScore,
      marketplaceScore: input.mission.overview.marketplaceHealthScore,
    },
    topDecisions: input.mission.decisions.decisions.slice(0, 5),
    topRisks: input.mission.risks.risks.slice(0, 5),
    topOpportunities: input.mission.opportunities.opportunities.slice(0, 5),
    topActions: topActions.slice(0, 5),
    summary: `Executive snapshot consolidates key scores, ${Math.min(input.mission.decisions.decisions.length, 5)} decisions, and ${Math.min(topActions.length, 5)} immediate actions.`,
  };
}

export function buildExecutiveExperienceSnapshot(input: {
  raw: ExecutiveExperienceRawSnapshot;
  generatedAt?: Date;
}): ExecutiveExperienceSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const { mission, strategic, investor, simulation, government } = getExecutiveContext(
    input.raw,
    generatedAt
  );

  const experienceScore = computeExecutiveExperienceScore({
    mission,
    strategic,
    investor,
    government,
  });
  const dashboard = buildExecutiveDashboardExperience({ mission, strategic });
  const summary = buildExecutiveSummaryExperience({ mission });
  const investorPresentation = buildInvestorPresentationExperience({ investor, mission });
  const governmentPresentation = buildGovernmentPresentationExperience({ government });
  const growth = buildGrowthExperience({ simulation, mission });
  const narrative = buildStrategicNarrativeExperience({
    mission,
    strategic,
    investor,
    government,
  });
  const snapshot = buildExecutiveSnapshot({ mission, strategic });

  return {
    dashboard,
    summary,
    investorPresentation,
    governmentPresentation,
    growth,
    narrative,
    snapshot,
    experienceScore,
    generatedAt,
  };
}

export function buildExecutiveExperienceLayer(input: {
  snapshot: ExecutiveExperienceSnapshot;
}): ExecutiveExperienceLayer {
  return {
    dashboard: input.snapshot.dashboard,
    summary: input.snapshot.summary,
    investorPresentation: input.snapshot.investorPresentation,
    governmentPresentation: input.snapshot.governmentPresentation,
    growth: input.snapshot.growth,
    narrative: input.snapshot.narrative,
    snapshot: input.snapshot.snapshot,
    experienceScore: input.snapshot.experienceScore,
    generatedAt: input.snapshot.generatedAt,
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

export function toTopRiskEntryView(entry: TopRiskEntry): TopRiskEntryView {
  return {
    category: entry.category,
    severity: entry.severity,
    probability: entry.probability,
    impact: entry.impact,
    mitigation: entry.mitigation,
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

export function toExecutiveDashboardExperienceView(
  dashboard: ExecutiveDashboardExperience
): ExecutiveDashboardExperienceView {
  return {
    headline: dashboard.headline,
    mission_score: dashboard.missionScore,
    strategic_score: dashboard.strategicScore,
    investor_score: dashboard.investorScore,
    government_score: dashboard.governmentScore,
    marketplace_score: dashboard.marketplaceScore,
    release_score: dashboard.releaseScore,
    summary: dashboard.summary,
  };
}

export function toExecutiveSummaryExperienceView(
  summary: ExecutiveSummaryExperience
): ExecutiveSummaryExperienceView {
  return {
    platform_status: summary.platformStatus,
    top_decisions: summary.topDecisions.map(toTopDecisionEntryView),
    top_risks: summary.topRisks.map(toTopRiskEntryView),
    top_opportunities: summary.topOpportunities.map(toTopOpportunityEntryView),
    action_queue_summary: summary.actionQueueSummary,
    summary: summary.summary,
  };
}

export function toInvestorPresentationExperienceView(
  presentation: InvestorPresentationExperience
): InvestorPresentationExperienceView {
  return {
    investor_readiness_score: presentation.investorReadinessScore,
    market_opportunity_summary: presentation.marketOpportunitySummary,
    revenue_potential_summary: presentation.revenuePotentialSummary,
    scale_readiness_score: presentation.scaleReadinessScore,
    strategic_strengths: presentation.strategicStrengths,
    summary: presentation.summary,
  };
}

export function toGovernmentPresentationExperienceView(
  presentation: GovernmentPresentationExperience
): GovernmentPresentationExperienceView {
  return {
    government_readiness_score: presentation.governmentReadinessScore,
    economic_impact_summary: presentation.economicImpactSummary,
    workforce_impact_summary: presentation.workforceImpactSummary,
    digital_alignment_score: presentation.digitalAlignmentScore,
    partnership_readiness_summary: presentation.partnershipReadinessSummary,
    summary: presentation.summary,
  };
}

export function toGrowthTargetEntryView(entry: GrowthTargetEntry): GrowthTargetEntryView {
  return {
    level: entry.level,
    target_users: entry.targetUsers,
    readiness_score: entry.readinessScore,
    summary: entry.summary,
  };
}

export function toGrowthExperienceView(growth: GrowthExperience): GrowthExperienceView {
  return {
    current_growth_position: growth.currentGrowthPosition,
    current_readiness_score: growth.currentReadinessScore,
    targets: growth.targets.map(toGrowthTargetEntryView),
    summary: growth.summary,
  };
}

export function toStrategicNarrativeExperienceView(
  narrative: StrategicNarrativeExperience
): StrategicNarrativeExperienceView {
  return {
    where_app13_is_today: narrative.whereApp13IsToday,
    where_app13_is_going: narrative.whereApp13IsGoing,
    biggest_risks: narrative.biggestRisks,
    biggest_opportunities: narrative.biggestOpportunities,
    recommended_focus_areas: narrative.recommendedFocusAreas,
    summary: narrative.summary,
  };
}

export function toExecutiveSnapshotScoresView(
  scores: ExecutiveSnapshotScores
): ExecutiveSnapshotScoresView {
  return {
    mission_score: scores.missionScore,
    strategic_score: scores.strategicScore,
    investor_score: scores.investorScore,
    government_score: scores.governmentScore,
    release_score: scores.releaseScore,
    marketplace_score: scores.marketplaceScore,
  };
}

export function toExecutiveSnapshotActionView(
  action: ExecutiveSnapshotAction
): ExecutiveSnapshotActionView {
  return {
    action_title: action.actionTitle,
    horizon: action.horizon,
    expected_impact: action.expectedImpact,
  };
}

export function toExecutiveSnapshotView(snapshot: ExecutiveSnapshot): ExecutiveSnapshotView {
  return {
    scores: toExecutiveSnapshotScoresView(snapshot.scores),
    top_decisions: snapshot.topDecisions.map(toTopDecisionEntryView),
    top_risks: snapshot.topRisks.map(toTopRiskEntryView),
    top_opportunities: snapshot.topOpportunities.map(toTopOpportunityEntryView),
    top_actions: snapshot.topActions.map(toExecutiveSnapshotActionView),
    summary: snapshot.summary,
  };
}

export function toExecutiveExperienceScoreView(
  score: ExecutiveExperienceScore
): ExecutiveExperienceScoreView {
  return {
    score: score.score,
    status: score.status,
    mission_control_weight: score.missionControlWeight,
    strategic_operating_weight: score.strategicOperatingWeight,
    investor_readiness_weight: score.investorReadinessWeight,
    government_readiness_weight: score.governmentReadinessWeight,
    release_readiness_weight: score.releaseReadinessWeight,
    summary: score.summary,
  };
}

export function toExecutiveExperienceLayerView(
  layer: ExecutiveExperienceLayer
): ExecutiveExperienceLayerView {
  return {
    dashboard: toExecutiveDashboardExperienceView(layer.dashboard),
    summary: toExecutiveSummaryExperienceView(layer.summary),
    investor_presentation: toInvestorPresentationExperienceView(layer.investorPresentation),
    government_presentation: toGovernmentPresentationExperienceView(layer.governmentPresentation),
    growth: toGrowthExperienceView(layer.growth),
    narrative: toStrategicNarrativeExperienceView(layer.narrative),
    snapshot: toExecutiveSnapshotView(layer.snapshot),
    experience_score: toExecutiveExperienceScoreView(layer.experienceScore),
    generated_at: layer.generatedAt.toISOString(),
  };
}
