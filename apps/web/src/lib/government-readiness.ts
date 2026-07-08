/**
 * Chapter 8 Sprint 2 — Government Readiness Center (client-only).
 * Aggregates existing platform state for government evaluation — no new capabilities.
 */

import { getEnterpriseReadinessSnapshot, scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import { PILOT_INSTRUMENTATION_ENABLED } from "./pilot-instrumentation.js";

export type { ReadinessLevel };

export interface GovernmentOverviewPillar {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface CompliancePosture {
  area: string;
  status: ReadinessLevel;
  detail: string;
}

export interface DataHandlingTopic {
  id: string;
  title: string;
  detail: string;
}

export interface DeploymentOption {
  id: string;
  title: string;
  status: ReadinessLevel;
  detail: string;
}

export interface GovernmentChecklistItem {
  id: string;
  category: "governance" | "security" | "operations" | "privacy" | "documentation" | "pilot-readiness";
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface GovernmentRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface GovernmentReadinessSnapshot {
  generatedAt: string;
  overview: GovernmentOverviewPillar[];
  governmentReadinessScore: number;
  governmentSignal: ReadinessLevel;
  compliance: CompliancePosture[];
  dataHandling: DataHandlingTopic[];
  deployment: DeploymentOption[];
  evaluationChecklist: GovernmentChecklistItem[];
  recommendations: GovernmentRecommendation[];
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

function buildOverview(): GovernmentOverviewPillar[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  const enterpriseReadiness = enterprise.enterpriseReadinessScore;
  const operationalMaturity = executive.health.operationalHealth;
  const pilotMaturity = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys / Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) * 100
    )
  );
  const governanceSignals = enterprise.governance.map((item) => signalToScore(item.status));
  const governanceMaturity = Math.round(
    governanceSignals.reduce((sum, score) => sum + score, 0) / Math.max(governanceSignals.length, 1)
  );
  const governmentReadiness = Math.round(
    (enterpriseReadiness + operationalMaturity + pilotMaturity + governanceMaturity) / 4
  );

  const govCohort = pilot.cohorts.find((c) => c.id === "government-stakeholders");

  return [
    {
      id: "enterprise-readiness",
      label: "Enterprise readiness",
      score: enterpriseReadiness,
      signal: scoreToSignal(enterpriseReadiness),
      summary: "Chapter 8 Sprint 1 enterprise evaluation baseline.",
    },
    {
      id: "operational-maturity",
      label: "Operational maturity",
      score: operationalMaturity,
      signal: scoreToSignal(operationalMaturity),
      summary: `${executive.alerts.length} active alerts · operator consoles operational.`,
    },
    {
      id: "pilot-maturity",
      label: "Pilot maturity",
      score: pilotMaturity,
      signal: scoreToSignal(pilotMaturity),
      summary: `${pilot.readiness.successfulJourneys} successful pilot journeys · controlled cohort execution.`,
    },
    {
      id: "governance-maturity",
      label: "Governance maturity",
      score: governanceMaturity,
      signal: scoreToSignal(governanceMaturity),
      summary: "Roles, permissions, change control, and audit posture from enterprise governance view.",
    },
    {
      id: "government-readiness",
      label: "Government readiness",
      score: governmentReadiness,
      signal: scoreToSignal(governmentReadiness),
      summary: govCohort
        ? `Government stakeholder cohort: ${govCohort.readiness.replace("-", " ")}.`
        : "Composite public-sector evaluation posture.",
    },
  ];
}

function buildCompliance(): CompliancePosture[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  return [
    {
      area: "Identity & access",
      status: "green",
      detail: "JWT sessions with refresh rotation, role-based guards (customer, provider, platform_admin), and server logout.",
    },
    {
      area: "Auditability",
      status: pilot.readiness.followUpBacklog <= 5 ? "amber" : "red",
      detail: "Security audit service verified; pilot instrumentation exportable for session review. No country-specific audit certification claimed.",
    },
    {
      area: "Operational controls",
      status: executive.health.operationalHealth >= 70 ? "green" : "amber",
      detail: "Founder Console, Pilot Management, Executive Operations, and Enterprise Readiness define operator oversight.",
    },
    {
      area: "Change governance",
      status: "amber",
      detail: "Runtime JSON and API contracts frozen; changes require verified production issues only.",
    },
    {
      area: "Documentation",
      status: "green",
      detail: "Partner package, security summaries, deployment model, and Chapter 6–8 RC reports available.",
    },
    {
      area: "Security posture",
      status: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "Presentation-layer error recovery, session expiry handling, and server-authoritative validation.",
    },
  ];
}

function buildDataHandling(): DataHandlingTopic[] {
  return [
    {
      id: "runtime-json",
      title: "Runtime JSON governance",
      detail: "Server-authoritative experience contract — the shell renders, never decides. Single source of truth across surfaces.",
    },
    {
      id: "ownership",
      title: "Data ownership model",
      detail: "Platform holds operational session data; customer and professional content flows through authoritative runtime APIs.",
    },
    {
      id: "privacy",
      title: "Privacy approach",
      detail: "Pilot instrumentation collects anonymous journey milestones only — no PII, search text, or request content.",
    },
    {
      id: "instrumentation",
      title: "Anonymous pilot instrumentation",
      detail: PILOT_INSTRUMENTATION_ENABLED
        ? "Active in dev/instrumentation builds; privacy-safe event records with session-scoped identifiers."
        : "Available in controlled pilot builds; disabled in production customer paths by default.",
    },
    {
      id: "export",
      title: "Export capabilities",
      detail: "Pilot Management supports metric export after sessions; instrumentation events exportable for operator review.",
    },
  ];
}

function buildDeployment(): DeploymentOption[] {
  const executive = getExecutiveOperationsSnapshot();

  return [
    {
      id: "cloud",
      title: "Cloud deployment",
      status: "green",
      detail: "Node.js API + static web shell; container-ready architecture documented in partner package.",
    },
    {
      id: "regional",
      title: "Regional deployment readiness",
      status: "amber",
      detail: "Stateless API layer supports regional placement; data residency configuration is deployment-specific, not pre-implemented.",
    },
    {
      id: "private",
      title: "Private environment readiness",
      status: "amber",
      detail: "Self-hosted deployment model supported; private network isolation depends on customer infrastructure.",
    },
    {
      id: "separation",
      title: "Operational separation",
      status: executive.health.operationalHealth >= 60 ? "green" : "amber",
      detail: "Operator consoles separated from customer-facing runtime; instrumentation isolated to pilot builds.",
    },
  ];
}

function buildEvaluationChecklist(): GovernmentChecklistItem[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const govCohort = pilot.cohorts.find((c) => c.id === "government-stakeholders");

  return [
    {
      id: "gov-roles",
      category: "governance",
      label: "Role and permission transparency",
      signal: "green",
      detail: "Documented roles with route-level enforcement; no hidden privilege escalation paths.",
    },
    {
      id: "gov-change",
      category: "governance",
      label: "Change control visibility",
      signal: "amber",
      detail: "Frozen Runtime JSON/API policy documented; change process requires verified production issues.",
    },
    {
      id: "gov-ownership",
      category: "governance",
      label: "Operational ownership clarity",
      signal: pilot.readiness.followUpBacklog <= 5 ? "green" : "amber",
      detail: "Operator console stack defines accountability for pilot execution and follow-up.",
    },
    {
      id: "sec-auth",
      category: "security",
      label: "Authentication hardening",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "JWT refresh rotation, server logout, and session expiry messaging.",
    },
    {
      id: "sec-runtime",
      category: "security",
      label: "Server-authoritative runtime",
      signal: "green",
      detail: "Client shell cannot override business decisions; Runtime JSON is authoritative.",
    },
    {
      id: "sec-audit",
      category: "security",
      label: "Audit trail availability",
      signal: "amber",
      detail: "Security audit service and exportable instrumentation; formal compliance certification not claimed.",
    },
    {
      id: "ops-console",
      category: "operations",
      label: "Operator oversight stack",
      signal: "green",
      detail: "Founder, Pilot Management, Growth, Executive Operations, and Enterprise Readiness complete.",
    },
    {
      id: "ops-reporting",
      category: "operations",
      label: "Operational reporting",
      signal: pilot.sessions.some((s) => s.exportStatus === "exported") ? "green" : "amber",
      detail: "Session export and follow-up workflow via Pilot Management.",
    },
    {
      id: "priv-instrumentation",
      category: "privacy",
      label: "Privacy-safe instrumentation",
      signal: "green",
      detail: "No PII in pilot metrics; anonymous milestones and timing spans only.",
    },
    {
      id: "priv-data-flow",
      category: "privacy",
      label: "Data flow transparency",
      signal: "green",
      detail: "Runtime JSON governance and data ownership model documented in partner package.",
    },
    {
      id: "docs-partner",
      category: "documentation",
      label: "Technical and security documentation",
      signal: "green",
      detail: "Partner package covers architecture, deployment, and trust model.",
    },
    {
      id: "docs-rc",
      category: "documentation",
      label: "Readiness certification reports",
      signal: "green",
      detail: "Chapter 6–8 RC reports with verification suites and regression coverage.",
    },
    {
      id: "pilot-controlled",
      category: "pilot-readiness",
      label: "Controlled pilot execution",
      signal: pilot.readiness.successfulJourneys >= 1 ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful journeys validate controlled rollout model.`,
    },
    {
      id: "pilot-gov-cohort",
      category: "pilot-readiness",
      label: "Government stakeholder cohort",
      signal:
        govCohort?.readiness === "ready"
          ? "green"
          : govCohort?.readiness === "conditional"
            ? "amber"
            : "red",
      detail: govCohort
        ? `${govCohort.activeSessions} active sessions · ${govCohort.purpose}`
        : "Government stakeholder cohort not configured.",
    },
    {
      id: "pilot-growth",
      category: "pilot-readiness",
      label: "Public-sector activation planning",
      signal: growth.earlyAccess.pilotToGrowthReadiness >= 60 ? "green" : "amber",
      detail: `Early access readiness at ${growth.earlyAccess.pilotToGrowthReadiness}%.`,
    },
  ];
}

function buildRecommendations(
  overview: GovernmentOverviewPillar[],
  checklist: GovernmentChecklistItem[]
): GovernmentRecommendation[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const recommendations: GovernmentRecommendation[] = [];

  const govScore = overview.find((p) => p.id === "government-readiness")?.score ?? 0;
  const redItems = checklist.filter((item) => item.signal === "red").length;
  const govCohort = pilot.cohorts.find((c) => c.id === "government-stakeholders");

  if (govScore >= 70 && redItems === 0) {
    recommendations.push({
      id: "ready-for-evaluation",
      priority: "high",
      title: "Ready for government evaluation",
      detail: "Governance transparency and operational maturity support a structured public-sector review.",
    });
  }

  if (enterprise.enterpriseReadinessScore >= 75 && govCohort?.readiness !== "ready") {
    recommendations.push({
      id: "continue-enterprise-pilot",
      priority: "medium",
      title: "Continue enterprise pilot",
      detail: "Enterprise readiness is established; extend evaluation through controlled enterprise cohort sessions.",
    });
  }

  if (checklist.find((item) => item.id === "pilot-gov-cohort")?.signal !== "green") {
    recommendations.push({
      id: "schedule-gov-cohort",
      priority: "high",
      title: "Schedule government stakeholder cohort",
      detail: "Run compliance posture and trust architecture walkthrough with government evaluators.",
    });
  }

  const providerGap = enterprise.adoptionChecklist.find((item) => item.id === "user-provider");
  if (providerGap?.signal !== "green") {
    recommendations.push({
      id: "improve-provider-instrumentation",
      priority: "medium",
      title: "Improve provider instrumentation",
      detail: "Professional journey metrics remain a documented gap for full marketplace transparency.",
    });
  }

  if (!pilot.sessions.some((s) => s.exportStatus === "exported") || pilot.readiness.followUpBacklog > 3) {
    recommendations.push({
      id: "expand-operational-reporting",
      priority: "medium",
      title: "Expand operational reporting",
      detail: "Increase session exports and close follow-up backlog before formal procurement review.",
    });
  }

  if (govCohort?.readiness === "not-started" || govCohort?.activeSessions === 0) {
    recommendations.push({
      id: "prepare-integration-assessment",
      priority: "low",
      title: "Prepare integration assessment",
      detail: "Document deployment model alignment and integration touchpoints for government IT review.",
    });
  }

  if (executive.alerts.some((a) => a.priority === "critical")) {
    recommendations.push({
      id: "resolve-critical-alerts",
      priority: "high",
      title: "Resolve critical operational alerts",
      detail: "Address executive alerts before government procurement discussions.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-evaluation",
      priority: "low",
      title: "Continue government evaluation",
      detail: "No blocking items from current readiness assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getGovernmentReadinessSnapshot(now = Date.now()): GovernmentReadinessSnapshot {
  const overview = buildOverview();
  const evaluationChecklist = buildEvaluationChecklist();
  const govPillar = overview.find((p) => p.id === "government-readiness");
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    governmentReadinessScore: govPillar?.score ?? 0,
    governmentSignal: govPillar?.signal ?? "amber",
    compliance: buildCompliance(),
    dataHandling: buildDataHandling(),
    deployment: buildDeployment(),
    evaluationChecklist,
    recommendations: buildRecommendations(overview, evaluationChecklist),
    hasData: executive.hasData || evaluationChecklist.some((item) => item.signal === "green"),
  };
}

export { scoreToSignal };
