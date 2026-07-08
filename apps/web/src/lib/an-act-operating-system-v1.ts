/**
 * Chapter 10 Sprint 4 — AN ACT Operating System v1 Center (client-only).
 * Single executive entry point aggregating Chapters 6–10 operational centers — no new capabilities.
 */

import { getEnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import { scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveIntelligenceCenterSnapshot } from "./executive-intelligence-center.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import { getLaunchReadinessSnapshot } from "./launch-readiness.js";
import { getLiveMarketplaceOperationsSnapshot } from "./live-marketplace-operations.js";
import { getOperationalDecisionCenterSnapshot } from "./operational-decision-center.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot } from "./production-operations.js";
import { getReliabilityRecoverySnapshot } from "./reliability-recovery.js";

export type { ReadinessLevel };

export type OperatingLifecyclePhase = "observe" | "understand" | "decide" | "act" | "review" | "improve";

export type OperatingStatus = "operationally-ready" | "operationally-ready-with-conditions" | "not-operationally-ready";

export interface OperatingCenterSummary {
  id: string;
  label: string;
  chapter: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
  lifecyclePhase: OperatingLifecyclePhase;
}

export interface OperatingLifecycleStep {
  phase: OperatingLifecyclePhase;
  label: string;
  description: string;
  centers: string[];
}

export interface ExecutiveDashboardMetric {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  detail: string;
}

export interface OperatingPrinciple {
  id: string;
  title: string;
  detail: string;
}

export interface AnActOperatingSystemV1Snapshot {
  generatedAt: string;
  centers: OperatingCenterSummary[];
  operatingSystemScore: number;
  operatingSystemSignal: ReadinessLevel;
  lifecycle: OperatingLifecycleStep[];
  dashboard: ExecutiveDashboardMetric[];
  principles: OperatingPrinciple[];
  operatingStatus: OperatingStatus;
  operatingStatusReason: string;
  executiveClosingSummary: string;
  overallConfidence: number;
  hasData: boolean;
}

const PRINCIPLES: OperatingPrinciple[] = [
  {
    id: "server-authoritative",
    title: "Server authoritative Runtime",
    detail: "Runtime state transitions are server-authoritative; the shell renders, never decides.",
  },
  {
    id: "frozen-json",
    title: "Frozen Runtime JSON",
    detail: "Experience contracts frozen and validated through RC1/RC2 and Chapter 6–10 verification suites.",
  },
  {
    id: "rule-based-intelligence",
    title: "Rule-based operational intelligence",
    detail: "Executive, decision, and intelligence centers use deterministic aggregation — no AI generation.",
  },
  {
    id: "presentation-over-duplication",
    title: "Presentation over duplication",
    detail: "Operational centers aggregate existing modules without duplicating business logic.",
  },
  {
    id: "aggregation-over-creep",
    title: "Aggregation over feature creep",
    detail: "New sprints add visibility layers, not marketplace capabilities or backend services.",
  },
  {
    id: "enterprise-first",
    title: "Enterprise-first architecture",
    detail: "Governance, readiness, certification, and evaluation centers support enterprise stakeholders.",
  },
];

function signalFromHealth(signal: string): ReadinessLevel {
  if (signal === "green") {
    return "green";
  }
  if (signal === "amber") {
    return "amber";
  }
  return "red";
}

function buildCenters(now: number): OperatingCenterSummary[] {
  const founder = getFounderConsoleSnapshot(now);
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const enterprise = getEnterpriseEvaluationSnapshot();
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const launch = getLaunchReadinessSnapshot(now);
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const decision = getOperationalDecisionCenterSnapshot(now);
  const intelligence = getExecutiveIntelligenceCenterSnapshot(now);

  const pilotScore = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys / Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) *
        100
    )
  );

  return [
    {
      id: "founder",
      label: "Founder Operations",
      chapter: "Chapter 7",
      score: founder.pilotHealth.overall === "green" ? 90 : founder.pilotHealth.overall === "amber" ? 75 : 55,
      signal: signalFromHealth(founder.pilotHealth.overall),
      summary: `${founder.dailyOverview.completedJourneys} journeys completed today.`,
      lifecyclePhase: "observe",
    },
    {
      id: "pilot-management",
      label: "Pilot Management",
      chapter: "Chapter 7",
      score: pilotScore,
      signal: scoreToSignal(pilotScore),
      summary: `${pilot.readiness.sessionsCompleted} sessions · ${pilot.readiness.followUpBacklog} follow-ups.`,
      lifecyclePhase: "observe",
    },
    {
      id: "growth",
      label: "Growth Foundation",
      chapter: "Chapter 7",
      score: growth.earlyAccess.pilotToGrowthReadiness,
      signal: scoreToSignal(growth.earlyAccess.pilotToGrowthReadiness),
      summary: `${growth.earlyAccess.invitedUsers} invited · ${growth.activation.nextActivationMove}.`,
      lifecyclePhase: "act",
    },
    {
      id: "executive-operations",
      label: "Executive Operations",
      chapter: "Chapter 7",
      score: executive.health.overall,
      signal: scoreToSignal(executive.health.overall),
      summary: `${executive.alerts.length} alerts · health ${executive.health.overall}.`,
      lifecyclePhase: "act",
    },
    {
      id: "enterprise-evaluation",
      label: "Enterprise Evaluation",
      chapter: "Chapter 8",
      score: enterprise.unifiedReadinessScore,
      signal: enterprise.unifiedSignal,
      summary: `Unified score ${enterprise.unifiedReadinessScore} across readiness centers.`,
      lifecyclePhase: "understand",
    },
    {
      id: "production-operations",
      label: "Production Operations",
      chapter: "Chapter 9",
      score: production.productionReadinessScore,
      signal: production.productionSignal,
      summary: `${production.incidents.filter((i) => i.category === "active").length} active incidents.`,
      lifecyclePhase: "observe",
    },
    {
      id: "reliability-recovery",
      label: "Reliability & Recovery",
      chapter: "Chapter 9",
      score: reliability.reliabilityScore,
      signal: reliability.reliabilitySignal,
      summary: `${reliability.riskRegister.length} risks in register.`,
      lifecyclePhase: "review",
    },
    {
      id: "launch-readiness",
      label: "Launch Readiness",
      chapter: "Chapter 9",
      score: launch.launchReadinessScore,
      signal: launch.launchSignal,
      summary: `${launch.launchDecision.replace(/-/g, " ").toUpperCase()} · ${launch.launchGates.filter((g) => g.signal === "green").length} gates green.`,
      lifecyclePhase: "decide",
    },
    {
      id: "live-marketplace",
      label: "Live Marketplace Operations",
      chapter: "Chapter 10",
      score: marketplace.marketplaceHealthScore,
      signal: marketplace.marketplaceHealthSignal,
      summary: `Health ${marketplace.marketplaceHealthScore} · ${marketplace.liveFeed.length} feed events.`,
      lifecyclePhase: "observe",
    },
    {
      id: "operational-decision",
      label: "Operational Decision Center",
      chapter: "Chapter 10",
      score: decision.operationalReadinessScore,
      signal: decision.operationalReadinessSignal,
      summary: `${decision.actionQueue.filter((a) => a.status === "pending").length} pending actions.`,
      lifecyclePhase: "decide",
    },
    {
      id: "executive-intelligence",
      label: "Executive Intelligence Center",
      chapter: "Chapter 10",
      score: intelligence.intelligenceScore,
      signal: intelligence.intelligenceSignal,
      summary: `${intelligence.insights.length} insights · confidence ${intelligence.executiveBrief.overallConfidence}%.`,
      lifecyclePhase: "understand",
    },
  ];
}

function buildLifecycle(centers: OperatingCenterSummary[]): OperatingLifecycleStep[] {
  const phases: OperatingLifecycleStep[] = [
    {
      phase: "observe",
      label: "Observe",
      description: "Monitor pilot activity, marketplace signals, and production health.",
      centers: [],
    },
    {
      phase: "understand",
      label: "Understand",
      description: "Synthesize enterprise evaluation and executive intelligence.",
      centers: [],
    },
    {
      phase: "decide",
      label: "Decide",
      description: "Apply rule-based decisions and launch readiness assessment.",
      centers: [],
    },
    {
      phase: "act",
      label: "Act",
      description: "Execute growth activation and executive operational response.",
      centers: [],
    },
    {
      phase: "review",
      label: "Review",
      description: "Assess reliability, recovery, and pilot follow-up outcomes.",
      centers: [],
    },
    {
      phase: "improve",
      label: "Improve",
      description: "Close the loop through launch gates and certification feedback.",
      centers: [],
    },
  ];

  for (const center of centers) {
    const step = phases.find((p) => p.phase === center.lifecyclePhase);
    if (step && !step.centers.includes(center.label)) {
      step.centers.push(center.label);
    }
  }

  phases.find((p) => p.phase === "improve")?.centers.push("Launch Readiness", "AN ACT v1 Certification");

  return phases;
}

function buildDashboard(now: number): ExecutiveDashboardMetric[] {
  const executive = getExecutiveOperationsSnapshot();
  const marketplace = getLiveMarketplaceOperationsSnapshot(now);
  const decision = getOperationalDecisionCenterSnapshot(now);
  const enterprise = getEnterpriseEvaluationSnapshot();
  const production = getProductionOperationsSnapshot();
  const launch = getLaunchReadinessSnapshot(now);
  const intelligence = getExecutiveIntelligenceCenterSnapshot(now);

  return [
    {
      id: "platform",
      label: "Platform",
      score: executive.health.platformStability,
      signal: scoreToSignal(executive.health.platformStability),
      detail: `Platform stability ${executive.health.platformStability}%.`,
    },
    {
      id: "marketplace",
      label: "Marketplace",
      score: marketplace.marketplaceHealthScore,
      signal: marketplace.marketplaceHealthSignal,
      detail: `${marketplace.overview.find((m) => m.id === "completed-actions")?.value ?? 0} actions completed.`,
    },
    {
      id: "operations",
      label: "Operations",
      score: decision.operationalReadinessScore,
      signal: decision.operationalReadinessSignal,
      detail: `${decision.actionQueue.length} items in executive action queue.`,
    },
    {
      id: "enterprise",
      label: "Enterprise",
      score: enterprise.unifiedReadinessScore,
      signal: enterprise.unifiedSignal,
      detail: `Unified evaluation ${enterprise.unifiedReadinessScore}.`,
    },
    {
      id: "production",
      label: "Production",
      score: production.productionReadinessScore,
      signal: production.productionSignal,
      detail: `Production readiness ${production.productionReadinessScore}.`,
    },
    {
      id: "launch",
      label: "Launch",
      score: launch.launchReadinessScore,
      signal: launch.launchSignal,
      detail: launch.launchDecisionReason,
    },
    {
      id: "confidence",
      label: "Overall confidence",
      score: intelligence.executiveBrief.overallConfidence,
      signal: intelligence.executiveBrief.confidenceSignal,
      detail: intelligence.executiveBrief.platformCondition,
    },
  ];
}

function determineOperatingStatus(
  centers: OperatingCenterSummary[],
  now: number
): { status: OperatingStatus; reason: string } {
  const launch = getLaunchReadinessSnapshot(now);
  const decision = getOperationalDecisionCenterSnapshot(now);
  const redCenters = centers.filter((c) => c.signal === "red").length;
  const criticalActions = decision.actionQueue.filter((a) => a.priority === "critical" && a.status === "pending").length;
  const avgScore = Math.round(centers.reduce((sum, c) => sum + c.score, 0) / Math.max(centers.length, 1));

  if (redCenters > 0 || avgScore < 65 || launch.launchDecision === "no-go") {
    return {
      status: "not-operationally-ready",
      reason: `${redCenters} center(s) red · ${criticalActions} critical pending actions · launch ${launch.launchDecision.replace(/-/g, " ")}.`,
    };
  }

  if (
    launch.launchDecision === "conditional-go" ||
    criticalActions > 0 ||
    decision.actionQueue.filter((a) => a.priority === "high" && a.status === "pending").length > 2
  ) {
    return {
      status: "operationally-ready-with-conditions",
      reason: "Operating system assembled and certified; outstanding operational conditions documented in decision and launch centers.",
    };
  }

  return {
    status: "operationally-ready",
    reason: "All operational centers green or amber within thresholds; AN ACT Operating System v1 supports daily executive operation.",
  };
}

function buildClosingSummary(
  status: OperatingStatus,
  score: number,
  centers: OperatingCenterSummary[],
  confidence: number
): string {
  const greenCount = centers.filter((c) => c.signal === "green").length;

  if (status === "operationally-ready") {
    return `AN ACT Operating System v1 is operationally ready at ${score}/100 with ${greenCount} of ${centers.length} centers green. The complete Observe → Understand → Decide → Act → Review → Improve lifecycle is certified across Chapters 6–10. Executive confidence stands at ${confidence}%.`;
  }

  if (status === "operationally-ready-with-conditions") {
    return `AN ACT Operating System v1 is operationally ready with conditions at ${score}/100. All ${centers.length} operational centers are assembled into a single executive entry point. Technical and operational aggregation is complete; remaining conditions are documented in Launch Readiness and Operational Decision centers. Executive confidence: ${confidence}%.`;
  }

  return `AN ACT Operating System v1 is not operationally ready at ${score}/100. One or more centers require remediation before the certified operating model can support daily executive operation. Review individual center scores and the executive action queue.`;
}

export function operatingStatusLabel(status: OperatingStatus): string {
  if (status === "operationally-ready") {
    return "Operationally Ready";
  }
  if (status === "operationally-ready-with-conditions") {
    return "Operationally Ready with Conditions";
  }
  return "Not Operationally Ready";
}

export function getAnActOperatingSystemV1Snapshot(now = Date.now()): AnActOperatingSystemV1Snapshot {
  const centers = buildCenters(now);
  const dashboard = buildDashboard(now);
  const intelligence = getExecutiveIntelligenceCenterSnapshot(now);
  const operatingSystemScore = Math.round(centers.reduce((sum, c) => sum + c.score, 0) / Math.max(centers.length, 1));
  const { status, reason } = determineOperatingStatus(centers, now);

  return {
    generatedAt: new Date(now).toISOString(),
    centers,
    operatingSystemScore,
    operatingSystemSignal: scoreToSignal(operatingSystemScore),
    lifecycle: buildLifecycle(centers),
    dashboard,
    principles: PRINCIPLES,
    operatingStatus: status,
    operatingStatusReason: reason,
    executiveClosingSummary: buildClosingSummary(status, operatingSystemScore, centers, intelligence.executiveBrief.overallConfidence),
    overallConfidence: intelligence.executiveBrief.overallConfidence,
    hasData: centers.some((c) => c.signal === "green") || intelligence.hasData,
  };
}

export { scoreToSignal };
