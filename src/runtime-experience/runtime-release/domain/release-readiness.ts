export interface ReleaseReadiness {
  readinessPercentage: number;
  qualityScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningCount: number;
  blockerCount: number;
  readyForCertification: boolean;
}

export function calculateReleaseReadinessPercentage(passedChecks: number, totalChecks: number): number {
  if (totalChecks <= 0) return 0;
  return Math.round((passedChecks / totalChecks) * 100);
}

export function calculateRuntimeQualityScore(passedChecks: number, totalChecks: number): number {
  return calculateReleaseReadinessPercentage(passedChecks, totalChecks);
}

export function buildReleaseReadiness(input: {
  passedChecks: number;
  totalChecks: number;
  warnings: string[];
  blockers: string[];
}): ReleaseReadiness {
  const readinessPercentage = calculateReleaseReadinessPercentage(input.passedChecks, input.totalChecks);
  const qualityScore = calculateRuntimeQualityScore(input.passedChecks, input.totalChecks);
  return {
    readinessPercentage,
    qualityScore,
    totalChecks: input.totalChecks,
    passedChecks: input.passedChecks,
    failedChecks: input.totalChecks - input.passedChecks,
    warningCount: input.warnings.length,
    blockerCount: input.blockers.length,
    readyForCertification: qualityScore === 100 && input.blockers.length === 0,
  };
}
