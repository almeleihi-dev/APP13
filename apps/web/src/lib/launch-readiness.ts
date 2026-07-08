/**
 * Chapter 9 Sprint 3 — Launch Readiness Center (client-only).
 * Aggregates existing readiness state for formal launch assessment — no new capabilities.
 */

import { getEnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot, type ReadinessLevel } from "./production-operations.js";
import { getReliabilityRecoverySnapshot } from "./reliability-recovery.js";
import { scoreToSignal } from "./enterprise-readiness.js";

export type { ReadinessLevel };

export type LaunchDecision = "go" | "conditional-go" | "no-go";

export interface LaunchOverviewSummary {
  id: "production" | "reliability" | "evaluation" | "executive";
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface LaunchGate {
  id: string;
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface LaunchRiskSummary {
  id: string;
  category: "critical" | "high" | "medium" | "accepted";
  title: string;
  detail: string;
}

export interface LaunchChecklistItem {
  id: string;
  category: "product" | "operations" | "enterprise" | "reliability" | "documentation" | "evaluation";
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface LaunchRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface LaunchReadinessSnapshot {
  generatedAt: string;
  overview: LaunchOverviewSummary[];
  launchReadinessScore: number;
  launchSignal: ReadinessLevel;
  launchGates: LaunchGate[];
  remainingRisks: LaunchRiskSummary[];
  launchChecklist: LaunchChecklistItem[];
  launchDecision: LaunchDecision;
  launchDecisionReason: string;
  recommendations: LaunchRecommendation[];
  hasData: boolean;
}

function buildOverview(): LaunchOverviewSummary[] {
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const executive = getExecutiveOperationsSnapshot();

  return [
    {
      id: "production",
      label: "Production Operations",
      score: production.productionReadinessScore,
      signal: production.productionSignal,
      summary: `${production.launchChecklist.filter((i) => i.signal === "green").length} of ${production.launchChecklist.length} launch items ready.`,
    },
    {
      id: "reliability",
      label: "Reliability & Recovery",
      score: reliability.reliabilityScore,
      signal: reliability.reliabilitySignal,
      summary: `${reliability.riskRegister.filter((r) => r.severity === "critical").length} critical risks in register.`,
    },
    {
      id: "evaluation",
      label: "Enterprise Evaluation",
      score: evaluation.unifiedReadinessScore,
      signal: evaluation.unifiedSignal,
      summary: `Unified evaluation ${evaluation.unifiedReadinessScore} · ${evaluation.decisions.length} executive decisions.`,
    },
    {
      id: "executive",
      label: "Executive Operations",
      score: executive.health.overall,
      signal: scoreToSignal(executive.health.overall),
      summary: `${executive.alerts.length} active alerts · operational health ${executive.health.operationalHealth}.`,
    },
  ];
}

function buildLaunchGates(): LaunchGate[] {
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  const regressionItem = production.releaseStatus.find((r) => r.id === "regression-status");
  const verificationItem = production.releaseStatus.find((r) => r.id === "verification-status");

  return [
    {
      id: "platform-stability",
      label: "Platform stability",
      signal: scoreToSignal(executive.health.platformStability),
      detail: `Platform stability at ${executive.health.platformStability}%.`,
    },
    {
      id: "regression-status",
      label: "Regression status",
      signal: regressionItem?.signal ?? "amber",
      detail: regressionItem?.detail ?? "Chapter 6–9 verification suites with build gates.",
    },
    {
      id: "pilot-completion",
      label: "Pilot completion",
      signal: pilot.readiness.successfulJourneys >= 1 ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful · ${pilot.readiness.blockedJourneys} blocked journeys.`,
    },
    {
      id: "operational-readiness",
      label: "Operational readiness",
      signal: scoreToSignal(executive.health.operationalHealth),
      detail: `Operational health ${executive.health.operationalHealth}%.`,
    },
    {
      id: "enterprise-readiness",
      label: "Enterprise readiness",
      signal: evaluation.unifiedSignal,
      detail: `Unified evaluation score ${evaluation.unifiedReadinessScore}.`,
    },
    {
      id: "documentation",
      label: "Documentation",
      signal: "green",
      detail: "Partner package and Chapter 6–9 RC reports complete.",
    },
    {
      id: "reliability",
      label: "Reliability",
      signal: reliability.reliabilitySignal,
      detail: `Reliability score ${reliability.reliabilityScore}.`,
    },
    {
      id: "verification",
      label: "Verification status",
      signal: verificationItem?.signal ?? "amber",
      detail: verificationItem?.detail ?? "Automated verify suites per sprint.",
    },
  ];
}

function buildRemainingRisks(): LaunchRiskSummary[] {
  const reliability = getReliabilityRecoverySnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const risks: LaunchRiskSummary[] = [];

  for (const risk of reliability.riskRegister) {
    if (risk.severity === "critical") {
      risks.push({
        id: risk.id,
        category: "critical",
        title: risk.title,
        detail: risk.mitigation,
      });
    } else if (risk.severity === "high") {
      risks.push({
        id: risk.id,
        category: "high",
        title: risk.title,
        detail: risk.mitigation,
      });
    } else if (risk.severity === "medium") {
      risks.push({
        id: risk.id,
        category: "medium",
        title: risk.title,
        detail: risk.mitigation,
      });
    } else if (risk.severity === "low" && risk.signal === "green") {
      risks.push({
        id: risk.id,
        category: "accepted",
        title: risk.title,
        detail: risk.mitigation,
      });
    }
  }

  if (executive.alerts.some((a) => a.priority === "critical") && !risks.some((r) => r.category === "critical")) {
    for (const alert of executive.alerts.filter((a) => a.priority === "critical")) {
      risks.push({
        id: `critical-${alert.id}`,
        category: "critical",
        title: alert.title,
        detail: alert.detail,
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      id: "no-blockers",
      category: "accepted",
      title: "No blocking launch risks",
      detail: "Current operational aggregation shows no critical or high launch blockers.",
    });
  }

  const categoryOrder = { critical: 0, high: 1, medium: 2, accepted: 3 };
  return risks.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]).slice(0, 12);
}

function buildLaunchChecklist(): LaunchChecklistItem[] {
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const pilot = getPilotManagementSnapshot();

  return [
    {
      id: "product-mvp",
      category: "product",
      label: "MVP foundation stable",
      signal: production.overview.find((p) => p.id === "platform-health")?.signal ?? "amber",
      detail: "Runtime JSON contracts frozen; customer journey validated in pilot.",
    },
    {
      id: "product-pilot",
      category: "product",
      label: "Pilot journeys complete",
      signal: pilot.readiness.successfulJourneys >= 1 ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful pilot journeys.`,
    },
    {
      id: "ops-production",
      category: "operations",
      label: "Production operations ready",
      signal: production.productionSignal,
      detail: `Production readiness ${production.productionReadinessScore}.`,
    },
    {
      id: "ops-monitoring",
      category: "operations",
      label: "Operational monitoring active",
      signal: production.productionHealth.find((h) => h.id === "operational-alerts")?.signal ?? "amber",
      detail: "Executive Operations and Production Operations provide visibility.",
    },
    {
      id: "enterprise-eval",
      category: "enterprise",
      label: "Enterprise evaluation complete",
      signal: evaluation.unifiedSignal,
      detail: `Unified score ${evaluation.unifiedReadinessScore} across readiness centers.`,
    },
    {
      id: "enterprise-gov",
      category: "enterprise",
      label: "Government evaluation posture",
      signal: evaluation.centerSummaries.find((c) => c.id === "government")?.signal ?? "amber",
      detail: "Government Readiness Center assessment available.",
    },
    {
      id: "reliability-score",
      category: "reliability",
      label: "Reliability threshold met",
      signal: reliability.reliabilitySignal,
      detail: `Reliability score ${reliability.reliabilityScore}.`,
    },
    {
      id: "reliability-recovery",
      category: "reliability",
      label: "Recovery paths verified",
      signal: reliability.recoveryReadiness.every((r) => r.signal === "green") ? "green" : "amber",
      detail: "Runtime, session, retry, and offline recovery documented.",
    },
    {
      id: "docs-partner",
      category: "documentation",
      label: "Partner documentation complete",
      signal: "green",
      detail: "Technical, security, deployment, and architecture summaries.",
    },
    {
      id: "docs-rc",
      category: "documentation",
      label: "RC certification reports",
      signal: "green",
      detail: "Chapter 6–9 verification reports with automated suites.",
    },
    {
      id: "eval-decision",
      category: "evaluation",
      label: "Executive decisions documented",
      signal: evaluation.decisions.length > 0 ? "green" : "amber",
      detail: `${evaluation.decisions.length} rule-based executive decisions.`,
    },
    {
      id: "eval-launch-gates",
      category: "evaluation",
      label: "Launch gates assessed",
      signal: "green",
      detail: "All launch gates evaluated in Launch Readiness Center.",
    },
  ];
}

function determineLaunchDecision(gates: LaunchGate[], risks: LaunchRiskSummary[]): {
  decision: LaunchDecision;
  reason: string;
} {
  const redGates = gates.filter((g) => g.signal === "red").length;
  const amberGates = gates.filter((g) => g.signal === "amber").length;
  const criticalBlockers = risks.filter((r) => r.category === "critical").length;
  const highRisks = risks.filter((r) => r.category === "high").length;

  if (redGates > 0 || criticalBlockers > 0) {
    return {
      decision: "no-go",
      reason: `${redGates} red gate(s) and ${criticalBlockers} critical blocker(s) prevent launch authorization.`,
    };
  }

  if (amberGates <= 3 && highRisks <= 1) {
    return {
      decision: "go",
      reason: "All launch gates green or within acceptable amber threshold; no critical blockers.",
    };
  }

  return {
    decision: "conditional-go",
    reason: `${amberGates} amber gate(s) and ${highRisks} high risk(s) require resolution before full launch authorization.`,
  };
}

function buildRecommendations(
  decision: LaunchDecision,
  gates: LaunchGate[],
  risks: LaunchRiskSummary[]
): LaunchRecommendation[] {
  const production = getProductionOperationsSnapshot();
  const reliability = getReliabilityRecoverySnapshot();
  const pilot = getPilotManagementSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const recommendations: LaunchRecommendation[] = [];

  if (decision === "go") {
    recommendations.push({
      id: "proceed-controlled-launch",
      priority: "high",
      title: "Proceed with controlled launch",
      detail: "Launch gates and readiness assessment support controlled production launch planning.",
    });
  }

  if (decision === "conditional-go") {
    recommendations.push({
      id: "resolve-amber-gates",
      priority: "high",
      title: "Resolve remaining operational risks",
      detail: "Address amber launch gates and high risks before full launch authorization.",
    });
  }

  if (decision === "no-go") {
    recommendations.push({
      id: "no-go-remediation",
      priority: "high",
      title: "Remediate launch blockers",
      detail: "Resolve red gates and critical blockers before re-assessing launch readiness.",
    });
  }

  if (pilot.readiness.successfulJourneys < 3) {
    recommendations.push({
      id: "extend-pilot",
      priority: "medium",
      title: "Extend pilot",
      detail: "Increase successful pilot cohort sessions before production launch.",
    });
  }

  if (executive.alerts.length > 0) {
    recommendations.push({
      id: "resolve-alerts",
      priority: decision === "go" ? "medium" : "high",
      title: "Resolve remaining operational alerts",
      detail: `${executive.alerts.length} active alerts require attention.`,
    });
  }

  if (production.productionReadinessScore >= 80 && reliability.reliabilityScore >= 80) {
    recommendations.push({
      id: "prepare-certification",
      priority: "low",
      title: "Prepare certification",
      detail: "Production and reliability scores support Chapter 9 Sprint 4 launch certification.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-assessment",
      priority: "low",
      title: "Continue launch assessment",
      detail: "Review individual readiness centers for detailed launch preparation.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

function computeLaunchScore(overview: LaunchOverviewSummary[]): number {
  return Math.round(overview.reduce((sum, item) => sum + item.score, 0) / Math.max(overview.length, 1));
}

export function getLaunchReadinessSnapshot(now = Date.now()): LaunchReadinessSnapshot {
  const overview = buildOverview();
  const launchGates = buildLaunchGates();
  const remainingRisks = buildRemainingRisks();
  const launchChecklist = buildLaunchChecklist();
  const { decision, reason } = determineLaunchDecision(launchGates, remainingRisks);
  const launchReadinessScore = computeLaunchScore(overview);
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    launchReadinessScore,
    launchSignal: scoreToSignal(launchReadinessScore),
    launchGates,
    remainingRisks,
    launchChecklist,
    launchDecision: decision,
    launchDecisionReason: reason,
    recommendations: buildRecommendations(decision, launchGates, remainingRisks),
    hasData: executive.hasData || launchChecklist.some((i) => i.signal === "green"),
  };
}

export function launchDecisionLabel(decision: LaunchDecision): string {
  if (decision === "go") {
    return "GO";
  }
  if (decision === "conditional-go") {
    return "CONDITIONAL GO";
  }
  return "NO GO";
}

export { scoreToSignal };
