import type { LaunchReadinessOverview } from "./launch-readiness-overview.js";
import type { LaunchReadinessDecision } from "./launch-readiness-decision.js";
import type { LaunchReadinessCheck } from "./launch-readiness-checks.js";

export interface LaunchReadinessSummary {
  overview: LaunchReadinessOverview;
  decision: LaunchReadinessDecision;
  passedCheckCount: number;
  totalCheckCount: number;
  readOnly: true;
  delegated: true;
  officiallyReadyForLaunch: boolean;
}

export function buildLaunchReadinessSummary(input: {
  overview: LaunchReadinessOverview;
  decision: LaunchReadinessDecision;
  checks: LaunchReadinessCheck[];
}): LaunchReadinessSummary {
  return {
    overview: input.overview,
    decision: input.decision,
    passedCheckCount: input.checks.filter((c) => c.status === "passed").length,
    totalCheckCount: input.checks.length,
    readOnly: true,
    delegated: true,
    officiallyReadyForLaunch: input.decision.officiallyReadyForLaunch,
  };
}
