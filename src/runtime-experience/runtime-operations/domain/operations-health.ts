export interface OperationsHealth {
  overallStatus: string;
  readinessPercentage: number;
  qualityScore: number;
  healthStatus: string;
  releaseCandidateDecision: string;
  mvpReadinessPercentage: number;
  certified: boolean;
}

export function buildOperationsHealth(input: {
  healthStatus: string;
  readinessPercentage: number;
  qualityScore: number;
  releaseCandidateDecision: string;
  mvpReadinessPercentage: number;
  certified: boolean;
}): OperationsHealth {
  return {
    overallStatus: input.healthStatus,
    readinessPercentage: input.readinessPercentage,
    qualityScore: input.qualityScore,
    healthStatus: input.healthStatus,
    releaseCandidateDecision: input.releaseCandidateDecision,
    mvpReadinessPercentage: input.mvpReadinessPercentage,
    certified: input.certified,
  };
}
