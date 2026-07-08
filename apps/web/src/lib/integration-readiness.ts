/**
 * Chapter 8 Sprint 3 — Integration Readiness Center (client-only).
 * Aggregates existing platform state for IT evaluation — no new capabilities or connectors.
 */

import { getEnterpriseReadinessSnapshot, scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getGovernmentReadinessSnapshot } from "./government-readiness.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";

export type { ReadinessLevel };

export interface IntegrationOverviewTopic {
  id: string;
  title: string;
  detail: string;
}

export interface IntegrationTouchpoint {
  id: string;
  system: string;
  integrationType: string;
  status: ReadinessLevel;
  detail: string;
}

export interface EnvironmentStage {
  id: string;
  name: string;
  purpose: string;
  boundary: string;
  responsibility: string;
}

export interface CredentialAccessTopic {
  area: string;
  status: ReadinessLevel;
  detail: string;
}

export interface OnboardingStep {
  id: string;
  phase: string;
  title: string;
  detail: string;
}

export interface IntegrationChecklistItem {
  id: string;
  category: "api" | "authentication" | "documentation" | "deployment" | "operations" | "monitoring";
  label: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface IntegrationRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface IntegrationReadinessSnapshot {
  generatedAt: string;
  integrationReadinessScore: number;
  integrationSignal: ReadinessLevel;
  overview: IntegrationOverviewTopic[];
  touchpoints: IntegrationTouchpoint[];
  environments: EnvironmentStage[];
  credentialAccess: CredentialAccessTopic[];
  onboardingWorkflow: OnboardingStep[];
  evaluationChecklist: IntegrationChecklistItem[];
  recommendations: IntegrationRecommendation[];
  hasData: boolean;
}

function buildOverview(): IntegrationOverviewTopic[] {
  const executive = getExecutiveOperationsSnapshot();

  return [
    {
      id: "api-surface",
      title: "Current API surface",
      detail:
        "Fastify REST API with auth, identity, discovery, requests, contracts, actions, notifications, runtime experiences, and health endpoints. Experience APIs return Runtime JSON; shell consumes via Runtime Client transport only.",
    },
    {
      id: "runtime-architecture",
      title: "Runtime architecture",
      detail:
        "Modular monolith — Render Layer web shell, Runtime JSON experiences, experience services, PostgreSQL persistence. Business logic in backend services; client renders authoritative responses.",
    },
    {
      id: "authentication",
      title: "Authentication approach",
      detail:
        "JWT access tokens with refresh rotation, cookie-backed sessions, server logout, and role-based guards (customer, provider, platform_admin). authRequired middleware on protected routes.",
    },
    {
      id: "event-flow",
      title: "Event flow",
      detail:
        "Customer Need journey → discovery/search → request → contract → action completion. Runtime state transitions server-authoritative; pilot instrumentation captures anonymous milestones in controlled builds.",
    },
    {
      id: "deployment-model",
      title: "Deployment model",
      detail:
        "Platform kernel (Node.js/TypeScript) + Vite web shell; container-ready. npm build/verify gates per release candidate. PWA-ready with service worker caching.",
    },
  ];
}

function buildTouchpoints(): IntegrationTouchpoint[] {
  return [
    {
      id: "idp",
      system: "Identity providers",
      integrationType: "SSO / federation (conceptual)",
      status: "amber",
      detail: "Current JWT auth supports enterprise evaluation; external IdP federation is a deployment planning topic, not pre-implemented.",
    },
    {
      id: "hr",
      system: "HR systems",
      integrationType: "Workforce provisioning (conceptual)",
      status: "amber",
      detail: "Provider onboarding and role assignment could align with HR records; no HR connector implemented.",
    },
    {
      id: "erp",
      system: "ERP systems",
      integrationType: "Financial / contract sync (conceptual)",
      status: "amber",
      detail: "Contract and escrow experiences expose authoritative state; ERP integration would consume existing contract APIs at planning stage.",
    },
    {
      id: "crm",
      system: "CRM systems",
      integrationType: "Customer relationship (conceptual)",
      status: "amber",
      detail: "Customer dashboard and request lifecycle provide integration anchor points; CRM connectors not implemented.",
    },
    {
      id: "notifications",
      system: "Notification platforms",
      integrationType: "Alert delivery (conceptual)",
      status: "green",
      detail: "Platform notification experience APIs exist; external notification gateway integration is deployment-specific.",
    },
    {
      id: "storage",
      system: "File storage",
      integrationType: "Evidence / document (conceptual)",
      status: "amber",
      detail: "Evidence and contract document flows use platform storage; external object storage alignment is infrastructure planning.",
    },
    {
      id: "reporting",
      system: "Reporting tools",
      integrationType: "Operational analytics (conceptual)",
      status: "green",
      detail: "Pilot instrumentation export, analytics routes, and operator consoles support reporting handoff; BI connectors not implemented.",
    },
  ];
}

function buildEnvironments(): EnvironmentStage[] {
  return [
    {
      id: "development",
      name: "Development",
      purpose: "Engineering iteration with full operator instrumentation enabled.",
      boundary: "Local or shared dev cluster; no production data.",
      responsibility: "Engineering team — build, verify, and Runtime JSON contract validation.",
    },
    {
      id: "testing",
      name: "Testing",
      purpose: "Automated verification suites and integration smoke tests.",
      boundary: "Isolated test database; npm run verify gates.",
      responsibility: "Platform team — regression coverage across Chapters 6–8 RC suites.",
    },
    {
      id: "pilot",
      name: "Pilot",
      purpose: "Controlled cohort evaluation with instrumentation and operator oversight.",
      boundary: "Limited user base; Pilot Management cohorts and session export.",
      responsibility: "Pilot manager + platform administrator — session execution and metric export.",
    },
    {
      id: "production",
      name: "Production",
      purpose: "Live marketplace operation with frozen Runtime JSON and API contracts.",
      boundary: "Full customer and professional traffic; change control enforced.",
      responsibility: "Platform administrator + executive sponsor — health monitoring and change approval.",
    },
  ];
}

function buildCredentialAccess(): CredentialAccessTopic[] {
  const executive = getExecutiveOperationsSnapshot();

  return [
    {
      area: "Authentication",
      status: "green",
      detail: "JWT access/refresh tokens, secure cookie handling, session expiry, and server-side logout.",
    },
    {
      area: "Authorization",
      status: "green",
      detail: "Role-based access (customer, provider, platform_admin) enforced at route and experience API level.",
    },
    {
      area: "Operator access",
      status: "green",
      detail: "Operator consoles (Founder, Pilot Management, Executive Operations, Readiness Centers) separated from customer runtime.",
    },
    {
      area: "Role separation",
      status: "green",
      detail: "Customer, provider, and admin paths isolated; no privilege escalation in client shell.",
    },
    {
      area: "API governance",
      status: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "API contracts frozen; changes require verified production issues. Security audit service available.",
    },
  ];
}

const ONBOARDING_WORKFLOW: OnboardingStep[] = [
  {
    id: "evaluation",
    phase: "1",
    title: "Evaluation",
    detail: "Review Enterprise, Government, and Integration Readiness Centers; walk partner package documentation.",
  },
  {
    id: "pilot",
    phase: "2",
    title: "Pilot",
    detail: "Run controlled cohort via Pilot Management with session export and feedback capture.",
  },
  {
    id: "technical-review",
    phase: "3",
    title: "Technical review",
    detail: "IT team validates auth model, API surface, deployment boundaries, and conceptual touchpoint map.",
  },
  {
    id: "deployment-planning",
    phase: "4",
    title: "Deployment planning",
    detail: "Align environment model (dev/test/pilot/prod), infrastructure, and regional requirements.",
  },
  {
    id: "operational-handover",
    phase: "5",
    title: "Operational handover",
    detail: "Transfer platform administrator responsibilities, monitoring access, and operator console ownership.",
  },
];

function buildEvaluationChecklist(): IntegrationChecklistItem[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();

  return [
    {
      id: "api-runtime",
      category: "api",
      label: "Runtime experience API stability",
      signal: "green",
      detail: "Runtime JSON contracts frozen; experience APIs validated through RC suites.",
    },
    {
      id: "api-surface",
      category: "api",
      label: "Core API surface documented",
      signal: "green",
      detail: "Auth, discovery, requests, contracts, actions, notifications, and health endpoints in partner package.",
    },
    {
      id: "api-transport",
      category: "api",
      label: "Runtime Client transport separation",
      signal: "green",
      detail: "Web shell uses Runtime Client for transport only; no client-side business logic.",
    },
    {
      id: "auth-jwt",
      category: "authentication",
      label: "JWT session model",
      signal: executive.health.platformStability >= 70 ? "green" : "amber",
      detail: "Access/refresh rotation with server logout and session expiry handling.",
    },
    {
      id: "auth-roles",
      category: "authentication",
      label: "Role-based authorization",
      signal: "green",
      detail: "customer, provider, platform_admin roles with route-level enforcement.",
    },
    {
      id: "docs-partner",
      category: "documentation",
      label: "Partner technical documentation",
      signal: "green",
      detail: "Technical, security, deployment, and architecture summaries available.",
    },
    {
      id: "docs-readiness",
      category: "documentation",
      label: "Readiness certification reports",
      signal: "green",
      detail: "Chapter 6–8 RC reports with automated verification suites.",
    },
    {
      id: "deploy-model",
      category: "deployment",
      label: "Deployment model clarity",
      signal: government.deployment.find((d) => d.id === "cloud")?.status ?? "green",
      detail: "Container-ready Node.js API + Vite web shell documented.",
    },
    {
      id: "deploy-private",
      category: "deployment",
      label: "Private environment readiness",
      signal: "amber",
      detail: "Self-hosted deployment supported; customer infrastructure defines network isolation.",
    },
    {
      id: "ops-console",
      category: "operations",
      label: "Operator oversight stack",
      signal: "green",
      detail: "Founder, Pilot Management, Growth, Executive Operations, and Readiness Centers operational.",
    },
    {
      id: "ops-pilot",
      category: "operations",
      label: "Controlled pilot execution",
      signal: pilot.readiness.successfulJourneys >= 1 ? "green" : "amber",
      detail: `${pilot.readiness.successfulJourneys} successful pilot journeys recorded.`,
    },
    {
      id: "mon-instrumentation",
      category: "monitoring",
      label: "Pilot instrumentation and export",
      signal: pilot.sessions.some((s) => s.exportStatus === "exported") ? "green" : "amber",
      detail: "Anonymous milestone metrics with session export via Pilot Management.",
    },
    {
      id: "mon-health",
      category: "monitoring",
      label: "Executive health monitoring",
      signal: executive.health.overall >= 70 ? "green" : "amber",
      detail: `Platform health score ${executive.health.overall}; ${executive.alerts.length} active alerts.`,
    },
    {
      id: "mon-errors",
      category: "monitoring",
      label: "Error recovery visibility",
      signal: enterprise.adoptionChecklist.find((i) => i.id === "support-errors")?.signal ?? "amber",
      detail: "PresentationError, retry flows, and session expiry messaging in web shell.",
    },
  ];
}

function computeIntegrationScore(checklist: IntegrationChecklistItem[]): number {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();

  const checklistScore = Math.round(
    (checklist.filter((i) => i.signal === "green").length / Math.max(checklist.length, 1)) * 100
  );

  return Math.round(
    (enterprise.enterpriseReadinessScore + government.governmentReadinessScore + executive.health.overall + checklistScore) / 4
  );
}

function buildRecommendations(checklist: IntegrationChecklistItem[], score: number): IntegrationRecommendation[] {
  const enterprise = getEnterpriseReadinessSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const pilot = getPilotManagementSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const recommendations: IntegrationRecommendation[] = [];

  const redItems = checklist.filter((item) => item.signal === "red").length;

  if (score >= 75 && redItems === 0) {
    recommendations.push({
      id: "ready-for-evaluation",
      priority: "high",
      title: "Ready for technical evaluation",
      detail: "API surface, auth model, and deployment documentation support enterprise IT review.",
    });
  }

  if (checklist.filter((i) => i.category === "documentation").some((i) => i.signal !== "green")) {
    recommendations.push({
      id: "complete-integration-docs",
      priority: "medium",
      title: "Complete integration documentation",
      detail: "Ensure partner package and readiness reports are shared with IT stakeholders before review.",
    });
  }

  if (pilot.readiness.successfulJourneys < 3 || !pilot.sessions.some((s) => s.exportStatus === "exported")) {
    recommendations.push({
      id: "prepare-pilot-env",
      priority: "medium",
      title: "Prepare pilot environment",
      detail: "Run controlled pilot sessions with metric export before production deployment planning.",
    });
  }

  if (enterprise.enterpriseReadinessScore >= 70 && government.governmentReadinessScore >= 70) {
    recommendations.push({
      id: "continue-operational-validation",
      priority: "medium",
      title: "Continue operational validation",
      detail: "Enterprise and government readiness established; extend IT review through onboarding workflow phases.",
    });
  }

  if (checklist.find((i) => i.id === "deploy-private")?.signal !== "green") {
    recommendations.push({
      id: "plan-private-deployment",
      priority: "low",
      title: "Plan private deployment alignment",
      detail: "Document network, regional, and infrastructure requirements for customer-hosted environments.",
    });
  }

  if (executive.alerts.some((a) => a.priority === "critical")) {
    recommendations.push({
      id: "resolve-critical-alerts",
      priority: "high",
      title: "Resolve critical operational alerts",
      detail: "Address executive alerts before IT sign-off on production deployment.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "continue-integration-review",
      priority: "low",
      title: "Continue integration review",
      detail: "No blocking items from current integration readiness assessment.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

export function getIntegrationReadinessSnapshot(now = Date.now()): IntegrationReadinessSnapshot {
  const evaluationChecklist = buildEvaluationChecklist();
  const integrationReadinessScore = computeIntegrationScore(evaluationChecklist);
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    integrationReadinessScore,
    integrationSignal: scoreToSignal(integrationReadinessScore),
    overview: buildOverview(),
    touchpoints: buildTouchpoints(),
    environments: buildEnvironments(),
    credentialAccess: buildCredentialAccess(),
    onboardingWorkflow: ONBOARDING_WORKFLOW,
    evaluationChecklist,
    recommendations: buildRecommendations(evaluationChecklist, integrationReadinessScore),
    hasData: executive.hasData || evaluationChecklist.some((item) => item.signal === "green"),
  };
}

export { scoreToSignal };
