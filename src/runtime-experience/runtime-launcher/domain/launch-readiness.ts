export interface LaunchReadinessSummary {
  mvpReadinessPercentage: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningCount: number;
  blockerCount: number;
  readyForMvp: boolean;
  readyForHandoff: boolean;
  readyForProductionCandidate: boolean;
}

export function calculateMvpReadinessPercentage(passedChecks: number, totalChecks: number): number {
  if (totalChecks <= 0) return 0;
  return Math.round((passedChecks / totalChecks) * 100);
}

export function buildLaunchReadinessSummary(input: {
  passedChecks: number;
  totalChecks: number;
  warnings: string[];
  blockers: string[];
}): LaunchReadinessSummary {
  const mvpReadinessPercentage = calculateMvpReadinessPercentage(input.passedChecks, input.totalChecks);
  const failedChecks = input.totalChecks - input.passedChecks;
  return {
    mvpReadinessPercentage,
    totalChecks: input.totalChecks,
    passedChecks: input.passedChecks,
    failedChecks,
    warningCount: input.warnings.length,
    blockerCount: input.blockers.length,
    readyForMvp: mvpReadinessPercentage >= 90 && input.blockers.length === 0,
    readyForHandoff: mvpReadinessPercentage >= 95 && input.blockers.length === 0,
    readyForProductionCandidate: mvpReadinessPercentage === 100 && input.blockers.length === 0 && input.warnings.length === 0,
  };
}
