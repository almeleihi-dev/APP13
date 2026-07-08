import type { ApprovalOverview } from "./approval-overview.js";
import type { ApprovalCheck } from "./approval-checks.js";

export type ProductionApprovalDecision = "approved" | "conditional" | "pending" | "denied";

export interface ApprovalDecision {
  decision: ProductionApprovalDecision;
  approved: boolean;
  approvalPercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officiallyApprovedForProduction: boolean;
  finalReadinessComplete: boolean;
  certificationApproved: boolean;
  readOnly: true;
  delegated: true;
}

export function buildApprovalDecision(input: {
  overview: ApprovalOverview;
  checks: ApprovalCheck[];
  finalReadinessComplete: boolean;
  certificationApproved: boolean;
}): ApprovalDecision {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const officiallyApprovedForProduction =
    input.overview.overallStatus === "approved" &&
    input.finalReadinessComplete &&
    input.certificationApproved &&
    passedCheckCount === input.checks.length;

  let decision: ProductionApprovalDecision = "approved";
  if (input.overview.overallStatus === "denied") decision = "denied";
  else if (!officiallyApprovedForProduction) decision = input.overview.overallStatus === "conditional" ? "conditional" : "pending";

  return {
    decision,
    approved: officiallyApprovedForProduction,
    approvalPercentage: input.overview.approvalPercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officiallyApprovedForProduction,
    finalReadinessComplete: input.finalReadinessComplete,
    certificationApproved: input.certificationApproved,
    readOnly: true,
    delegated: true,
  };
}
