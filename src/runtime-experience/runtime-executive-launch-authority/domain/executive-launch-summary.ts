import type { ExecutiveLaunchOverview } from "./executive-launch-overview.js";
import type { ExecutiveLaunchDecision } from "./executive-launch-decision.js";
import type { ExecutiveLaunchCheck } from "./executive-launch-checks.js";

export interface ExecutiveLaunchSummary {
  overview: ExecutiveLaunchOverview;
  decision: ExecutiveLaunchDecision;
  passedCheckCount: number;
  totalCheckCount: number;
  readOnly: true;
  delegated: true;
  officialExecutiveLaunchApproval: boolean;
}

export function buildExecutiveLaunchSummary(input: {
  overview: ExecutiveLaunchOverview;
  decision: ExecutiveLaunchDecision;
  checks: ExecutiveLaunchCheck[];
}): ExecutiveLaunchSummary {
  return {
    overview: input.overview,
    decision: input.decision,
    passedCheckCount: input.checks.filter((c) => c.status === "passed").length,
    totalCheckCount: input.checks.length,
    readOnly: true,
    delegated: true,
    officialExecutiveLaunchApproval: input.decision.officialExecutiveLaunchApproval,
  };
}
