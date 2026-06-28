export type ReleaseCheckStatus = "passed" | "failed" | "warning" | "pending";

export interface ReleaseCheckItem {
  id: string;
  label: string;
  delegateModule: string;
  status: ReleaseCheckStatus;
  message: string;
  required: boolean;
}

export interface ReleaseReport {
  generatedAt: string;
  readiness: import("./release-readiness.js").ReleaseReadiness;
  checks: ReleaseCheckItem[];
  blockers: string[];
  warnings: string[];
  recommendations: string[];
  knownLimitations: string[];
  candidateDecision: import("./release-candidate.js").ReleaseCandidateDecision;
  readOnly: true;
  noReleaseExecution: true;
}

export const RELEASE_CHECK_IDS = [
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
] as const;

export type ReleaseCheckId = (typeof RELEASE_CHECK_IDS)[number];

export const KNOWN_RELEASE_LIMITATIONS = [
  "Read-only certification layer — no deployment execution",
  "No Bubble implementation in this certification scope",
  "Runtime mutations require separate MVP implementation phase",
  "Release candidate certification does not execute launch or deploy",
] as const;
