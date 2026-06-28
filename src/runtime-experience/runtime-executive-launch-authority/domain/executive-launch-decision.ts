import type { ExecutiveLaunchOverview } from "./executive-launch-overview.js";
import type { ExecutiveLaunchCheck } from "./executive-launch-checks.js";
import type { ExecutiveLaunchReadiness } from "./executive-launch-readiness.js";

export type ExecutiveLaunchAuthorityDecision = "authorized" | "conditional" | "pending" | "denied";

export interface ExecutiveLaunchDecision {
  decision: ExecutiveLaunchAuthorityDecision;
  authorized: boolean;
  authorizationPercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officialExecutiveLaunchApproval: boolean;
  launchReadinessReady: boolean;
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
  readOnly: true;
  delegated: true;
}

export function buildExecutiveLaunchDecision(input: {
  overview: ExecutiveLaunchOverview;
  checks: ExecutiveLaunchCheck[];
  readiness: ExecutiveLaunchReadiness;
  launchReadinessReady: boolean;
  launchControlCleared: boolean;
  productionApproved: boolean;
  operationsCenterOperational: boolean;
}): ExecutiveLaunchDecision {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const officialExecutiveLaunchApproval =
    input.overview.overallStatus === "authorized" &&
    input.launchReadinessReady &&
    input.launchControlCleared &&
    input.productionApproved &&
    input.operationsCenterOperational &&
    input.readiness.authorized &&
    passedCheckCount === input.checks.length;

  let decision: ExecutiveLaunchAuthorityDecision = "authorized";
  if (input.overview.overallStatus === "denied") decision = "denied";
  else if (!officialExecutiveLaunchApproval) {
    decision = input.overview.overallStatus === "conditional" ? "conditional" : "pending";
  }

  return {
    decision,
    authorized: officialExecutiveLaunchApproval,
    authorizationPercentage: input.overview.authorizationPercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officialExecutiveLaunchApproval,
    launchReadinessReady: input.launchReadinessReady,
    launchControlCleared: input.launchControlCleared,
    productionApproved: input.productionApproved,
    operationsCenterOperational: input.operationsCenterOperational,
    readOnly: true,
    delegated: true,
  };
}
