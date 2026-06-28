import type { LaunchControlOverview } from "./launch-control-overview.js";
import type { LaunchControlCheck } from "./launch-control-checks.js";

export type LaunchControlReadinessDecision = "cleared" | "conditional" | "pending" | "blocked";

export interface LaunchControlReadiness {
  decision: LaunchControlReadinessDecision;
  cleared: boolean;
  launchClearancePercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officiallyClearedForLaunch: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
  launcherReady: boolean;
  readOnly: true;
  delegated: true;
}

export function buildLaunchControlReadiness(input: {
  overview: LaunchControlOverview;
  checks: LaunchControlCheck[];
  productionApproved: boolean;
  operationsCenterOperational: boolean;
  launcherReady: boolean;
}): LaunchControlReadiness {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const officiallyClearedForLaunch =
    input.overview.overallStatus === "cleared" &&
    input.productionApproved &&
    input.operationsCenterOperational &&
    input.launcherReady &&
    passedCheckCount === input.checks.length;

  let decision: LaunchControlReadinessDecision = "cleared";
  if (input.overview.overallStatus === "blocked") decision = "blocked";
  else if (!officiallyClearedForLaunch) {
    decision = input.overview.overallStatus === "conditional" ? "conditional" : "pending";
  }

  return {
    decision,
    cleared: officiallyClearedForLaunch,
    launchClearancePercentage: input.overview.launchClearancePercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officiallyClearedForLaunch,
    productionApproved: input.productionApproved,
    operationsCenterOperational: input.operationsCenterOperational,
    launcherReady: input.launcherReady,
    readOnly: true,
    delegated: true,
  };
}
