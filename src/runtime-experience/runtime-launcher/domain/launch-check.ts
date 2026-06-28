export type LaunchCheckStatus = "passed" | "failed" | "warning" | "pending";

export type LaunchCheckCategory =
  | "experience"
  | "runtime"
  | "health"
  | "demo"
  | "preview"
  | "readiness";

export interface LaunchCheck {
  id: string;
  label: string;
  category: LaunchCheckCategory;
  delegateModule: string;
  status: LaunchCheckStatus;
  message: string;
  required: boolean;
}

export const LAUNCH_CHECK_IDS = [
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
] as const;

export type LaunchCheckId = (typeof LAUNCH_CHECK_IDS)[number];
