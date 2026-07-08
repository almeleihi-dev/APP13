export type RuntimeCompletionCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface RuntimeCompletionCheck {
  id: string;
  label: string;
  chapterCode: string;
  status: RuntimeCompletionCheckStatus;
  message: string;
  required: boolean;
}

export const CH3_RUNTIME_CHECK_IDS = [
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
  "runtime-executive-launch-authority",
] as const;

export type Ch3RuntimeCheckId = (typeof CH3_RUNTIME_CHECK_IDS)[number];
