/**
 * Chapter 7 Sprint 4 — Executive Operations Center aggregation.
 * Unifies Founder, Pilot Management, and Growth Foundation — no duplicate logic.
 */

import { getFounderConsoleSnapshot, healthSignalLabel, type HealthSignal } from "./founder-console.js";
import { getGrowthFoundationSnapshot, earlyAccessStatusLabel } from "./growth-foundation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";

export type ExecutiveAlertPriority = "critical" | "high" | "medium";

export interface ExecutiveModuleSummary {
  id: "founder" | "pilot" | "growth";
  title: string;
  headline: string;
  metrics: Array<{ label: string; value: string }>;
  status: HealthSignal;
}

export interface ExecutiveHealthScore {
  overall: number;
  platformStability: number;
  pilotReadiness: number;
  growthReadiness: number;
  operationalHealth: number;
  signal: HealthSignal;
}

export interface ExecutiveAlert {
  id: string;
  priority: ExecutiveAlertPriority;
  title: string;
  detail: string;
  source: "founder" | "pilot" | "growth";
}

export interface ExecutiveDecision {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  source: string;
}

export interface ExecutiveOperationsSnapshot {
  generatedAt: string;
  modules: ExecutiveModuleSummary[];
  health: ExecutiveHealthScore;
  alerts: ExecutiveAlert[];
  decisions: ExecutiveDecision[];
  hasData: boolean;
}

function signalToScore(signal: HealthSignal): number {
  if (signal === "green") {
    return 100;
  }
  if (signal === "amber") {
    return 70;
  }
  return 40;
}

function scoreToSignal(score: number): HealthSignal {
  if (score >= 80) {
    return "green";
  }
  if (score >= 60) {
    return "amber";
  }
  return "red";
}

function buildModuleSummaries(): ExecutiveModuleSummary[] {
  const founder = getFounderConsoleSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();

  return [
    {
      id: "founder",
      title: "Founder Operations",
      headline: founder.hasData ? "Daily pilot activity tracked" : "Awaiting pilot activity today",
      metrics: [
        { label: "Active sessions", value: String(founder.dailyOverview.activeSessions) },
        { label: "Completed journeys", value: String(founder.dailyOverview.completedJourneys) },
        { label: "Search activity", value: String(founder.dailyOverview.searchActivity) },
        { label: "Runtime health", value: healthSignalLabel(founder.dailyOverview.runtimeHealth) },
      ],
      status: founder.pilotHealth.overall,
    },
    {
      id: "pilot",
      title: "Pilot Management",
      headline: `${pilot.readiness.sessionsCompleted} sessions · ${pilot.readiness.successfulJourneys} successful`,
      metrics: [
        { label: "Blocked journeys", value: String(pilot.readiness.blockedJourneys) },
        { label: "Follow-up backlog", value: String(pilot.readiness.followUpBacklog) },
        { label: "Next cohort", value: pilot.readiness.nextRecommendedLabel },
        { label: "Feedback entries", value: String(pilot.feedback.length) },
      ],
      status: pilot.readiness.blockedJourneys > pilot.readiness.successfulJourneys ? "red" : pilot.readiness.successfulJourneys > 0 ? "green" : "amber",
    },
    {
      id: "growth",
      title: "Growth Foundation",
      headline: earlyAccessStatusLabel(growth.earlyAccess.status),
      metrics: [
        { label: "Invited users", value: String(growth.earlyAccess.invitedUsers) },
        { label: "Pending invitations", value: String(growth.earlyAccess.pendingInvitations) },
        { label: "Waitlist interest", value: String(growth.earlyAccess.waitlistInterest) },
        { label: "Pilot-to-growth", value: `${growth.earlyAccess.pilotToGrowthReadiness}%` },
      ],
      status:
        growth.earlyAccess.status === "closed"
          ? "red"
          : growth.earlyAccess.status === "expanding"
            ? "green"
            : "amber",
    },
  ];
}

function buildHealthScore(): ExecutiveHealthScore {
  const founder = getFounderConsoleSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();

  const platformStability = signalToScore(founder.pilotHealth.stability);
  const pilotReadiness = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys / Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) * 100
    )
  );
  const growthReadiness = growth.earlyAccess.pilotToGrowthReadiness;
  const operationalHealth = Math.round(
    (signalToScore(founder.pilotHealth.overall) +
      signalToScore(founder.pilotHealth.journeyCompletion) +
      signalToScore(founder.pilotHealth.errorTrend)) /
      3
  );

  const overall = Math.round((platformStability + pilotReadiness + growthReadiness + operationalHealth) / 4);

  return {
    overall,
    platformStability,
    pilotReadiness,
    growthReadiness,
    operationalHealth,
    signal: scoreToSignal(overall),
  };
}

function buildAlerts(): ExecutiveAlert[] {
  const founder = getFounderConsoleSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const alerts: ExecutiveAlert[] = [];

  const abandonmentHighlight = founder.highlights.find((item) => item.label === "Highest abandonment flow");
  if (abandonmentHighlight && !abandonmentHighlight.value.includes("No abandonments")) {
    alerts.push({
      id: "alert-abandonment",
      priority: "high",
      title: "High abandonment detected",
      detail: abandonmentHighlight.value,
      source: "founder",
    });
  }

  if (founder.recommendations.some((item) => item.id === "improve-search")) {
    alerts.push({
      id: "alert-search",
      priority: "high",
      title: "Search degradation",
      detail: founder.recommendations.find((item) => item.id === "improve-search")?.detail ?? "Zero-result searches elevated.",
      source: "founder",
    });
  }

  const followUpCohorts = pilot.cohorts.filter((cohort) => cohort.followUpNeeded);
  if (followUpCohorts.length > 0 || pilot.readiness.followUpBacklog > 0) {
    alerts.push({
      id: "alert-pilot-followup",
      priority: followUpCohorts.length >= 2 ? "critical" : "high",
      title: "Pilot follow-up required",
      detail: `${pilot.readiness.followUpBacklog} follow-up items · ${followUpCohorts.map((c) => c.name).join(", ")}`,
      source: "pilot",
    });
  }

  if (growth.activation.supplyDemandImbalance.includes("Demand-heavy") || growth.activation.supplyDemandImbalance.includes("Supply-heavy")) {
    alerts.push({
      id: "alert-waitlist-imbalance",
      priority: "medium",
      title: "Waitlist imbalance",
      detail: growth.activation.supplyDemandImbalance,
      source: "growth",
    });
  }

  if (growth.earlyAccess.pendingInvitations >= 5) {
    alerts.push({
      id: "alert-invitation-backlog",
      priority: "medium",
      title: "Invitation backlog",
      detail: `${growth.earlyAccess.pendingInvitations} pending invitations across batches.`,
      source: "growth",
    });
  }

  if (founder.recommendations.some((item) => item.id === "investigate-retries")) {
    alerts.push({
      id: "alert-retries",
      priority: "high",
      title: "Elevated retry rate",
      detail: founder.recommendations.find((item) => item.id === "investigate-retries")?.detail ?? "Review error recovery.",
      source: "founder",
    });
  }

  const priorityOrder: Record<ExecutiveAlertPriority, number> = { critical: 0, high: 1, medium: 2 };
  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function buildDecisions(): ExecutiveDecision[] {
  const founder = getFounderConsoleSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const health = buildHealthScore();
  const decisions: ExecutiveDecision[] = [];

  for (const recommendation of founder.recommendations) {
    decisions.push({
      id: `founder-${recommendation.id}`,
      priority: recommendation.priority,
      title: recommendation.title,
      detail: recommendation.detail,
      source: "Founder Operations",
    });
  }

  if (pilot.readiness.successfulJourneys >= 2 && health.pilotReadiness >= 70) {
    decisions.push({
      id: "expand-customer-pilot",
      priority: "medium",
      title: "Expand customer pilot",
      detail: `${pilot.readiness.successfulJourneys} successful journeys support the next customer cohort.`,
      source: "Pilot Management",
    });
  }

  if (growth.activation.enoughProfessionals !== "ready") {
    decisions.push({
      id: "delay-provider-expansion",
      priority: "high",
      title: "Delay provider expansion",
      detail: "Professional supply is not yet ready for broader marketplace activation.",
      source: "Growth Foundation",
    });
  }

  if (founder.recommendations.some((item) => item.id === "review-onboarding")) {
    decisions.push({
      id: "focus-onboarding",
      priority: "high",
      title: "Focus onboarding improvements",
      detail: "Authentication abandonments exceed completions in current pilot window.",
      source: "Executive rules",
    });
  }

  if (health.overall >= 85 && growth.earlyAccess.pilotToGrowthReadiness >= 75 && growth.activation.enoughCustomers === "ready") {
    decisions.push({
      id: "prepare-public-mvp",
      priority: "low",
      title: "Prepare public MVP",
      detail: "Operational, pilot, and growth indicators support limited public MVP planning.",
      source: "Executive rules",
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      id: "continue-monitoring",
      priority: "low",
      title: "Continue executive monitoring",
      detail: "No urgent cross-module decisions from current operational metrics.",
      source: "Executive Operations Center",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const seen = new Set<string>();
  return decisions
    .filter((decision) => {
      if (seen.has(decision.title)) {
        return false;
      }
      seen.add(decision.title);
      return true;
    })
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 8);
}

export function getExecutiveOperationsSnapshot(now = Date.now()): ExecutiveOperationsSnapshot {
  const founder = getFounderConsoleSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    modules: buildModuleSummaries(),
    health: buildHealthScore(),
    alerts: buildAlerts(),
    decisions: buildDecisions(),
    hasData: founder.hasData || pilot.hasOperatorData || growth.hasOperatorData || pilot.sessions.length > 0,
  };
}

export function executiveHealthLabel(score: number): string {
  if (score >= 80) {
    return "Strong";
  }
  if (score >= 60) {
    return "Stable";
  }
  return "Attention required";
}

export { healthSignalLabel };
export type { HealthSignal } from "./founder-console.js";
