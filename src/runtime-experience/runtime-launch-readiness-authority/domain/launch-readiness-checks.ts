export type LaunchReadinessCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface LaunchReadinessCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: LaunchReadinessCheckStatus;
  message: string;
  required: boolean;
}

export const LAUNCH_READINESS_CHECK_IDS = [
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
] as const;

export type LaunchReadinessCheckId = (typeof LAUNCH_READINESS_CHECK_IDS)[number];
