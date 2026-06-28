export type LaunchControlCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface LaunchControlCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: LaunchControlCheckStatus;
  message: string;
  required: boolean;
}

export const LAUNCH_CONTROL_CHECK_IDS = [
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
  "runtime-production-approval",
  "runtime-operations-center",
] as const;

export type LaunchControlCheckId = (typeof LAUNCH_CONTROL_CHECK_IDS)[number];
