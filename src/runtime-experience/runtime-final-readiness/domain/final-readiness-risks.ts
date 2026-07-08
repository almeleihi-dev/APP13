import type { FinalReadinessCheck } from "./final-readiness-checks.js";
import type { FinalReadinessOverview } from "./final-readiness-overview.js";

export type FinalReadinessRiskSeverity = "low" | "medium" | "high" | "critical";

export interface FinalReadinessRisk {
  id: string;
  title: string;
  description: string;
  severity: FinalReadinessRiskSeverity;
  delegateModule: string;
  mitigated: boolean;
}

export const FINAL_READINESS_RISK_DEFINITIONS = [
  {
    id: "experience-risk",
    title: "Experience Layer Risk",
    description: "User runtime experiences must pass final review validation.",
    checkIds: [
      "need-experience",
      "action-experience",
      "contract-experience",
      "chat-experience",
      "timeline-experience",
      "notification-experience",
      "profile-experience",
    ],
    delegateModule: "CH3-X5",
  },
  {
    id: "runtime-stack-risk",
    title: "Runtime Stack Risk",
    description: "Core runtime stack must be approved for production.",
    checkIds: ["runtime-journey", "runtime-state", "runtime-registry", "runtime-coordinator"],
    delegateModule: "CH3-X12",
  },
  {
    id: "certification-risk",
    title: "Certification Risk",
    description: "Release and certification layers must confirm production approval.",
    checkIds: [
      "runtime-health",
      "runtime-demo",
      "runtime-preview",
      "runtime-launcher",
      "runtime-release",
      "runtime-certification",
    ],
    delegateModule: "CH3-X24",
  },
  {
    id: "operations-risk",
    title: "Operations Risk",
    description: "Operations and executive layers must report on-track status.",
    checkIds: ["runtime-operations", "runtime-executive"],
    delegateModule: "CH3-X21",
  },
  {
    id: "readiness-risk",
    title: "Readiness Risk",
    description: "Readiness console must confirm handoff readiness.",
    checkIds: ["runtime-readiness"],
    delegateModule: "CH3-X23",
  },
] as const;

export function buildFinalReadinessRisks(
  checks: FinalReadinessCheck[],
  overview: FinalReadinessOverview
): FinalReadinessRisk[] {
  const checkMap = Object.fromEntries(checks.map((c) => [c.id, c.status === "passed"]));

  return FINAL_READINESS_RISK_DEFINITIONS.map((risk) => {
    const failedChecks = risk.checkIds.filter((id) => !checkMap[id]);
    const mitigated = failedChecks.length === 0;
    let severity: FinalReadinessRiskSeverity = "low";
    if (failedChecks.length === risk.checkIds.length) severity = "critical";
    else if (failedChecks.length > 1) severity = "high";
    else if (failedChecks.length === 1) severity = "medium";
    else if (overview.overallStatus !== "approved") severity = "medium";

    return {
      id: risk.id,
      title: risk.title,
      description: risk.description,
      severity,
      delegateModule: risk.delegateModule,
      mitigated,
    };
  });
}
