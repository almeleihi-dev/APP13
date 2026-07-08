export type FinalReadinessCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface FinalReadinessCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: FinalReadinessCheckStatus;
  message: string;
  required: boolean;
}

export const FINAL_READINESS_CHECK_IDS = [
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
] as const;

export type FinalReadinessCheckId = (typeof FINAL_READINESS_CHECK_IDS)[number];
