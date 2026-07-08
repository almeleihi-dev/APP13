import type { ReleaseCandidate } from "./release-candidate.js";
import type { ReleaseReadiness } from "./release-readiness.js";

export interface ReleaseSummary {
  candidate: ReleaseCandidate;
  readiness: ReleaseReadiness;
  recommendations: string[];
  knownLimitations: readonly string[];
  certificationComplete: boolean;
  readOnly: true;
  delegated: true;
}

export function buildReleaseSummary(input: {
  candidate: ReleaseCandidate;
  readiness: ReleaseReadiness;
  recommendations: string[];
  knownLimitations: readonly string[];
}): ReleaseSummary {
  return {
    candidate: input.candidate,
    readiness: input.readiness,
    recommendations: input.recommendations,
    knownLimitations: input.knownLimitations,
    certificationComplete: input.candidate.certified,
    readOnly: true,
    delegated: true,
  };
}
