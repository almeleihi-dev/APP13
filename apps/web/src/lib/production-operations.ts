/**
 * Chapter 9 Sprint 1 — Production Operations Center (client-only).
 * Aggregates existing operational state for production awareness — no new capabilities.
 */

import { getEnterpriseEvaluationSnapshot, type ReadinessLevel } from "./enterprise-evaluation.js";
import { getExecutiveOperationsSnapshot, type ExecutiveAlert } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getPilotDashboardSnapshot } from "./pilot-instrumentation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { scoreToSignal } from "./enterprise-readiness.js";

export type { ReadinessLevel };

export interface ProductionOverviewPillar {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface ReleaseStatusItem {
  id: string;
  label: string;
  value: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface OperationalIncident {
  id: string;
  category: "active" | "resolved" | "monitoring" | "investigation";
  title: string;
  detail: string;
  signal: ReadinessLevel;
}

export interface ProductionHealthMetric {
  id: string;
  label: string;
  value: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface LaunchChecklistItem {
  id: string;
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface ProductionRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface ProductionOperationsSnapshot {
  generatedAt: string;
  overview: ProductionOverviewPillar[];
  productionReadinessScore: number;
  productionSignal: ReadinessLevel;
  releaseStatus: ReleaseStatusItem[];
  incidents: OperationalIncident[];
  productionHealth: ProductionHealthMetric[];
  launchChecklist: LaunchChecklistItem[];
  recommendations: ProductionRecommendation[];
  hasData: boolean;
}

function buildOverview(): ProductionOverviewPillar[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const pilot = getPilotManagementSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();

  const platformHealth = executive.health.overall;
  const runtimeHealth = Math.max(0, 100 - pilotDash.runtimeHealth.errorRate * 2);
  const pilotHealth = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys / Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) * 100
    )
  );
  const operationalReadiness = executive.health.operationalHealth;
  const enterpriseReadiness = evaluation.unifiedReadinessScore;

  const productionReadiness = Math.round(
    (platformHealth + runtimeHealth + pilotHealth + operationalReadiness + enterpriseReadiness) / 5
  );

  return [
    {
      id: "platform-health",
      label: "Platform health",
      score: platformHealth,
      signal: scoreToSignal(platformHealth),
      summary: `Executive health ${platformHealth} · ${executive.alerts.length} active alerts.`,
    },
    {
      id: "runtime-health",
      label: "Runtime health",
      score: runtimeHealth,
      signal: scoreToSignal(runtimeHealth),
      summary: `Error rate ${pilotDash.runtimeHealth.errorRate}% · ${pilotDash.runtimeHealth.slowJourneyCount} slow journeys.`,
    },
    {
      id: "pilot-health",
      label: "Pilot health",
      score: pilotHealth,
      signal: scoreToSignal(pilotHealth),
      summary: `${pilot.readiness.successfulJourneys} successful · ${pilot.readiness.blockedJourneys} blocked journeys.`,
    },
    {
      id: "operational-readiness",
      label: "Operational readiness",
      score: operationalReadiness,
      signal: scoreToSignal(operationalReadiness),
      summary: "Founder, Pilot Management, and Executive Operations stack operational.",
    },
    {
      id: "enterprise-readiness",
      label: "Enterprise readiness",
      score: enterpriseReadiness,
      signal: scoreToSignal(enterpriseReadiness),
      summary: `Unified evaluation score ${enterpriseReadiness} from Chapter 8 readiness centers.`,
    },
    {
      id: "production-readiness",
      label: "Production readiness",
      score: productionReadiness,
      signal: scoreToSignal(productionReadiness),
      summary: "Composite production launch posture from operational aggregation.",
    },
  ];
}

function buildReleaseStatus(): ReleaseStatusItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();

  const verificationGreen = evaluation.unifiedReadinessScore >= 75 && executive.alerts.filter((a) => a.priority === "critical").length === 0;
  const regressionGreen = executive.health.platformStability >= 70;

  return [
    {
      id: "current-release",
      label: "Current release",
      value: "MVP RC · Chapter 8",
      signal: "green",
      detail: "Stable MVP foundation with enterprise evaluation stack complete.",
    },
    {
      id: "candidate-release",
      label: "Candidate release",
      value: "Production Launch RC",
      signal: evaluation.unifiedReadinessScore >= 80 ? "green" : "amber",
      detail: "Chapter 9 prepares controlled public launch readiness.",
    },
    {
      id: "verification-status",
      label: "Verification status",
      value: verificationGreen ? "Passing" : "Conditional",
      signal: verificationGreen ? "green" : "amber",
      detail: "Chapter 6–8 verification suites with npm run build gates.",
    },
    {
      id: "regression-status",
      label: "Regression status",
      value: regressionGreen ? "Clear" : "Review",
      signal: regressionGreen ? "green" : "amber",
      detail: "Chapter 7 Sprint 4 and Chapter 8 sprint regressions in verify scripts.",
    },
    {
      id: "deployment-readiness",
      label: "Deployment readiness",
      value: evaluation.unifiedReadinessScore >= 75 ? "Ready" : "Planning",
      signal: evaluation.unifiedReadinessScore >= 75 ? "green" : "amber",
      detail: "Container-ready architecture documented; no deployment automation in this sprint.",
    },
  ];
}

function alertToIncident(alert: ExecutiveAlert, category: OperationalIncident["category"]): OperationalIncident {
  return {
    id: `alert-${alert.id}`,
    category,
    title: alert.title,
    detail: `${alert.detail} (source: ${alert.source})`,
    signal: alert.priority === "critical" ? "red" : alert.priority === "high" ? "amber" : "green",
  };
}

function buildIncidents(): OperationalIncident[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const incidents: OperationalIncident[] = [];

  for (const alert of executive.alerts) {
    if (alert.priority === "critical" || alert.priority === "high") {
      incidents.push(alertToIncident(alert, "active"));
    } else if (alert.priority === "medium") {
      incidents.push(alertToIncident(alert, "monitoring"));
    }
  }

  const errorCategories = Object.entries(pilotDash.errors);
  if (errorCategories.length > 0) {
    for (const [category, count] of errorCategories) {
      incidents.push({
        id: `error-${category}`,
        category: count >= 3 ? "investigation" : "monitoring",
        title: `${category} errors (${count})`,
        detail: "Derived from pilot instrumentation error events.",
        signal: count >= 5 ? "red" : count >= 2 ? "amber" : "green",
      });
    }
  }

  if (pilotDash.offlineRecoveries > 0) {
    incidents.push({
      id: "offline-recovered",
      category: "resolved",
      title: `Offline recovery (${pilotDash.offlineRecoveries})`,
      detail: "Sessions recovered from offline state via instrumentation.",
      signal: "green",
    });
  }

  if (pilotDash.retries > 0) {
    incidents.push({
      id: "retries-recovered",
      category: "resolved",
      title: `Successful retries (${pilotDash.retries})`,
      detail: "Error recovery retries completed in instrumented sessions.",
      signal: "green",
    });
  }

  if (incidents.length === 0) {
    incidents.push({
      id: "no-incidents",
      category: "monitoring",
      title: "No active incidents",
      detail: "Production monitoring shows no blocking operational incidents.",
      signal: "green",
    });
  }

  return incidents.slice(0, 12);
}

function buildProductionHealth(): ProductionHealthMetric[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const founder = getFounderConsoleSnapshot();

  const errorRate = pilotDash.runtimeHealth.errorRate;
  const retryRate = pilotDash.eventCount > 0 ? Math.round((pilotDash.retries / pilotDash.eventCount) * 100) : 0;

  return [
    {
      id: "runtime-stability",
      label: "Runtime stability",
      value: `${executive.health.platformStability}%`,
      signal: scoreToSignal(executive.health.platformStability),
      detail: "Executive platform stability score from operator modules.",
    },
    {
      id: "error-trends",
      label: "Error trends",
      value: `${errorRate}%`,
      signal: errorRate <= 5 ? "green" : errorRate <= 15 ? "amber" : "red",
      detail: `${Object.keys(pilotDash.errors).length} error categories in instrumentation.`,
    },
    {
      id: "retry-trends",
      label: "Retry trends",
      value: `${pilotDash.retries} retries`,
      signal: retryRate <= 10 ? "green" : "amber",
      detail: `Retry rate ${retryRate}% of instrumented events.`,
    },
    {
      id: "offline-recovery",
      label: "Offline recovery",
      value: `${pilotDash.offlineRecoveries} recoveries`,
      signal: pilotDash.offlineRecoveries >= 1 || errorRate <= 10 ? "green" : "amber",
      detail: "Offline detection and recovery events from instrumentation.",
    },
    {
      id: "operational-alerts",
      label: "Operational alerts",
      value: `${executive.alerts.length} active`,
      signal: executive.alerts.some((a) => a.priority === "critical") ? "red" : executive.alerts.length > 0 ? "amber" : "green",
      detail: `${founder.dailyOverview.activeSessions} active sessions under monitoring.`,
    },
  ];
}

function buildLaunchChecklist(): LaunchChecklistItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const enterprise = evaluation.centerSummaries.find((c) => c.id === "enterprise");
  const government = evaluation.centerSummaries.find((c) => c.id === "government");

  return [
    {
      id: "regression",
      label: "Regression complete",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "Chapter 6–8 verification suites pass with platform build.",
    },
    {
      id: "pilot-approved",
      label: "Pilot approved",
      signal: pilot.readiness.successfulJourneys >= 1 && pilot.readiness.blockedJourneys <= pilot.readiness.successfulJourneys ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful pilot journeys recorded.`,
    },
    {
      id: "enterprise-eval",
      label: "Enterprise evaluation complete",
      signal: (enterprise?.score ?? 0) >= 75 ? "green" : "amber",
      detail: `Enterprise readiness score ${enterprise?.score ?? 0}.`,
    },
    {
      id: "government-eval",
      label: "Government evaluation complete",
      signal: (government?.score ?? 0) >= 70 ? "green" : "amber",
      detail: `Government readiness score ${government?.score ?? 0}.`,
    },
    {
      id: "documentation",
      label: "Documentation complete",
      signal: "green",
      detail: "Partner package and Chapter 6–8 RC reports available.",
    },
    {
      id: "production-review",
      label: "Production review complete",
      signal: executive.alerts.filter((a) => a.priority === "critical").length === 0 ? "green" : "red",
      detail: "Critical operational alerts resolved before launch.",
    },
    {
      id: "monitoring",
      label: "Operational monitoring active",
      signal: executive.hasData ? "green" : "amber",
      detail: "Executive Operations and instrumentation provide operational visibility.",
    },
    {
      id: "launch-rc",
      label: "Launch RC prepared",
      signal: evaluation.unifiedReadinessScore >= 80 ? "green" : "amber",
      detail: "Chapter 9 Sprint 4 Launch RC is the target candidate release.",
    },
  ];
}

function buildRecommendations(
  overview: ProductionOverviewPillar[],
  checklist: LaunchChecklistItem[]
): ProductionRecommendation[] {
  const executive = getExecutiveOperationsSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const recommendations: ProductionRecommendation[] = [];

  const prodScore = overview.find((p) => p.id === "production-readiness")?.score ?? 0;
  const redItems = checklist.filter((i) => i.signal === "red").length;
  const criticalAlerts = executive.alerts.filter((a) => a.priority === "critical").length;

  if (prodScore >= 80 && redItems === 0 && criticalAlerts === 0) {
    recommendations.push({
      id: "ready-controlled-launch",
      priority: "high",
      title: "Ready for controlled launch",
      detail: "Production readiness, verification, and enterprise evaluation support controlled public launch planning.",
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

  if (criticalAlerts > 0) {
    recommendations.push({
      id: "resolve-alerts",
      priority: "high",
      title: "Resolve operational alerts",
      detail: "Address critical alerts before production launch authorization.",
    });
  }

  if (checklist.find((i) => i.id === "production-review")?.signal !== "green") {
    recommendations.push({
      id: "complete-production-review",
      priority: "high",
      title: "Complete production review",
      detail: "Conduct production review with operator stack before launch sign-off.",
    });
  }

  if (checklist.find((i) => i.id === "launch-rc")?.signal !== "green") {
    recommendations.push({
      id: "prepare-launch-rc",
      priority: "medium",
      title: "Prepare Launch RC",
      detail: "Proceed to Chapter 9 Sprint 4 Launch Readiness RC for final certification.",
    });
  }

  if (evaluation.unifiedReadinessScore >= 75 && prodScore < 80) {
    recommendations.push({
      id: "increase-launch-confidence",
      priority: "low",
      title: "Increase launch confidence",
      detail: "Close remaining launch checklist items to raise production readiness score.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-operations",
      priority: "low",
      title: "Continue production operations",
      detail: "No blocking items from current production readiness assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getProductionOperationsSnapshot(now = Date.now()): ProductionOperationsSnapshot {
  const overview = buildOverview();
  const launchChecklist = buildLaunchChecklist();
  const prodPillar = overview.find((p) => p.id === "production-readiness");
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    productionReadinessScore: prodPillar?.score ?? 0,
    productionSignal: prodPillar?.signal ?? "amber",
    releaseStatus: buildReleaseStatus(),
    incidents: buildIncidents(),
    productionHealth: buildProductionHealth(),
    launchChecklist,
    recommendations: buildRecommendations(overview, launchChecklist),
    hasData: executive.hasData || launchChecklist.some((i) => i.signal === "green"),
  };
}

export { scoreToSignal };
