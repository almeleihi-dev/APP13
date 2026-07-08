import type { ApprovalOverview } from "./approval-overview.js";
import type { ApprovalDecision } from "./approval-decision.js";
import type { ApprovalCheck } from "./approval-checks.js";

export interface ApprovalSummary {
  overview: ApprovalOverview;
  decision: ApprovalDecision;
  passedCheckCount: number;
  totalCheckCount: number;
  officiallyApprovedForProduction: boolean;
  readOnly: true;
  delegated: true;
}

export function buildApprovalSummary(input: {
  overview: ApprovalOverview;
  decision: ApprovalDecision;
  checks: ApprovalCheck[];
}): ApprovalSummary {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  return {
    overview: input.overview,
    decision: input.decision,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    officiallyApprovedForProduction: input.decision.officiallyApprovedForProduction,
    readOnly: true,
    delegated: true,
  };
}
