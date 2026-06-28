export type ExecutiveLaunchCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface ExecutiveLaunchCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: ExecutiveLaunchCheckStatus;
  message: string;
  required: boolean;
}

export const EXECUTIVE_LAUNCH_CHECK_IDS = [
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
  "runtime-launch-control",
  "runtime-launch-readiness-authority",
] as const;

export type ExecutiveLaunchCheckId = (typeof EXECUTIVE_LAUNCH_CHECK_IDS)[number];
