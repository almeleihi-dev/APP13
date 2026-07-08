/**
 * Chapter 9 Sprint 2 — Reliability & Recovery Center (client-only).
 * Aggregates existing operational state for reliability awareness — no new capabilities.
 */

import { getEnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import { getExecutiveOperationsSnapshot, type ExecutiveAlert } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getPilotDashboardSnapshot } from "./pilot-instrumentation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot, type ReadinessLevel } from "./production-operations.js";
import { scoreToSignal } from "./enterprise-readiness.js";

export type { ReadinessLevel };

export interface ReliabilityOverviewPillar {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface IncidentResponsePhase {
  id: string;
  phase: string;
  title: string;
  detail: string;
  signal: ReadinessLevel;
}

export interface RecoveryReadinessItem {
  id: string;
  area: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface OperationalRisk {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  mitigation: string;
  signal: ReadinessLevel;
}

export interface ReliabilityChecklistItem {
  id: string;
  category: "stability" | "recovery" | "monitoring" | "documentation" | "incident-process" | "launch-readiness";
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface ReliabilityRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface ReliabilityRecoverySnapshot {
  generatedAt: string;
  overview: ReliabilityOverviewPillar[];
  reliabilityScore: number;
  reliabilitySignal: ReadinessLevel;
  incidentResponse: IncidentResponsePhase[];
  recoveryReadiness: RecoveryReadinessItem[];
  riskRegister: OperationalRisk[];
  reliabilityChecklist: ReliabilityChecklistItem[];
  recommendations: ReliabilityRecommendation[];
  hasData: boolean;
}

function buildOverview(): ReliabilityOverviewPillar[] {
  const executive = getExecutiveOperationsSnapshot();
  const production = getProductionOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();

  const platformStability = executive.health.platformStability;
  const operationalResilience = executive.health.operationalHealth;
  const recoveryReadiness = Math.min(
    100,
    Math.round(
      (pilotDash.offlineRecoveries > 0 ? 30 : 0) +
        (pilotDash.retries > 0 ? 30 : 0) +
        (pilotDash.runtimeHealth.errorRate <= 10 ? 40 : pilotDash.runtimeHealth.errorRate <= 20 ? 25 : 10)
    )
  );
  const monitoringMaturity = executive.hasData && production.productionHealth.length > 0 ? executive.health.overall : 60;
  const launchConfidence = production.productionReadinessScore;

  const reliabilityScore = Math.round(
    (platformStability + operationalResilience + recoveryReadiness + monitoringMaturity + launchConfidence) / 5
  );

  return [
    {
      id: "platform-stability",
      label: "Platform stability",
      score: platformStability,
      signal: scoreToSignal(platformStability),
      summary: `Platform stability ${platformStability}% · ${executive.alerts.length} active alerts.`,
    },
    {
      id: "operational-resilience",
      label: "Operational resilience",
      score: operationalResilience,
      signal: scoreToSignal(operationalResilience),
      summary: "Operator console stack and executive health monitoring operational.",
    },
    {
      id: "recovery-readiness",
      label: "Recovery readiness",
      score: recoveryReadiness,
      signal: scoreToSignal(recoveryReadiness),
      summary: `${pilotDash.offlineRecoveries} offline recoveries · ${pilotDash.retries} successful retries.`,
    },
    {
      id: "monitoring-maturity",
      label: "Monitoring maturity",
      score: monitoringMaturity,
      signal: scoreToSignal(monitoringMaturity),
      summary: "Instrumentation, Executive Operations, and Production Operations provide visibility.",
    },
    {
      id: "launch-confidence",
      label: "Launch confidence",
      score: launchConfidence,
      signal: scoreToSignal(launchConfidence),
      summary: `Production readiness ${launchConfidence} · unified evaluation ${evaluation.unifiedReadinessScore}.`,
    },
    {
      id: "reliability-score",
      label: "Reliability score",
      score: reliabilityScore,
      signal: scoreToSignal(reliabilityScore),
      summary: "Composite reliability and recovery posture from operational aggregation.",
    },
  ];
}

function buildIncidentResponse(): IncidentResponsePhase[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const production = getProductionOperationsSnapshot();

  const hasDetection = executive.hasData || pilotDash.eventCount > 0;
  const hasClassification = production.incidents.length > 0;
  const hasInvestigation = production.incidents.some((i) => i.category === "investigation" || i.category === "active");
  const hasResolution = pilotDash.offlineRecoveries > 0 || pilotDash.retries > 0;
  const hasVerification = executive.health.platformStability >= 70;
  const hasPostReview = production.launchChecklist.some((i) => i.id === "pilot-approved" && i.signal === "green");

  return [
    {
      id: "detection",
      phase: "1",
      title: "Detection",
      detail: hasDetection
        ? "Executive alerts and pilot instrumentation detect errors, offline states, and journey friction."
        : "Awaiting instrumented sessions for detection signals.",
      signal: hasDetection ? "green" : "amber",
    },
    {
      id: "classification",
      phase: "2",
      title: "Classification",
      detail: hasClassification
        ? "Incidents classified as active, monitoring, investigation, or resolved in Production Operations."
        : "Classification available when incidents are recorded.",
      signal: hasClassification ? "green" : "amber",
    },
    {
      id: "investigation",
      phase: "3",
      title: "Investigation",
      detail: hasInvestigation
        ? "Operator consoles and instrumentation exports support root-cause investigation."
        : "No active investigations from current operational state.",
      signal: hasInvestigation ? "amber" : "green",
    },
    {
      id: "resolution",
      phase: "4",
      title: "Resolution",
      detail: hasResolution
        ? "Retry flows, offline recovery, and session expiry handling resolve user-facing issues."
        : "Resolution patterns documented; limited recovery events in current sessions.",
      signal: hasResolution ? "green" : "amber",
    },
    {
      id: "verification",
      phase: "5",
      title: "Verification",
      detail: hasVerification
        ? "Platform stability and regression suites verify resolution before closure."
        : "Verification requires stability score improvement.",
      signal: hasVerification ? "green" : "amber",
    },
    {
      id: "post-review",
      phase: "6",
      title: "Post-incident review",
      detail: hasPostReview
        ? "Pilot Management follow-up board and feedback capture support post-incident review."
        : "Post-incident review workflow available via Pilot Management.",
      signal: hasPostReview ? "green" : "amber",
    },
  ];
}

function buildRecoveryReadiness(): RecoveryReadinessItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const founder = getFounderConsoleSnapshot();

  return [
    {
      id: "runtime-recovery",
      area: "Runtime recovery",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "PresentationError, retry flows, and reloadNeedExperience support runtime recovery in web shell.",
    },
    {
      id: "session-recovery",
      area: "Session recovery",
      signal: "green",
      detail: "JWT refresh rotation, session expiry messaging, and server logout handle session recovery.",
    },
    {
      id: "retry-handling",
      area: "Retry handling",
      signal: pilotDash.retries > 0 || pilotDash.runtimeHealth.errorRate <= 15 ? "green" : "amber",
      detail: `${pilotDash.retries} successful retries recorded in instrumentation.`,
    },
    {
      id: "offline-recovery",
      area: "Offline recovery",
      signal: pilotDash.offlineRecoveries >= 1 ? "green" : "amber",
      detail: `${pilotDash.offlineRecoveries} offline recovery events · detected/recovered/retry_failed tracking.`,
    },
    {
      id: "operational-continuity",
      area: "Operational continuity",
      signal: founder.hasData && executive.health.operationalHealth >= 60 ? "green" : "amber",
      detail: "Founder Console, Executive Operations, and Production Operations maintain operator continuity.",
    },
  ];
}

function alertToRisk(alert: ExecutiveAlert): OperationalRisk {
  return {
    id: `risk-${alert.id}`,
    severity: alert.priority === "critical" ? "critical" : alert.priority === "high" ? "high" : "medium",
    title: alert.title,
    mitigation: `${alert.detail} — monitor via ${alert.source} module.`,
    signal: alert.priority === "critical" ? "red" : alert.priority === "high" ? "amber" : "green",
  };
}

function buildRiskRegister(): OperationalRisk[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const risks: OperationalRisk[] = [];

  for (const alert of executive.alerts) {
    risks.push(alertToRisk(alert));
  }

  if (pilot.readiness.blockedJourneys > pilot.readiness.successfulJourneys) {
    risks.push({
      id: "risk-blocked-journeys",
      severity: "high",
      title: "Elevated blocked pilot journeys",
      mitigation: `${pilot.readiness.blockedJourneys} blocked vs ${pilot.readiness.successfulJourneys} successful — review via Pilot Management.`,
      signal: "amber",
    });
  }

  if (pilot.readiness.followUpBacklog > 5) {
    risks.push({
      id: "risk-followup-backlog",
      severity: "medium",
      title: "Follow-up backlog elevated",
      mitigation: `${pilot.readiness.followUpBacklog} open follow-up items — assign owners in Pilot Management.`,
      signal: "amber",
    });
  }

  const providerGap = evaluation.evaluationSummary
    .find((s) => s.id === "conditional")
    ?.items.some((i) => i.toLowerCase().includes("provider") || i.toLowerCase().includes("professional"));
  if (providerGap) {
    risks.push({
      id: "risk-provider-instrumentation",
      severity: "medium",
      title: "Provider instrumentation gap",
      mitigation: "Professional journey metrics remain a documented blind spot — facilitator guidance required.",
      signal: "amber",
    });
  }

  if (evaluation.centerSummaries.find((c) => c.id === "government")?.signal === "red") {
    risks.push({
      id: "risk-gov-cohort",
      severity: "low",
      title: "Government stakeholder cohort not started",
      mitigation: "Schedule government evaluation cohort before public-sector launch.",
      signal: "amber",
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: "risk-none",
      severity: "low",
      title: "No elevated operational risks",
      mitigation: "Current operational state shows no blocking risks from aggregated modules.",
      signal: "green",
    });
  }

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 12);
}

function buildReliabilityChecklist(): ReliabilityChecklistItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const production = getProductionOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  return [
    {
      id: "stability-platform",
      category: "stability",
      label: "Platform stability threshold",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: `Platform stability at ${executive.health.platformStability}%.`,
    },
    {
      id: "stability-runtime",
      category: "stability",
      label: "Runtime error rate acceptable",
      signal: pilotDash.runtimeHealth.errorRate <= 10 ? "green" : pilotDash.runtimeHealth.errorRate <= 20 ? "amber" : "red",
      detail: `Instrumentation error rate ${pilotDash.runtimeHealth.errorRate}%.`,
    },
    {
      id: "recovery-retry",
      category: "recovery",
      label: "Retry handling verified",
      signal: pilotDash.retries >= 0 ? "green" : "amber",
      detail: "Error retry flows wired in web shell with instrumentation tracking.",
    },
    {
      id: "recovery-offline",
      category: "recovery",
      label: "Offline recovery path",
      signal: "green",
      detail: "Offline detection and recovery events tracked in pilot instrumentation.",
    },
    {
      id: "recovery-session",
      category: "recovery",
      label: "Session recovery path",
      signal: "green",
      detail: "JWT refresh and session expiry handling documented and implemented.",
    },
    {
      id: "monitoring-executive",
      category: "monitoring",
      label: "Executive monitoring active",
      signal: executive.hasData ? "green" : "amber",
      detail: "Executive Operations Center aggregates founder, pilot, and growth signals.",
    },
    {
      id: "monitoring-production",
      category: "monitoring",
      label: "Production monitoring active",
      signal: production.hasData ? "green" : "amber",
      detail: "Production Operations Center provides launch and incident visibility.",
    },
    {
      id: "docs-runbooks",
      category: "documentation",
      label: "Operator runbooks available",
      signal: "green",
      detail: "Chapter 6–9 RC reports and operator consoles documented.",
    },
    {
      id: "incident-process",
      category: "incident-process",
      label: "Incident response lifecycle defined",
      signal: production.incidents.length > 0 ? "green" : "amber",
      detail: "Detection through post-incident review presented in Reliability Center.",
    },
    {
      id: "incident-followup",
      category: "incident-process",
      label: "Follow-up workflow active",
      signal: pilot.readiness.followUpBacklog <= 5 ? "green" : "amber",
      detail: `${pilot.readiness.followUpBacklog} open follow-up items.`,
    },
    {
      id: "launch-production",
      category: "launch-readiness",
      label: "Production launch checklist",
      signal: production.productionSignal,
      detail: `Production readiness score ${production.productionReadinessScore}.`,
    },
    {
      id: "launch-rc",
      category: "launch-readiness",
      label: "Launch RC target identified",
      signal: production.productionReadinessScore >= 80 ? "green" : "amber",
      detail: "Chapter 9 Sprint 4 Launch RC is the certification target.",
    },
  ];
}

function buildRecommendations(
  overview: ReliabilityOverviewPillar[],
  checklist: ReliabilityChecklistItem[]
): ReliabilityRecommendation[] {
  const production = getProductionOperationsSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const recommendations: ReliabilityRecommendation[] = [];

  const reliabilityScore = overview.find((p) => p.id === "reliability-score")?.score ?? 0;
  const redItems = checklist.filter((i) => i.signal === "red").length;
  const criticalRisks = executive.alerts.filter((a) => a.priority === "critical").length;

  if (reliabilityScore >= 80 && redItems === 0 && criticalRisks === 0) {
    recommendations.push({
      id: "ready-launch",
      priority: "high",
      title: "Ready for launch",
      detail: "Reliability, recovery, and monitoring posture support controlled launch planning.",
    });
  }

  if (executive.alerts.length > 0) {
    recommendations.push({
      id: "continue-monitoring",
      priority: "medium",
      title: "Continue monitoring",
      detail: `${executive.alerts.length} operational alerts require ongoing observation.`,
    });
  }

  const providerAmber = evaluation.evaluationSummary
    .find((s) => s.id === "conditional")
    ?.items.some((i) => i.toLowerCase().includes("provider") || i.toLowerCase().includes("professional"));
  if (providerAmber) {
    recommendations.push({
      id: "improve-provider-instrumentation",
      priority: "medium",
      title: "Improve provider instrumentation",
      detail: "Professional journey metrics remain a documented reliability blind spot.",
    });
  }

  if (criticalRisks > 0 || checklist.filter((i) => i.signal === "amber").length > 4) {
    recommendations.push({
      id: "reduce-operational-risk",
      priority: "high",
      title: "Reduce operational risk",
      detail: "Address critical alerts and amber checklist items before launch authorization.",
    });
  }

  if (production.productionReadinessScore >= 75 && reliabilityScore >= 75) {
    recommendations.push({
      id: "proceed-launch-rc",
      priority: "medium",
      title: "Proceed to Launch RC",
      detail: "Production and reliability readiness support Chapter 9 Sprint 4 Launch certification.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-reliability-review",
      priority: "low",
      title: "Continue reliability review",
      detail: "No blocking items from current reliability assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getReliabilityRecoverySnapshot(now = Date.now()): ReliabilityRecoverySnapshot {
  const overview = buildOverview();
  const reliabilityChecklist = buildReliabilityChecklist();
  const reliabilityPillar = overview.find((p) => p.id === "reliability-score");
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    reliabilityScore: reliabilityPillar?.score ?? 0,
    reliabilitySignal: reliabilityPillar?.signal ?? "amber",
    incidentResponse: buildIncidentResponse(),
    recoveryReadiness: buildRecoveryReadiness(),
    riskRegister: buildRiskRegister(),
    reliabilityChecklist,
    recommendations: buildRecommendations(overview, reliabilityChecklist),
    hasData: executive.hasData || reliabilityChecklist.some((i) => i.signal === "green"),
  };
}

export { scoreToSignal };
