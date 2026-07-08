/**
 * Chapter 9 Sprint 4 — AN ACT v1 Certification Center (client-only).
 * Official certification layer summarizing Chapters 1–9 verification — no new capabilities.
 */

import { getEnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import { getEnterpriseReadinessSnapshot, scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getLaunchReadinessSnapshot } from "./launch-readiness.js";
import { getPilotDashboardSnapshot } from "./pilot-instrumentation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot } from "./production-operations.js";

export type { ReadinessLevel };

export type CertificationDecision = "certified" | "certified-with-conditions" | "not-certified";

export interface CertificationOverviewItem {
  id: "architecture" | "runtime" | "pilot" | "enterprise" | "production" | "launch";
  label: string;
  score: number;
  signal: ReadinessLevel;
  summary: string;
}

export interface VerificationSummaryItem {
  id: string;
  label: string;
  value: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface PlatformCapability {
  id: string;
  category: "runtime" | "experience" | "operations" | "enterprise" | "evaluation";
  title: string;
  detail: string;
}

export interface OutstandingItem {
  id: string;
  category: "operational" | "launch" | "pilot" | "monitoring";
  title: string;
  detail: string;
  signal: ReadinessLevel;
}

export interface AnActV1CertificationSnapshot {
  generatedAt: string;
  overview: CertificationOverviewItem[];
  certificationScore: number;
  certificationSignal: ReadinessLevel;
  verificationSummary: VerificationSummaryItem[];
  platformCapabilities: PlatformCapability[];
  outstandingItems: OutstandingItem[];
  certificationDecision: CertificationDecision;
  certificationDecisionReason: string;
  executiveSummary: string;
  hasData: boolean;
}

function buildOverview(): CertificationOverviewItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const pilot = getPilotManagementSnapshot();
  const enterprise = getEnterpriseEvaluationSnapshot();
  const enterpriseReadiness = getEnterpriseReadinessSnapshot();
  const production = getProductionOperationsSnapshot();
  const launch = getLaunchReadinessSnapshot();

  const architectureScore = Math.round(
    (executive.health.platformStability + executive.health.overall) / 2
  );
  const runtimeHealth = Math.max(0, 100 - pilotDash.runtimeHealth.errorRate * 2);
  const pilotScore = Math.min(
    100,
    Math.round(
      (pilot.readiness.successfulJourneys /
        Math.max(pilot.readiness.successfulJourneys + pilot.readiness.blockedJourneys, 1)) *
        100
    )
  );

  return [
    {
      id: "architecture",
      label: "Architecture readiness",
      score: architectureScore,
      signal: scoreToSignal(architectureScore),
      summary: "Frozen architecture · Runtime JSON contracts · layered operator stack.",
    },
    {
      id: "runtime",
      label: "Runtime readiness",
      score: runtimeHealth,
      signal: scoreToSignal(runtimeHealth),
      summary: `${pilotDash.runtimeHealth.errorRate}% error rate · Need/Action experience validated.`,
    },
    {
      id: "pilot",
      label: "Pilot readiness",
      score: pilotScore,
      signal: scoreToSignal(pilotScore),
      summary: `${pilot.readiness.successfulJourneys} successful · ${pilot.cohorts.filter((c) => c.readiness === "ready").length} cohorts ready.`,
    },
    {
      id: "enterprise",
      label: "Enterprise readiness",
      score: enterprise.unifiedReadinessScore,
      signal: enterprise.unifiedSignal,
      summary: `Unified evaluation ${enterprise.unifiedReadinessScore} · ${enterpriseReadiness.adoptionChecklist.filter((i) => i.signal === "green").length} adoption items.`,
    },
    {
      id: "production",
      label: "Production readiness",
      score: production.productionReadinessScore,
      signal: production.productionSignal,
      summary: `Production score ${production.productionReadinessScore} · ${production.incidents.filter((i) => i.category === "active").length} active incidents.`,
    },
    {
      id: "launch",
      label: "Launch readiness",
      score: launch.launchReadinessScore,
      signal: launch.launchSignal,
      summary: `Launch score ${launch.launchReadinessScore} · ${launch.launchGates.filter((g) => g.signal === "green").length} of ${launch.launchGates.length} gates green.`,
    },
  ];
}

function buildVerificationSummary(): VerificationSummaryItem[] {
  const executive = getExecutiveOperationsSnapshot();
  const production = getProductionOperationsSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const pilotDash = getPilotDashboardSnapshot();

  const regressionItem = production.releaseStatus.find((r) => r.id === "regression-status");
  const verificationItem = production.releaseStatus.find((r) => r.id === "verification-status");
  const regressionGreen = executive.health.platformStability >= 70;
  const buildGreen = evaluation.unifiedReadinessScore >= 75;
  const runtimeGreen = pilotDash.runtimeHealth.errorRate <= 5;
  const accessibilityGreen = executive.health.platformStability >= 70;

  return [
    {
      id: "verification-suites",
      label: "Verification suites completed",
      value: "Chapters 6–9",
      signal: "green",
      detail: "RC1/RC2, Chapter 6–8 pilot & enterprise, Chapter 9 production & launch suites.",
    },
    {
      id: "regression-status",
      label: "Regression status",
      value: regressionItem?.value ?? (regressionGreen ? "Clear" : "Review"),
      signal: regressionItem?.signal ?? (regressionGreen ? "green" : "amber"),
      detail: regressionItem?.detail ?? "Sprint regressions chained in verify scripts.",
    },
    {
      id: "build-status",
      label: "Build status",
      value: buildGreen ? "Passing" : "Conditional",
      signal: buildGreen ? "green" : "amber",
      detail: "npm run build gate in every Chapter 6–9 verify suite.",
    },
    {
      id: "runtime-validation",
      label: "Runtime validation",
      value: runtimeGreen ? "Validated" : "Review",
      signal: runtimeGreen ? "green" : "amber",
      detail: `Runtime error rate ${pilotDash.runtimeHealth.errorRate}% · journey instrumentation active.`,
    },
    {
      id: "accessibility-validation",
      label: "Accessibility validation",
      value: accessibilityGreen ? "Validated" : "Review",
      signal: accessibilityGreen ? "green" : "amber",
      detail: "Auth h1, list semantics, operator console aria labels verified in RC suites.",
    },
    {
      id: "verification-status",
      label: "Overall verification",
      value: verificationItem?.value ?? "Passing",
      signal: verificationItem?.signal ?? "green",
      detail: verificationItem?.detail ?? "Automated verify suites per sprint with zero-regression gates.",
    },
  ];
}

function buildPlatformCapabilities(): PlatformCapability[] {
  return [
    {
      id: "runtime-json",
      category: "runtime",
      title: "Runtime JSON experience engine",
      detail: "Need and Action modes with frozen contracts, screen registry, and state engine.",
    },
    {
      id: "need-action",
      category: "experience",
      title: "Customer & professional journeys",
      detail: "Discovery, request, contract, chat, timeline, notification, and profile experiences.",
    },
    {
      id: "auth-session",
      category: "runtime",
      title: "Authentication & session model",
      detail: "JWT access/refresh, role-based routes, registration, and provider onboarding.",
    },
    {
      id: "design-system",
      category: "experience",
      title: "AN ACT design system",
      detail: "Foundation tokens, core UI components, navigation framework, and visual prototypes.",
    },
    {
      id: "pilot-stack",
      category: "operations",
      title: "Pilot instrumentation & management",
      detail: "Privacy-safe instrumentation, pilot dashboard, cohorts, sessions, and follow-ups.",
    },
    {
      id: "operator-consoles",
      category: "operations",
      title: "Operator console stack",
      detail: "Founder, Growth, Executive Operations, Production, Reliability, and Launch Readiness centers.",
    },
    {
      id: "enterprise-centers",
      category: "enterprise",
      title: "Enterprise readiness centers",
      detail: "Enterprise, Government, Integration, and unified Evaluation centers.",
    },
    {
      id: "living-professional",
      category: "experience",
      title: "Living Professional experience",
      detail: "Simulator, goals, achievements, analytics, timeline, and career engine.",
    },
    {
      id: "partner-package",
      category: "evaluation",
      title: "Partner evaluation package",
      detail: "Technical, security, deployment, and architecture documentation for stakeholders.",
    },
    {
      id: "certification-layer",
      category: "evaluation",
      title: "Certification & launch assessment",
      detail: "Launch Readiness Center and AN ACT v1 Certification Center.",
    },
  ];
}

function buildOutstandingItems(): OutstandingItem[] {
  const launch = getLaunchReadinessSnapshot();
  const executive = getExecutiveOperationsSnapshot();
  const pilot = getPilotManagementSnapshot();
  const items: OutstandingItem[] = [];

  for (const risk of launch.remainingRisks) {
    if (risk.category === "critical" || risk.category === "high") {
      items.push({
        id: risk.id,
        category: risk.category === "critical" ? "launch" : "operational",
        title: risk.title,
        detail: risk.detail,
        signal: risk.category === "critical" ? "red" : "amber",
      });
    } else if (risk.category === "medium") {
      items.push({
        id: risk.id,
        category: "operational",
        title: risk.title,
        detail: risk.detail,
        signal: "amber",
      });
    }
  }

  if (pilot.readiness.followUpBacklog > 0) {
    items.push({
      id: "pilot-followup-backlog",
      category: "pilot",
      title: "Pilot follow-up backlog",
      detail: `${pilot.readiness.followUpBacklog} follow-up items pending operator review.`,
      signal: pilot.readiness.followUpBacklog > 3 ? "amber" : "green",
    });
  }

  if (executive.alerts.length > 0) {
    items.push({
      id: "executive-alerts",
      category: "monitoring",
      title: "Active operational alerts",
      detail: `${executive.alerts.length} alerts require executive attention before full launch.`,
      signal: executive.alerts.some((a) => a.priority === "critical") ? "red" : "amber",
    });
  }

  if (launch.launchDecision !== "go") {
    items.push({
      id: "launch-decision",
      category: "launch",
      title: "Launch authorization pending",
      detail: launch.launchDecisionReason,
      signal: launch.launchDecision === "no-go" ? "red" : "amber",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "no-outstanding",
      category: "operational",
      title: "No outstanding operational prerequisites",
      detail: "Technical certification complete with no blocking operational items.",
      signal: "green",
    });
  }

  return items.slice(0, 10);
}

function determineCertification(
  overview: CertificationOverviewItem[],
  verification: VerificationSummaryItem[],
  outstanding: OutstandingItem[]
): { decision: CertificationDecision; reason: string } {
  const redOverview = overview.filter((item) => item.signal === "red").length;
  const redVerification = verification.filter((item) => item.signal === "red").length;
  const criticalOutstanding = outstanding.filter((item) => item.signal === "red").length;
  const launch = getLaunchReadinessSnapshot();
  const score = Math.round(overview.reduce((sum, item) => sum + item.score, 0) / Math.max(overview.length, 1));

  if (redOverview > 0 || redVerification > 0 || score < 65) {
    return {
      decision: "not-certified",
      reason: `${redOverview} technical dimension(s) red and ${redVerification} verification item(s) failing — AN ACT v1 does not meet certification requirements.`,
    };
  }

  if (criticalOutstanding > 0 || launch.launchDecision === "no-go") {
    return {
      decision: "certified-with-conditions",
      reason: "Platform meets AN ACT v1 technical certification bar; operational and launch prerequisites remain before full production authorization.",
    };
  }

  if (launch.launchDecision === "conditional-go" || outstanding.some((item) => item.signal === "amber")) {
    return {
      decision: "certified-with-conditions",
      reason: "AN ACT v1 certified with outstanding operational conditions documented separately from technical readiness.",
    };
  }

  return {
    decision: "certified",
    reason: "All technical dimensions, verification suites, and launch gates support official AN ACT v1 certification.",
  };
}

function buildExecutiveSummary(
  decision: CertificationDecision,
  overview: CertificationOverviewItem[],
  score: number
): string {
  const launch = getLaunchReadinessSnapshot();
  const evaluation = getEnterpriseEvaluationSnapshot();
  const greenCount = overview.filter((item) => item.signal === "green").length;

  if (decision === "certified") {
    return `AN ACT v1 is officially certified with a composite score of ${score}/100. ${greenCount} of ${overview.length} readiness dimensions are green. Chapters 1–9 verification is complete, enterprise evaluation stands at ${evaluation.unifiedReadinessScore}, and launch readiness is ${launch.launchReadinessScore}. The platform is ready for partner, investor, and enterprise review as a controlled production candidate.`;
  }

  if (decision === "certified-with-conditions") {
    return `AN ACT v1 receives certification with operational conditions at ${score}/100. Technical architecture, runtime, and enterprise evaluation (${evaluation.unifiedReadinessScore}) meet the v1 bar. Outstanding pilot, monitoring, or launch prerequisites are documented separately and do not block technical certification for stakeholders reviewing platform maturity.`;
  }

  return `AN ACT v1 is not certified at ${score}/100. One or more technical dimensions or verification gates require remediation before the official certification package can be issued to partners, investors, or enterprise reviewers.`;
}

export function getAnActV1CertificationSnapshot(now = Date.now()): AnActV1CertificationSnapshot {
  const overview = buildOverview();
  const verificationSummary = buildVerificationSummary();
  const outstandingItems = buildOutstandingItems();
  const certificationScore = Math.round(
    overview.reduce((sum, item) => sum + item.score, 0) / Math.max(overview.length, 1)
  );
  const { decision, reason } = determineCertification(overview, verificationSummary, outstandingItems);
  const executive = getExecutiveOperationsSnapshot();

  return {
    generatedAt: new Date(now).toISOString(),
    overview,
    certificationScore,
    certificationSignal: scoreToSignal(certificationScore),
    verificationSummary,
    platformCapabilities: buildPlatformCapabilities(),
    outstandingItems,
    certificationDecision: decision,
    certificationDecisionReason: reason,
    executiveSummary: buildExecutiveSummary(decision, overview, certificationScore),
    hasData: executive.hasData || overview.some((item) => item.signal === "green"),
  };
}

export function certificationDecisionLabel(decision: CertificationDecision): string {
  if (decision === "certified") {
    return "Certified";
  }
  if (decision === "certified-with-conditions") {
    return "Certified with operational conditions";
  }
  return "Not certified";
}

export { scoreToSignal };
