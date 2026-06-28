import type { LaunchControlOverview } from "./launch-control-overview.js";
import type { LaunchControlReadiness } from "./launch-control-readiness.js";
import type { LaunchControlCheck } from "./launch-control-checks.js";

export interface LaunchControlSummary {
  overview: LaunchControlOverview;
  readiness: LaunchControlReadiness;
  passedCheckCount: number;
  totalCheckCount: number;
  readOnly: true;
  delegated: true;
  officiallyClearedForLaunch: boolean;
}

export function buildLaunchControlSummary(input: {
  overview: LaunchControlOverview;
  readiness: LaunchControlReadiness;
  checks: LaunchControlCheck[];
}): LaunchControlSummary {
  return {
    overview: input.overview,
    readiness: input.readiness,
    passedCheckCount: input.checks.filter((c) => c.status === "passed").length,
    totalCheckCount: input.checks.length,
    readOnly: true,
    delegated: true,
    officiallyClearedForLaunch: input.readiness.officiallyClearedForLaunch,
  };
}
