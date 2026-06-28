export type CertificationCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface CertificationCheck {
  id: string;
  label: string;
  delegateModule: string;
  status: CertificationCheckStatus;
  message: string;
  required: boolean;
}

export const CERTIFICATION_CHECK_IDS = [
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
] as const;

export type CertificationCheckId = (typeof CERTIFICATION_CHECK_IDS)[number];
