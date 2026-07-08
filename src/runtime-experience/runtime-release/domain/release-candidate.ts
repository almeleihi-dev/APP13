export type ReleaseCandidateDecision = "certified" | "conditional" | "rejected" | "pending";

export interface ReleaseCandidate {
  id: string;
  title: string;
  version: string;
  decision: ReleaseCandidateDecision;
  certified: boolean;
  qualityScore: number;
  readinessPercentage: number;
  blockers: string[];
  warnings: string[];
  generatedAt: string;
}

export function buildReleaseCandidate(input: {
  decision: ReleaseCandidateDecision;
  qualityScore: number;
  readinessPercentage: number;
  blockers: string[];
  warnings: string[];
  generatedAt: string;
}): ReleaseCandidate {
  return {
    id: "an-act-runtime-release-candidate",
    title: "AN ACT Runtime Release Candidate",
    version: "an-act-runtime-release-v1",
    decision: input.decision,
    certified: input.decision === "certified",
    qualityScore: input.qualityScore,
    readinessPercentage: input.readinessPercentage,
    blockers: input.blockers,
    warnings: input.warnings,
    generatedAt: input.generatedAt,
  };
}

export function resolveReleaseCandidateDecision(
  qualityScore: number,
  blockers: string[],
  warnings: string[]
): ReleaseCandidateDecision {
  if (blockers.length > 0) return "rejected";
  if (qualityScore === 100 && warnings.length === 0) return "certified";
  if (qualityScore >= 90) return "conditional";
  return "pending";
}
