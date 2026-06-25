import { GOVERNANCE_STATUSES, MATURITY_LEVELS } from "./registry-schema.js";

export type GovernanceStatus = (typeof GOVERNANCE_STATUSES)[number];
export type MaturityLevel = (typeof MATURITY_LEVELS)[number];

const STATUS_TRANSITIONS: Record<GovernanceStatus, GovernanceStatus[]> = {
  draft: ["validated", "draft"],
  validated: ["draft", "published", "validated"],
  published: ["deprecated", "archived", "published"],
  deprecated: ["archived", "deprecated"],
  archived: ["archived"],
};

export function canTransitionGovernanceStatus(from: GovernanceStatus, to: GovernanceStatus): boolean {
  if (from === to) return true;
  return STATUS_TRANSITIONS[from].includes(to);
}

export function resolveMaturityLevel(input: {
  status: GovernanceStatus;
  qualityScore: number;
  certificationScore: number;
}): MaturityLevel {
  if (input.status === "deprecated" || input.status === "archived") {
    return "deprecated";
  }
  if (input.status === "draft") {
    return "draft";
  }
  if (input.qualityScore >= 85 && input.certificationScore >= 80) {
    return "mature";
  }
  if (input.qualityScore >= 70) {
    return "stable";
  }
  return "emerging";
}

export function applyGovernanceStatus(input: {
  current: GovernanceStatus;
  target: GovernanceStatus;
  valid: boolean;
}): GovernanceStatus {
  if (!input.valid) {
    return input.current === "draft" ? "draft" : input.current;
  }
  if (!canTransitionGovernanceStatus(input.current, input.target)) {
    throw new Error(`Cannot transition governance status from ${input.current} to ${input.target}`);
  }
  return input.target;
}
