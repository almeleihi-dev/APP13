/**
 * Chapter 8 Sprint 4 — Enterprise Evaluation Center (client-only).
 * Aggregates Enterprise, Government, and Integration readiness — no new capabilities.
 */

import { getEnterpriseReadinessSnapshot, scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getGovernmentReadinessSnapshot } from "./government-readiness.js";
import { getIntegrationReadinessSnapshot } from "./integration-readiness.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";

export type { ReadinessLevel };

export interface ReadinessCenterSummary {
  id: "enterprise" | "government" | "integration";
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface UnifiedReadinessDimension {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  source: string;
}

export interface EvaluationSummarySection {
  id: string;
  title: string;
  items: string[];
}

export interface EnterpriseDecision {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface EnterpriseEvaluationSnapshot {
  generatedAt: string;
  centerSummaries: ReadinessCenterSummary[];
  unifiedDimensions: UnifiedReadinessDimension[];
  unifiedReadinessScore: number;
  unifiedSignal: ReadinessLevel;
  evaluationSummary: EvaluationSummarySection[];
  decisions: EnterpriseDecision[];
  pilotStatus: string;
  hasData: boolean;
}

function signalToScore(signal: ReadinessLevel): number {
  if (signal === "green") {
    return 90;
  }
  if (signal === "amber") {
    return 70;
  }
  return 40;
}

function buildCenterSummaries(): ReadinessCenterSummary[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const integration = getIntegrationReadinessSnapshot();

  return [
    {
      id: "enterprise",
      label: "Enterprise Readiness",
      score: enterprise.enterpriseReadinessScore,
      signal: enterprise.enterpriseSignal,
      summary: `${enterprise.adoptionChecklist.filter((i) => i.signal === "green").length} of ${enterprise.adoptionChecklist.length} adoption items ready.`,
    },
    {
      id: "government",
      label: "Government Readiness",
      score: government.governmentReadinessScore,
      signal: government.governmentSignal,
      summary: `${government.evaluationChecklist.filter((i) => i.signal === "green").length} of ${government.evaluationChecklist.length} evaluation items ready.`,
    },
    {
      id: "integration",
      label: "Integration Readiness",
      score: integration.integrationReadinessScore,
      signal: integration.integrationSignal,
      summary: `${integration.evaluationChecklist.filter((i) => i.signal === "green").length} of ${integration.evaluationChecklist.length} integration items ready.`,
    },
  ];
}

function buildUnifiedDimensions(): UnifiedReadinessDimension[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const integration = getIntegrationReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();

  const platformMaturity = executive.health.overall;
  const operationalReadiness = executive.health.operationalHealth;
  const governanceScores = enterprise.governance.map((g) => signalToScore(g.status));
  const governance = Math.round(
    governanceScores.reduce((sum, s) => sum + s, 0) / Math.max(governanceScores.length, 1)
  );
  const governmentReadiness = government.governmentReadinessScore;
  const integrationReadiness = integration.integrationReadinessScore;

  return [
    {
      id: "platform-maturity",
      label: "Platform maturity",
      score: platformMaturity,
      signal: scoreToSignal(platformMaturity),
      source: "Executive Operations health score",
    },
    {
      id: "operational-readiness",
      label: "Operational readiness",
      score: operationalReadiness,
      signal: scoreToSignal(operationalReadiness),
      source: "Executive Operations operational health",
    },
    {
      id: "governance",
      label: "Governance",
      score: governance,
      signal: scoreToSignal(governance),
      source: "Enterprise Readiness governance signals",
    },
    {
      id: "government-readiness",
      label: "Government readiness",
      score: governmentReadiness,
      signal: scoreToSignal(governmentReadiness),
      source: "Government Readiness Center",
    },
    {
      id: "integration-readiness",
      label: "Integration readiness",
      score: integrationReadiness,
      signal: scoreToSignal(integrationReadiness),
      source: "Integration Readiness Center",
    },
  ];
}

function collectChecklistLabels(
  items: Array<{ label: string; signal: ReadinessLevel }>,
  signal: ReadinessLevel
): string[] {
  return items.filter((item) => item.signal === signal).map((item) => item.label);
}

function buildEvaluationSummary(): EvaluationSummarySection[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const integration = getIntegrationReadinessSnapshot();
  const pilot = getPilotManagementSnapshot();

  const allChecklistItems = [
    ...enterprise.adoptionChecklist,
    ...government.evaluationChecklist,
    ...integration.evaluationChecklist,
  ];

  const strengths = collectChecklistLabels(allChecklistItems, "green").slice(0, 8);
  const conditional = collectChecklistLabels(allChecklistItems, "amber").slice(0, 6);
  const gaps = collectChecklistLabels(allChecklistItems, "red");

  const allRecommendations = [
    ...enterprise.recommendations,
    ...government.recommendations,
    ...integration.recommendations,
  ];
  const seen = new Set<string>();
  const nextSteps: string[] = [];
  for (const rec of allRecommendations) {
    if (!seen.has(rec.title)) {
      seen.add(rec.title);
      nextSteps.push(rec.title);
    }
    if (nextSteps.length >= 6) {
      break;
    }
  }

  return [
    {
      id: "strengths",
      title: "Strengths",
      items:
        strengths.length > 0
          ? strengths
          : ["Operator console stack complete", "Runtime JSON contracts frozen and validated"],
    },
    {
      id: "conditional",
      title: "Conditional items",
      items:
        conditional.length > 0
          ? conditional
          : ["No conditional items flagged from current readiness centers"],
    },
    {
      id: "gaps",
      title: "Remaining gaps",
      items: gaps.length > 0 ? gaps : ["No blocking gaps identified from current readiness centers"],
    },
    {
      id: "pilot",
      title: "Pilot status",
      items: [
        `${pilot.readiness.successfulJourneys} successful journeys · ${pilot.readiness.blockedJourneys} blocked`,
        `${pilot.readiness.followUpBacklog} open follow-up items`,
        `Next recommended cohort: ${pilot.readiness.nextRecommendedLabel}`,
      ],
    },
    {
      id: "next-steps",
      title: "Recommended next steps",
      items: nextSteps.length > 0 ? nextSteps : ["Continue enterprise evaluation across readiness centers"],
    },
  ];
}

function buildDecisions(unifiedScore: number, dimensions: UnifiedReadinessDimension[]): EnterpriseDecision[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const integration = getIntegrationReadinessSnapshot();
  const pilot = getPilotManagementSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const decisions: EnterpriseDecision[] = [];

  const enterpriseRed = enterprise.adoptionChecklist.filter((i) => i.signal === "red").length;
  const govRed = government.evaluationChecklist.filter((i) => i.signal === "red").length;

  if (enterprise.enterpriseReadinessScore >= 75 && enterpriseRed === 0) {
    decisions.push({
      id: "ready-enterprise-pilot",
      priority: "high",
      title: "Ready for enterprise pilot",
      detail: "Enterprise readiness and adoption checklist support controlled enterprise evaluation.",
    });
  }

  if (government.governmentReadinessScore >= 70 && govRed === 0) {
    decisions.push({
      id: "ready-government-eval",
      priority: "high",
      title: "Ready for government evaluation",
      detail: "Government readiness posture supports structured public-sector review.",
    });
  }

  if (pilot.readiness.successfulJourneys < 5 || pilot.readiness.followUpBacklog > 0) {
    decisions.push({
      id: "continue-pilot",
      priority: "medium",
      title: "Continue pilot",
      detail: "Extend controlled cohort sessions and close follow-up backlog before broad rollout.",
    });
  }

  if (integration.integrationReadinessScore < 80 || integration.evaluationChecklist.some((i) => i.signal === "amber")) {
    decisions.push({
      id: "prepare-integration-review",
      priority: "medium",
      title: "Prepare integration review",
      detail: "Schedule IT technical review using Integration Readiness Center and partner package.",
    });
  }

  const allGreen =
    unifiedScore >= 80 &&
    dimensions.every((d) => d.signal !== "red") &&
    enterpriseRed === 0 &&
    govRed === 0;

  if (allGreen && pilot.readiness.successfulJourneys >= 3) {
    decisions.push({
      id: "prepare-public-mvp",
      priority: "low",
      title: "Prepare public MVP",
      detail: "Unified readiness supports progression toward controlled public MVP launch planning.",
    });
  }

  if (executive.alerts.some((a) => a.priority === "critical")) {
    decisions.push({
      id: "resolve-alerts",
      priority: "high",
      title: "Resolve critical operational alerts",
      detail: "Address executive alerts before enterprise contract or procurement discussions.",
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      id: "continue-evaluation",
      priority: "low",
      title: "Continue enterprise evaluation",
      detail: "Review individual readiness centers for detailed assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return decisions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getEnterpriseEvaluationSnapshot(now = Date.now()): EnterpriseEvaluationSnapshot {
  const centerSummaries = buildCenterSummaries();
  const unifiedDimensions = buildUnifiedDimensions();
  const unifiedReadinessScore = Math.round(
    unifiedDimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(unifiedDimensions.length, 1)
  );
  const pilot = getPilotManagementSnapshot();
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    centerSummaries,
    unifiedDimensions,
    unifiedReadinessScore,
    unifiedSignal: scoreToSignal(unifiedReadinessScore),
    evaluationSummary: buildEvaluationSummary(),
    decisions: buildDecisions(unifiedReadinessScore, unifiedDimensions),
    pilotStatus: `${pilot.readiness.successfulJourneys} successful · ${pilot.readiness.blockedJourneys} blocked · ${executive.alerts.length} alerts`,
    hasData: executive.hasData || centerSummaries.some((c) => c.score > 0),
  };
}

export { scoreToSignal };
