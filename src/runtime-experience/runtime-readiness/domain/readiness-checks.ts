export type ReadinessCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface ReadinessCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: ReadinessCheckStatus;
  message: string;
  required: boolean;
}

export const READINESS_CHECK_IDS = [
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
] as const;

export type ReadinessCheckId = (typeof READINESS_CHECK_IDS)[number];
