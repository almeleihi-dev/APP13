export const RUNTIME_FINAL_READINESS_REVIEW_VERSION = "an-act-runtime-final-readiness-review-v1" as const;

export const FINAL_READINESS_FIXED_TIMESTAMP = "2026-06-22T01:00:00.000Z" as const;

export interface RuntimeFinalReadinessReviewDefinition {
  version: typeof RUNTIME_FINAL_READINESS_REVIEW_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeFinalReadinessReviewDefinition(): RuntimeFinalReadinessReviewDefinition {
  return {
    version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
