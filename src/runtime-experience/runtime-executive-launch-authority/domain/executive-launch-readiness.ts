import type { ExecutiveLaunchOverview } from "./executive-launch-overview.js";
import type { ExecutiveLaunchCheck } from "./executive-launch-checks.js";

export type ExecutiveLaunchReadinessDecision = "authorized" | "conditional" | "pending" | "denied";

export interface ExecutiveLaunchReadiness {
  decision: ExecutiveLaunchReadinessDecision;
  authorized: boolean;
  authorizationPercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officiallyReadyForLaunch: boolean;
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
  readOnly: true;
  delegated: true;
}

export function buildExecutiveLaunchReadiness(input: {
  overview: ExecutiveLaunchOverview;
  checks: ExecutiveLaunchCheck[];
  officiallyReadyForLaunch: boolean;
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
}): ExecutiveLaunchReadiness {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const allChecksPassed = passedCheckCount === input.checks.length;
  const authorized =
    input.overview.overallStatus === "authorized" &&
    input.officiallyReadyForLaunch &&
    input.launchControlCleared &&
    input.productionApproved &&
    input.operationsCenterOperational &&
    allChecksPassed;

  let decision: ExecutiveLaunchReadinessDecision = "authorized";
  if (input.overview.overallStatus === "denied") decision = "denied";
  else if (!authorized) {
    decision = input.overview.overallStatus === "conditional" ? "conditional" : "pending";
  }

  return {
    decision,
    authorized,
    authorizationPercentage: input.overview.authorizationPercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officiallyReadyForLaunch: input.officiallyReadyForLaunch,
    launchControlCleared: input.launchControlCleared,
    productionApproved: input.productionApproved,
    operationsCenterOperational: input.operationsCenterOperational,
    readOnly: true,
    delegated: true,
  };
}
