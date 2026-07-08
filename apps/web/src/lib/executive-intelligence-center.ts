/**
 * Chapter 10 Sprint 3 — Executive Intelligence Center (client-only).
 * Rule-based executive understanding from operational aggregation — no AI or new capabilities.
 */

import { getEnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import { scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import { getLaunchReadinessSnapshot } from "./launch-readiness.js";
import { getLiveMarketplaceOperationsSnapshot } from "./live-marketplace-operations.js";
import { getOperationalDecisionCenterSnapshot } from "./operational-decision-center.js";
import { getPilotDashboardSnapshot } from "./pilot-instrumentation.js";
import { getProductionOperationsSnapshot } from "./production-operations.js";
import { getReliabilityRecoverySnapshot } from "./reliability-recovery.js";

export type { ReadinessLevel };

export type TrendDirection = "improving" | "stable" | "declining";

export interface IntelligenceOverviewItem {
  id: "marketplace" | "operational" | "launch" | "enterprise" | "production";
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface TrendSummaryItem {
  id: string;
  label: string;
  direction: TrendDirection;
  detail: string;
  signal: ReadinessLevel;
}

export interface ExecutiveInsight {
  id: string;
  title: string;
  detail: string;
  signal: ReadinessLevel;
}

export interface StrategicFocusItem {
  id: string;
  category: "opportunity" | "risk" | "investment" | "observation";
  title: string;
  detail: string;
}

export interface ExecutiveBrief {
  platformCondition: string;
  topAchievement: string;
  topConcern: string;
  recommendedAction: string;
  overallConfidence: number;
  confidenceSignal: ReadinessLevel;
}

export interface ExecutiveIntelligenceCenterSnapshot {
  generatedAt: string;
  periodLabel: string;
  overview: IntelligenceOverviewItem[];
  intelligenceScore: number;
  intelligenceSignal: ReadinessLevel;
  trends: TrendSummaryItem[];
  insights: ExecutiveInsight[];
  strategicFocus: StrategicFocusItem[];
  executiveBrief: ExecutiveBrief;
  hasData: boolean;
}

function buildOverview(now: number): IntelligenceOverviewItem[] {
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const decision = getOperationalDecisionCenterSnapshot(now);
  const launch = getLaunchReadinessSnapshot(now);
  const enterprise = getEnterpriseEvaluationSnapshot();
  const production = getProductionOperationsSnapshot();

  return [
    {
      id: "marketplace",
      label: "Marketplace performance",
      score: marketplace.marketplaceHealthScore,
      signal: marketplace.marketplaceHealthSignal,
      summary: `${marketplace.overview.find((m) => m.id === "completed-actions")?.value ?? 0} actions completed · health ${marketplace.marketplaceHealthScore}.`,
    },
    {
      id: "operational",
      label: "Operational performance",
      score: decision.operationalReadinessScore,
      signal: decision.operationalReadinessSignal,
      summary: `${decision.actionQueue.filter((a) => a.status === "pending").length} pending actions in executive queue.`,
    },
    {
      id: "launch",
      label: "Launch confidence",
      score: launch.launchReadinessScore,
      signal: launch.launchSignal,
      summary: `${launch.launchGates.filter((g) => g.signal === "green").length} of ${launch.launchGates.length} launch gates green.`,
    },
    {
      id: "enterprise",
      label: "Enterprise readiness",
      score: enterprise.unifiedReadinessScore,
      signal: enterprise.unifiedSignal,
      summary: `Unified evaluation ${enterprise.unifiedReadinessScore} across readiness centers.`,
    },
    {
      id: "production",
      label: "Production stability",
      score: production.productionReadinessScore,
      signal: production.productionSignal,
      summary: `${production.incidents.filter((i) => i.category === "active").length} active incidents · score ${production.productionReadinessScore}.`,
    },
  ];
}

function trendFromScore(score: number, greenMin = 80, amberMin = 65): TrendDirection {
  if (score >= greenMin) {
    return "improving";
  }
  if (score >= amberMin) {
    return "stable";
  }
  return "declining";
}

function trendToSignal(direction: TrendDirection): ReadinessLevel {
  if (direction === "improving") {
    return "green";
  }
  if (direction === "stable") {
    return "amber";
  }
  return "red";
}

function buildTrends(now: number): TrendSummaryItem[] {
  const founder = getFounderConsoleSnapshot(now);
  const growth = getGrowthFoundationSnapshot();
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const executive = getExecutiveOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const pilotDash = getPilotDashboardSnapshot();

  const customerScore = Math.min(
    100,
    founder.dailyOverview.completedJourneys * 25 + founder.dailyOverview.searchActivity * 5
  );
  const professionalBatch = growth.invitationBatches.find((batch) => batch.id === "professionals");
  const professionalScore = Math.min(100, (professionalBatch?.activated ?? 0) * 20);
  const requestMetric = marketplace.overview.find((m) => m.id === "active-requests");
  const requestScore = requestMetric ? Math.max(0, 100 - requestMetric.value * 10) : 70;

  const customerDirection = trendFromScore(customerScore, 50, 25);
  const professionalDirection =
    growth.activation.enoughProfessionals === "ready"
      ? "improving"
      : growth.activation.enoughProfessionals === "building"
        ? "stable"
        : "declining";
  const requestDirection =
    (requestMetric?.value ?? 0) <= 2 ? "stable" : (requestMetric?.value ?? 0) > 5 ? "declining" : "improving";
  const operationalDirection = trendFromScore(executive.health.overall);
  const reliabilityDirection = trendFromScore(reliability.reliabilityScore);

  return [
    {
      id: "customer-activity",
      label: "Customer activity",
      direction: customerDirection,
      detail: `${founder.dailyOverview.newSessions} new sessions · ${founder.dailyOverview.completedJourneys} journeys completed.`,
      signal: trendToSignal(customerDirection),
    },
    {
      id: "professional-activity",
      label: "Professional activity",
      direction: professionalDirection,
      detail: `${professionalBatch?.activated ?? 0} professionals active · ${growth.activation.enoughProfessionals} supply signal.`,
      signal: trendToSignal(professionalDirection),
    },
    {
      id: "requests",
      label: "Requests",
      direction: requestDirection,
      detail: `${requestMetric?.value ?? 0} active requests · ${marketplace.overview.find((m) => m.id === "completed-actions")?.value ?? 0} completed actions.`,
      signal: trendToSignal(requestDirection),
    },
    {
      id: "operational-health",
      label: "Operational health",
      direction: operationalDirection,
      detail: `Executive health ${executive.health.overall} · ${executive.alerts.length} alerts.`,
      signal: trendToSignal(operationalDirection),
    },
    {
      id: "reliability",
      label: "Reliability",
      direction: reliabilityDirection,
      detail: `Reliability score ${reliability.reliabilityScore} · ${pilotDash.retries} retries.`,
      signal: trendToSignal(reliabilityDirection),
    },
  ];
}

function buildInsights(now: number): ExecutiveInsight[] {
  const founder = getFounderConsoleSnapshot(now);
  const growth = getGrowthFoundationSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const insights: ExecutiveInsight[] = [];

  const demandWaitlist = growth.waitlist.filter((entry) => entry.persona === "customers").length;
  const supplyWaitlist = growth.waitlist.filter((entry) => entry.persona === "professionals").length;

  if (demandWaitlist > supplyWaitlist) {
    insights.push({
      id: "demand-increasing",
      title: "Customer demand increasing",
      detail: `${demandWaitlist} customer waitlist entries vs ${supplyWaitlist} professional.`,
      signal: "amber",
    });
  }

  if (growth.activation.enoughProfessionals === "ready" || growth.activation.enoughProfessionals === "building") {
    insights.push({
      id: "supply-stable",
      title: "Provider supply stable",
      detail: growth.activation.supplyDemandImbalance,
      signal: growth.activation.enoughProfessionals === "ready" ? "green" : "amber",
    });
  }

  const searchZeroRate =
    pilotDash.search.total > 0 ? pilotDash.search.zeroResults / pilotDash.search.total : 0;
  if (searchZeroRate < 0.2) {
    insights.push({
      id: "search-friction-reduced",
      title: "Search friction reduced",
      detail: `${Math.round(searchZeroRate * 100)}% zero-result rate in current instrumentation window.`,
      signal: "green",
    });
  } else {
    insights.push({
      id: "search-friction-elevated",
      title: "Search friction elevated",
      detail: `${Math.round(searchZeroRate * 100)}% zero-result searches require category review.`,
      signal: "amber",
    });
  }

  if (executive.health.operationalHealth >= 80) {
    insights.push({
      id: "ops-health-improving",
      title: "Operational health improving",
      detail: `Operational health at ${executive.health.operationalHealth}% with platform stability ${executive.health.platformStability}%.`,
      signal: "green",
    });
  }

  if (pilotDash.retries >= 3) {
    insights.push({
      id: "retry-rate-increasing",
      title: "Retry rate increasing",
      detail: `${pilotDash.retries} runtime retries · ${pilotDash.search.retries} search retries recorded.`,
      signal: "amber",
    });
  }

  if (reliability.reliabilityScore >= 85) {
    insights.push({
      id: "reliability-strong",
      title: "Reliability posture strong",
      detail: `Reliability score ${reliability.reliabilityScore} with recovery paths documented.`,
      signal: "green",
    });
  }

  if (founder.dailyOverview.completedJourneys >= 1) {
    insights.push({
      id: "journey-completion",
      title: "Customer journeys completing",
      detail: `${founder.dailyOverview.completedJourneys} journeys completed today.`,
      signal: "green",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "awaiting-activity",
      title: "Awaiting marketplace activity",
      detail: "Run live platform sessions to populate executive intelligence insights.",
      signal: "amber",
    });
  }

  return insights.slice(0, 8);
}

function buildStrategicFocus(now: number): StrategicFocusItem[] {
  const decision = getOperationalDecisionCenterSnapshot(now);
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const growth = getGrowthFoundationSnapshot();

  const criticalQueue = decision.actionQueue.find((a) => a.priority === "critical");
  const greenDecisions = decision.decisionBoard.filter((d) => d.status === "green").length;

  return [
    {
      id: "biggest-opportunity",
      category: "opportunity",
      title: "Biggest opportunity",
      detail:
        greenDecisions >= 3
          ? decision.dailySummary.greatestOpportunity
          : growth.activation.nextActivationMove,
    },
    {
      id: "biggest-risk",
      category: "risk",
      title: "Biggest operational risk",
      detail: decision.dailySummary.greatestOperationalRisk,
    },
    {
      id: "investment-area",
      category: "investment",
      title: "Area requiring investment",
      detail:
        growth.activation.enoughProfessionals !== "ready"
          ? "Professional supply onboarding and facilitator-guided cohort expansion."
          : "Controlled marketplace activation for primary service category.",
    },
    {
      id: "observation-area",
      category: "observation",
      title: "Area requiring observation",
      detail:
        marketplace.alerts.length > 0
          ? marketplace.alerts.map((a) => a.title).join(" · ")
          : criticalQueue?.action ?? "Routine monitoring of Live Marketplace Operations feed.",
    },
  ];
}

function buildExecutiveBrief(
  now: number,
  overview: IntelligenceOverviewItem[],
  insights: ExecutiveInsight[],
  strategicFocus: StrategicFocusItem[]
): ExecutiveBrief {
  const decision = getOperationalDecisionCenterSnapshot(now);
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const launch = getLaunchReadinessSnapshot(now);

  const avgScore = Math.round(overview.reduce((sum, item) => sum + item.score, 0) / Math.max(overview.length, 1));
  const greenInsights = insights.filter((i) => i.signal === "green").length;
  const overallConfidence = Math.round((avgScore + greenInsights * 5) / 1.2);
  const clampedConfidence = Math.min(100, Math.max(0, overallConfidence));

  const topAchievement =
    insights.find((i) => i.signal === "green")?.title ??
    (launch.launchReadinessScore >= 90 ? `Launch readiness at ${launch.launchReadinessScore}` : "Platform certification complete");

  const topConcern =
    strategicFocus.find((f) => f.category === "risk")?.detail ??
    marketplace.alerts[0]?.detail ??
    "No critical concerns in current aggregation window.";

  return {
    platformCondition: decision.dailySummary.todaysSituation,
    topAchievement,
    topConcern,
    recommendedAction: decision.dailySummary.topPriorityTomorrow,
    overallConfidence: clampedConfidence,
    confidenceSignal: scoreToSignal(clampedConfidence),
  };
}

function computeIntelligenceScore(overview: IntelligenceOverviewItem[]): number {
  return Math.round(overview.reduce((sum, item) => sum + item.score, 0) / Math.max(overview.length, 1));
}

export function getExecutiveIntelligenceCenterSnapshot(now = Date.now()): ExecutiveIntelligenceCenterSnapshot {
  const overview = buildOverview(now);
  const trends = buildTrends(now);
  const insights = buildInsights(now);
  const strategicFocus = buildStrategicFocus(now);
  const intelligenceScore = computeIntelligenceScore(overview);
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);

  return {
    generatedAt: new Date(now).toISOString(),
    periodLabel: "Today",
    overview,
    intelligenceScore,
    intelligenceSignal: scoreToSignal(intelligenceScore),
    trends,
    insights,
    strategicFocus,
    executiveBrief: buildExecutiveBrief(now, overview, insights, strategicFocus),
    hasData: marketplace.hasData || overview.some((item) => item.signal === "green"),
  };
}

export { scoreToSignal };
