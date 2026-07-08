/**
 * Chapter 8 Sprint 1 — Enterprise Readiness Center (client-only).
 * Aggregates existing platform state for enterprise evaluation — no new capabilities.
 */

import { getExecutiveOperationsSnapshot, type HealthSignal } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";

export type ReadinessLevel = "green" | "amber" | "red";

export interface EnterpriseOverviewPillar {
  id: string;
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface GovernanceCapability {
  area: string;
  status: ReadinessLevel;
  detail: string;
}

export interface AdoptionChecklistItem {
  id: string;
  category: "technical" | "operational" | "user" | "support" | "documentation";
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface OrganizationalRole {
  id: string;
  title: string;
  responsibilities: string[];
}

export interface EnterpriseRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface EnterpriseReadinessSnapshot {
  generatedAt: string;
  overview: EnterpriseOverviewPillar[];
  enterpriseReadinessScore: number;
  enterpriseSignal: ReadinessLevel;
  governance: GovernanceCapability[];
  adoptionChecklist: AdoptionChecklistItem[];
  organizationalRoles: OrganizationalRole[];
  recommendations: EnterpriseRecommendation[];
  hasData: boolean;
}

function scoreToSignal(score: number): ReadinessLevel {
  if (score >= 80) {
    return "green";
  }
  if (score >= 60) {
    return "amber";
  }
  return "red";
}

function signalLabel(signal: ReadinessLevel): string {
  if (signal === "green") {
    return "Ready";
  }
  if (signal === "amber") {
    return "Conditional";
  }
  return "Not ready";
}

function buildOverview(): EnterpriseOverviewPillar[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const founder = getFounderConsoleSnapshot();

  const platformMaturity = executive.health.overall;
  const operationalReadiness = executive.health.operationalHealth;
  const pilotStatus = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys / Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) * 100
    )
  );
  const growthReadiness = growth.earlyAccess.pilotToGrowthReadiness;

  const enterpriseReadiness = Math.round(
    (platformMaturity + operationalReadiness + pilotStatus + growthReadiness) / 4
  );

  return [
    {
      id: "platform-maturity",
      label: "Platform maturity",
      score: platformMaturity,
      signal: scoreToSignal(platformMaturity),
      summary: "MVP foundation, production readiness, and operator stack complete.",
    },
    {
      id: "operational-readiness",
      label: "Operational readiness",
      score: operationalReadiness,
      signal: scoreToSignal(operationalReadiness),
      summary: `${founder.dailyOverview.activeSessions} active sessions · ${executive.alerts.length} active alerts.`,
    },
    {
      id: "pilot-status",
      label: "Pilot status",
      score: pilotStatus,
      signal: scoreToSignal(pilotStatus),
      summary: `${pilot.readiness.successfulJourneys} successful · ${pilot.readiness.blockedJourneys} blocked journeys.`,
    },
    {
      id: "growth-readiness",
      label: "Growth readiness",
      score: growthReadiness,
      signal: scoreToSignal(growthReadiness),
      summary: `${growth.earlyAccess.pendingInvitations} pending invitations · ${growth.earlyAccess.waitlistInterest} waitlist entries.`,
    },
    {
      id: "enterprise-readiness",
      label: "Enterprise readiness",
      score: enterpriseReadiness,
      signal: scoreToSignal(enterpriseReadiness),
      summary: "Composite enterprise adoption posture from current platform state.",
    },
  ];
}

function buildGovernance(): GovernanceCapability[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  return [
    {
      area: "Roles",
      status: "green",
      detail: "Customer, provider, and platform_admin roles with JWT session binding.",
    },
    {
      area: "Permissions",
      status: "green",
      detail: "Route-level authRequired middleware and role-based guards on experience APIs.",
    },
    {
      area: "Operational ownership",
      status: pilot.readiness.followUpBacklog <= 3 ? "green" : "amber",
      detail: "Founder Console, Pilot Management, and Executive Operations Center define operator ownership.",
    },
    {
      area: "Decision flow",
      status: executive.decisions.length > 0 ? "green" : "amber",
      detail: "Rule-based executive decisions aggregate founder, pilot, and growth signals.",
    },
    {
      area: "Change control",
      status: "amber",
      detail: "Runtime JSON and API contracts frozen; changes require verified production issues.",
    },
    {
      area: "Audit readiness",
      status: "amber",
      detail: "Security audit service verified; client instrumentation is privacy-safe and exportable.",
    },
  ];
}

function buildAdoptionChecklist(): AdoptionChecklistItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();

  return [
    {
      id: "tech-runtime",
      category: "technical",
      label: "Runtime JSON contract stability",
      signal: "green",
      detail: "Contracts frozen; RC1/RC2 validated journey coverage.",
    },
    {
      id: "tech-auth",
      category: "technical",
      label: "Authentication and session hardening",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "JWT refresh rotation, server logout, session expiry handling.",
    },
    {
      id: "ops-console",
      category: "operational",
      label: "Operator console stack",
      signal: "green",
      detail: "Founder, Pilot Management, Growth, and Executive Operations complete.",
    },
    {
      id: "ops-pilot",
      category: "operational",
      label: "Controlled pilot execution",
      signal: pilot.readiness.successfulJourneys >= 1 ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful pilot journeys recorded.`,
    },
    {
      id: "user-customer",
      category: "user",
      label: "Customer journey readiness",
      signal: pilot.cohorts.find((c) => c.id === "first-customers")?.readiness === "ready" ? "green" : "amber",
      detail: "Need journey instrumented and validated in controlled pilot.",
    },
    {
      id: "user-provider",
      category: "user",
      label: "Professional onboarding clarity",
      signal: "amber",
      detail: "Provider path works with facilitator guidance; instrumentation gap documented.",
    },
    {
      id: "support-errors",
      category: "support",
      label: "Error recovery and offline resilience",
      signal: executive.health.platformStability >= 60 ? "green" : "amber",
      detail: "PresentationError, retry flows, and session expiry messaging in place.",
    },
    {
      id: "support-followup",
      category: "support",
      label: "Pilot follow-up workflow",
      signal: pilot.readiness.followUpBacklog <= 5 ? "green" : "amber",
      detail: `${pilot.readiness.followUpBacklog} open follow-up items.`,
    },
    {
      id: "docs-partner",
      category: "documentation",
      label: "Partner and security documentation",
      signal: "green",
      detail: "Technical, security, deployment, and architecture summaries available.",
    },
    {
      id: "docs-operator",
      category: "documentation",
      label: "Operator runbooks and RC reports",
      signal: "green",
      detail: "Chapter 6–7 verification reports and operator consoles documented.",
    },
    {
      id: "growth-activation",
      category: "operational",
      label: "Early access and activation planning",
      signal: growth.earlyAccess.pilotToGrowthReadiness >= 60 ? "green" : "amber",
      detail: `Pilot-to-growth readiness at ${growth.earlyAccess.pilotToGrowthReadiness}%.`,
    },
  ];
}

const ORGANIZATIONAL_ROLES: OrganizationalRole[] = [
  {
    id: "executive-sponsor",
    title: "Executive sponsor",
    responsibilities: [
      "Approve pilot scope and enterprise evaluation timeline",
      "Review Executive Operations Center health and alerts",
      "Authorize expansion from controlled pilot to early access",
    ],
  },
  {
    id: "platform-administrator",
    title: "Platform administrator",
    responsibilities: [
      "Manage authentication, sessions, and role assignments",
      "Monitor runtime health and error recovery patterns",
      "Coordinate with AN ACT operator on configuration changes",
    ],
  },
  {
    id: "pilot-manager",
    title: "Pilot manager",
    responsibilities: [
      "Run cohort sessions via Pilot Management",
      "Capture feedback and manage follow-up board",
      "Export instrumentation metrics after each session",
    ],
  },
  {
    id: "professional-users",
    title: "Professional users",
    responsibilities: [
      "Complete provider onboarding and passport setup",
      "Execute action workflow with facilitator support as needed",
      "Report friction through operator feedback capture",
    ],
  },
  {
    id: "customer-users",
    title: "Customer users",
    responsibilities: [
      "Complete Need journey from search through tracking",
      "Provide session feedback via pilot manager",
      "Use platform within controlled pilot guidelines",
    ],
  },
];

function buildRecommendations(
  overview: EnterpriseOverviewPillar[],
  checklist: AdoptionChecklistItem[]
): EnterpriseRecommendation[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const growth = getGrowthFoundationSnapshot();
  const recommendations: EnterpriseRecommendation[] = [];

  const enterpriseScore = overview.find((p) => p.id === "enterprise-readiness")?.score ?? 0;
  const redItems = checklist.filter((item) => item.signal === "red").length;
  const amberItems = checklist.filter((item) => item.signal === "amber").length;

  if (enterpriseScore >= 75 && redItems === 0) {
    recommendations.push({
      id: "ready-for-pilot",
      priority: "high",
      title: "Ready for enterprise pilot",
      detail: "Platform maturity and operational stack support controlled enterprise evaluation.",
    });
  }

  if (pilot.cohorts.find((c) => c.id === "first-customers")?.followUpNeeded || pilot.readiness.successfulJourneys < 3) {
    recommendations.push({
      id: "expand-customer-onboarding",
      priority: "medium",
      title: "Expand customer onboarding",
      detail: "Increase successful customer cohort sessions before broad enterprise rollout.",
    });
  }

  if (checklist.find((item) => item.id === "user-provider")?.signal !== "green") {
    recommendations.push({
      id: "complete-provider-instrumentation",
      priority: "medium",
      title: "Complete provider instrumentation",
      detail: "Professional journey metrics remain a documented blind spot for enterprise adoption.",
    });
  }

  const govCohort = pilot.cohorts.find((c) => c.id === "government-stakeholders");
  if (govCohort && (govCohort.readiness === "not-started" || govCohort.activeSessions === 0)) {
    recommendations.push({
      id: "prepare-government-eval",
      priority: "low",
      title: "Prepare government evaluation",
      detail: "Schedule government stakeholder cohort with compliance and trust architecture walkthrough.",
    });
  }

  if (growth.activation.enoughProfessionals !== "ready") {
    recommendations.push({
      id: "balance-supply",
      priority: "high",
      title: "Balance marketplace supply before enterprise scale",
      detail: growth.activation.supplyDemandImbalance,
    });
  }

  if (executive.alerts.some((a) => a.priority === "critical")) {
    recommendations.push({
      id: "resolve-critical-alerts",
      priority: "high",
      title: "Resolve critical operational alerts",
      detail: "Address executive alerts before enterprise contract discussions.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-evaluation",
      priority: "low",
      title: "Continue enterprise evaluation",
      detail: "No blocking items from current readiness assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getEnterpriseReadinessSnapshot(now = Date.now()): EnterpriseReadinessSnapshot {
  const overview = buildOverview();
  const adoptionChecklist = buildAdoptionChecklist();
  const enterprisePillar = overview.find((p) => p.id === "enterprise-readiness");
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    enterpriseReadinessScore: enterprisePillar?.score ?? 0,
    enterpriseSignal: enterprisePillar?.signal ?? "amber",
    governance: buildGovernance(),
    adoptionChecklist,
    organizationalRoles: ORGANIZATIONAL_ROLES,
    recommendations: buildRecommendations(overview, adoptionChecklist),
    hasData: executive.hasData || adoptionChecklist.some((item) => item.signal === "green"),
  };
}

export { signalLabel, scoreToSignal };
