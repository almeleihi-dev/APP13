/**
 * Chapter 10 Sprint 2 — Operational Decision Center (client-only).
 * Rule-based operational decision support from existing marketplace signals — no AI or new capabilities.
 */

import { scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import { getLaunchReadinessSnapshot } from "./launch-readiness.js";
import { getLiveMarketplaceOperationsSnapshot } from "./live-marketplace-operations.js";
import { getPilotDashboardSnapshot } from "./pilot-instrumentation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot } from "./production-operations.js";
import { getReliabilityRecoverySnapshot } from "./reliability-recovery.js";

export type { ReadinessLevel };

export type DecisionCategory =
  | "marketplace-balance"
  | "customer-experience"
  | "professional-experience"
  | "operational-stability"
  | "launch-confidence";

export type DecisionPriority = "critical" | "high" | "medium" | "low";

export type ActionQueueStatus = "pending" | "in-progress" | "completed";

export interface OperationalDecision {
  id: string;
  category: DecisionCategory;
  label: string;
  status: ReadinessLevel;
  reason: string;
  recommendedAction: string;
  priority: DecisionPriority;
  confidence: number;
}

export interface PriorityMatrixEntry {
  id: string;
  title: string;
  priority: DecisionPriority;
  impact: "high" | "medium" | "low";
  urgency: "high" | "medium" | "low";
  suggestedOwner: string;
  source: DecisionCategory;
}

export interface MarketplaceFocusArea {
  id: string;
  label: string;
  value: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface ExecutiveActionQueueItem {
  id: string;
  rank: number;
  action: string;
  reason: string;
  priority: DecisionPriority;
  status: ActionQueueStatus;
}

export interface DailyDecisionSummary {
  todaysSituation: string;
  mostImportantDecision: string;
  greatestOpportunity: string;
  greatestOperationalRisk: string;
  topPriorityTomorrow: string;
}

export interface OperationalDecisionCenterSnapshot {
  generatedAt: string;
  periodLabel: string;
  decisionBoard: OperationalDecision[];
  priorityMatrix: PriorityMatrixEntry[];
  focusAreas: MarketplaceFocusArea[];
  actionQueue: ExecutiveActionQueueItem[];
  dailySummary: DailyDecisionSummary;
  operationalReadinessScore: number;
  operationalReadinessSignal: ReadinessLevel;
  hasData: boolean;
}

const CATEGORY_LABELS: Record<DecisionCategory, string> = {
  "marketplace-balance": "Marketplace balance",
  "customer-experience": "Customer experience",
  "professional-experience": "Professional experience",
  "operational-stability": "Operational stability",
  "launch-confidence": "Launch confidence",
};

function signalToConfidence(signal: ReadinessLevel): number {
  if (signal === "green") {
    return 90;
  }
  if (signal === "amber") {
    return 75;
  }
  return 60;
}

function buildDecisionBoard(now: number): OperationalDecision[] {
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const growth = getGrowthFoundationSnapshot();
  const founder = getFounderConsoleSnapshot(now);
  const pilotDash = getPilotDashboardSnapshot();
  const pilot = getPilotManagementSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const launch = getLaunchReadinessSnapshot(now);

  const balanceSignal = marketplace.supplyDemand.find((item) => item.id === "category-imbalance")?.signal ?? "amber";
  const balanceReason = growth.activation.supplyDemandImbalance;
  let balanceAction = "Continue balanced marketplace monitoring";
  let balancePriority: DecisionPriority = "low";
  if (balanceReason.toLowerCase().includes("demand-heavy")) {
    balanceAction = "Increase professional onboarding and supply recruitment";
    balancePriority = "high";
  } else if (balanceReason.toLowerCase().includes("supply-heavy")) {
    balanceAction = "Accelerate customer acquisition cohort";
    balancePriority = "high";
  }

  const searchZeroRate =
    pilotDash.search.total > 0 ? pilotDash.search.zeroResults / pilotDash.search.total : 0;
  const customerSignal: ReadinessLevel =
    searchZeroRate >= 0.2 ? "amber" : founder.dailyOverview.completedJourneys >= 1 ? "green" : "amber";
  const customerReason =
    searchZeroRate >= 0.2
      ? `${Math.round(searchZeroRate * 100)}% zero-result searches today.`
      : `${founder.dailyOverview.searchActivity} searches · ${founder.dailyOverview.completedJourneys} journeys completed.`;

  const professionalBatch = growth.invitationBatches.find((batch) => batch.id === "professionals");
  const professionalSignal: ReadinessLevel =
    growth.activation.enoughProfessionals === "ready"
      ? "green"
      : growth.activation.enoughProfessionals === "building"
        ? "amber"
        : "red";
  const professionalReason = `${professionalBatch?.activated ?? 0} professionals active · ${pilot.readiness.followUpBacklog} follow-up items.`;

  const stabilitySignal = scoreToSignal(
    Math.round((executive.health.operationalHealth + production.productionReadinessScore) / 2)
  );
  const stabilityReason = `${executive.alerts.length} executive alerts · reliability ${reliability.reliabilityScore}.`;

  const launchSignal = launch.launchSignal;
  const launchReason = `${launch.launchDecision.replace(/-/g, " ").toUpperCase()} · score ${launch.launchReadinessScore}.`;

  return [
    {
      id: "decision-marketplace-balance",
      category: "marketplace-balance",
      label: CATEGORY_LABELS["marketplace-balance"],
      status: balanceSignal,
      reason: balanceReason,
      recommendedAction: balanceAction,
      priority: balancePriority,
      confidence: signalToConfidence(balanceSignal),
    },
    {
      id: "decision-customer-experience",
      category: "customer-experience",
      label: CATEGORY_LABELS["customer-experience"],
      status: customerSignal,
      reason: customerReason,
      recommendedAction:
        searchZeroRate >= 0.2
          ? "Review search results and category coverage for customer Need journey"
          : "Maintain customer journey instrumentation and facilitator support",
      priority: searchZeroRate >= 0.2 ? "high" : customerSignal === "green" ? "low" : "medium",
      confidence: signalToConfidence(customerSignal),
    },
    {
      id: "decision-professional-experience",
      category: "professional-experience",
      label: CATEGORY_LABELS["professional-experience"],
      status: professionalSignal,
      reason: professionalReason,
      recommendedAction:
        professionalSignal === "red"
          ? "Increase provider onboarding and professional cohort sessions"
          : "Continue professional supply building with facilitator guidance",
      priority: professionalSignal === "red" ? "critical" : professionalSignal === "amber" ? "high" : "medium",
      confidence: signalToConfidence(professionalSignal),
    },
    {
      id: "decision-operational-stability",
      category: "operational-stability",
      label: CATEGORY_LABELS["operational-stability"],
      status: stabilitySignal,
      reason: stabilityReason,
      recommendedAction:
        executive.alerts.length > 0
          ? "Resolve executive alerts and monitor reliability register"
          : "Continue production and reliability monitoring cadence",
      priority: executive.alerts.some((a) => a.priority === "critical")
        ? "critical"
        : executive.alerts.length > 0
          ? "high"
          : "low",
      confidence: signalToConfidence(stabilitySignal),
    },
    {
      id: "decision-launch-confidence",
      category: "launch-confidence",
      label: CATEGORY_LABELS["launch-confidence"],
      status: launchSignal,
      reason: launchReason,
      recommendedAction:
        launch.launchDecision === "go"
          ? "Proceed with controlled launch planning"
          : launch.launchDecision === "conditional-go"
            ? "Address amber launch gates before full authorization"
            : "Remediate launch blockers before re-assessing readiness",
      priority:
        launch.launchDecision === "no-go" ? "critical" : launch.launchDecision === "conditional-go" ? "high" : "medium",
      confidence: signalToConfidence(launchSignal),
    },
  ];
}

function buildPriorityMatrix(decisions: OperationalDecision[]): PriorityMatrixEntry[] {
  const ownerByCategory: Record<DecisionCategory, string> = {
    "marketplace-balance": "Growth team",
    "customer-experience": "Pilot facilitator",
    "professional-experience": "Growth team",
    "operational-stability": "Operations lead",
    "launch-confidence": "Executive operations",
  };

  return decisions.map((decision) => {
    const impact: PriorityMatrixEntry["impact"] =
      decision.priority === "critical" || decision.priority === "high" ? "high" : decision.priority === "medium" ? "medium" : "low";
    const urgency: PriorityMatrixEntry["urgency"] =
      decision.status === "red" ? "high" : decision.status === "amber" ? "medium" : "low";

    return {
      id: `matrix-${decision.id}`,
      title: decision.recommendedAction,
      priority: decision.priority,
      impact,
      urgency,
      suggestedOwner: ownerByCategory[decision.category],
      source: decision.category,
    };
  });
}

function buildFocusAreas(now: number): MarketplaceFocusArea[] {
  const growth = getGrowthFoundationSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const founder = getFounderConsoleSnapshot(now);
  const pilot = getPilotManagementSnapshot();

  const demandWaitlist = growth.waitlist.filter((entry) => entry.persona === "customers").length;
  const supplyWaitlist = growth.waitlist.filter((entry) => entry.persona === "professionals").length;

  let regionsNeedingProfessionals = "Single-region pilot — no regional imbalance";
  let regionSignal: ReadinessLevel = "green";
  if (growth.activation.supplyDemandImbalance.toLowerCase().includes("demand-heavy")) {
    regionsNeedingProfessionals = "Primary pilot region — professional supply needed";
    regionSignal = "amber";
  }

  const highestDemandCategory =
    demandWaitlist > supplyWaitlist
      ? "Customer Need journey"
      : growth.activation.launchCategoryFirst;

  const lowestSupplyCategory =
    growth.activation.enoughProfessionals !== "ready"
      ? "Professional onboarding"
      : "Balanced across categories";

  let fastestGrowing = "Need journey search activity";
  if (founder.dailyOverview.completedJourneys >= 2) {
    fastestGrowing = "Completed customer journeys";
  } else if (pilotDash.search.total >= 3) {
    fastestGrowing = "Search and discovery activity";
  }

  const observationAreas: string[] = [];
  if (pilotDash.runtimeHealth.slowJourneyCount >= 1) {
    observationAreas.push("Slow journey spans");
  }
  if (pilot.readiness.followUpBacklog > 0) {
    observationAreas.push("Pilot follow-up backlog");
  }
  if (marketplace.alerts.some((alert) => alert.priority === "critical")) {
    observationAreas.push("Critical marketplace alerts");
  }
  const observationValue =
    observationAreas.length > 0 ? observationAreas.join(" · ") : "Stable — routine monitoring sufficient";

  return [
    {
      id: "regions-professionals",
      label: "Regions needing professionals",
      value: regionsNeedingProfessionals,
      signal: regionSignal,
      detail: growth.activation.supplyDemandImbalance,
    },
    {
      id: "highest-demand",
      label: "Categories with highest demand",
      value: highestDemandCategory,
      signal: demandWaitlist > 2 ? "amber" : "green",
      detail: `${demandWaitlist} customer waitlist entries.`,
    },
    {
      id: "lowest-supply",
      label: "Categories with lowest supply",
      value: lowestSupplyCategory,
      signal: growth.activation.enoughProfessionals === "ready" ? "green" : "amber",
      detail: `${supplyWaitlist} professional waitlist entries.`,
    },
    {
      id: "fastest-growing",
      label: "Fastest growing activity",
      value: fastestGrowing,
      signal: founder.hasData ? "green" : "amber",
      detail: `${founder.dailyOverview.newSessions} new sessions today.`,
    },
    {
      id: "observation",
      label: "Areas requiring observation",
      value: observationValue,
      signal: observationAreas.length > 0 ? "amber" : "green",
      detail: `${pilot.readiness.followUpBacklog} follow-up items · ${pilotDash.retries} retries.`,
    },
  ];
}

function buildActionQueue(decisions: OperationalDecision[]): ExecutiveActionQueueItem[] {
  const priorityOrder: Record<DecisionPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...decisions].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return sorted.map((decision, index) => ({
    id: `queue-${decision.id}`,
    rank: index + 1,
    action: decision.recommendedAction,
    reason: decision.reason,
    priority: decision.priority,
    status: decision.status === "green" && decision.priority === "low" ? "completed" : "pending",
  }));
}

function buildDailySummary(
  now: number,
  decisions: OperationalDecision[],
  actionQueue: ExecutiveActionQueueItem[]
): DailyDecisionSummary {
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const launch = getLaunchReadinessSnapshot(now);
  const founder = getFounderConsoleSnapshot(now);

  const todaysSituation = founder.hasData
    ? `Marketplace health ${marketplace.marketplaceHealthScore} · ${marketplace.overview.find((m) => m.id === "completed-actions")?.value ?? 0} actions completed · launch readiness ${launch.launchReadinessScore}.`
    : "Limited activity today — operational decisions based on accumulated platform state.";

  const topDecision = actionQueue[0];
  const mostImportantDecision = topDecision
    ? `${topDecision.action} (${topDecision.priority} priority)`
    : "Continue routine marketplace monitoring";

  const greenDecisions = decisions.filter((d) => d.status === "green");
  const greatestOpportunity =
    greenDecisions.length >= 3
      ? `Strong platform signals — ${launch.launchReadinessScore} launch score supports expansion planning.`
      : decisions.find((d) => d.category === "marketplace-balance")?.recommendedAction ??
        "Build professional supply for category launch.";

  const criticalDecision = decisions.find((d) => d.priority === "critical");
  const criticalAlert = marketplace.alerts.find((a) => a.priority === "critical");
  const greatestOperationalRisk =
    criticalDecision?.reason ?? criticalAlert?.detail ?? marketplace.alerts[0]?.detail ?? "No critical risks in current window.";

  const topPriorityTomorrow = topDecision?.action ?? "Review Live Marketplace Operations and action queue.";

  return {
    todaysSituation,
    mostImportantDecision,
    greatestOpportunity,
    greatestOperationalRisk,
    topPriorityTomorrow,
  };
}

function computeOperationalReadinessScore(decisions: OperationalDecision[]): number {
  const signalScores = decisions.map((d) => (d.status === "green" ? 95 : d.status === "amber" ? 75 : 55));
  const confidenceAvg = decisions.reduce((sum, d) => sum + d.confidence, 0) / Math.max(decisions.length, 1);
  const raw = Math.round((signalScores.reduce((a, b) => a + b, 0) / signalScores.length + confidenceAvg) / 2);
  return Math.min(100, Math.max(0, raw));
}

export function getOperationalDecisionCenterSnapshot(now = Date.now()): OperationalDecisionCenterSnapshot {
  const decisionBoard = buildDecisionBoard(now);
  const priorityMatrix = buildPriorityMatrix(decisionBoard);
  const focusAreas = buildFocusAreas(now);
  const actionQueue = buildActionQueue(decisionBoard);
  const operationalReadinessScore = computeOperationalReadinessScore(decisionBoard);
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);

  return {
    generatedAt: new Date(now).toISOString(),
    periodLabel: "Today",
    decisionBoard,
    priorityMatrix,
    focusAreas,
    actionQueue,
    dailySummary: buildDailySummary(now, decisionBoard, actionQueue),
    operationalReadinessScore,
    operationalReadinessSignal: scoreToSignal(operationalReadinessScore),
    hasData: marketplace.hasData || decisionBoard.some((d) => d.status === "green"),
  };
}

export { scoreToSignal, CATEGORY_LABELS };
