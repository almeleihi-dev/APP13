export type ApprovalCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface ApprovalCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: ApprovalCheckStatus;
  message: string;
  required: boolean;
}

export const APPROVAL_CHECK_IDS = [
  "need-experience",
  "action-experience",
  "contract-experience",
  "chat-experience",
  "timeline-experience",
  "notification-experience",
  "profile-experience",
  "runtime-journey",
  "runtime-state",
  "runtime-registry",
  "runtime-coordinator",
  "runtime-health",
  "runtime-demo",
  "runtime-preview",
  "runtime-launcher",
  "runtime-release",
  "runtime-operations",
  "runtime-executive",
  "runtime-readiness",
  "runtime-certification",
  "runtime-final-readiness",
] as const;

export type ApprovalCheckId = (typeof APPROVAL_CHECK_IDS)[number];
