import type { LaunchReadinessOverview } from "./launch-readiness-overview.js";
import type { LaunchReadinessCheck } from "./launch-readiness-checks.js";

export type LaunchReadinessAuthorityDecision = "ready" | "conditional" | "pending" | "not-ready";

export interface LaunchReadinessDecision {
  decision: LaunchReadinessAuthorityDecision;
  ready: boolean;
  readinessPercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officiallyReadyForLaunch: boolean;
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
  readOnly: true;
  delegated: true;
}

export function buildLaunchReadinessDecision(input: {
  overview: LaunchReadinessOverview;
  checks: LaunchReadinessCheck[];
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
}): LaunchReadinessDecision {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const officiallyReadyForLaunch =
    input.overview.overallStatus === "ready" &&
    input.launchControlCleared &&
    input.productionApproved &&
    input.operationsCenterOperational &&
    passedCheckCount === input.checks.length;

  let decision: LaunchReadinessAuthorityDecision = "ready";
  if (input.overview.overallStatus === "not-ready") decision = "not-ready";
  else if (!officiallyReadyForLaunch) {
    decision = input.overview.overallStatus === "conditional" ? "conditional" : "pending";
  }

  return {
    decision,
    ready: officiallyReadyForLaunch,
    readinessPercentage: input.overview.readinessPercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officiallyReadyForLaunch,
    launchControlCleared: input.launchControlCleared,
    productionApproved: input.productionApproved,
    operationsCenterOperational: input.operationsCenterOperational,
    readOnly: true,
    delegated: true,
  };
}
