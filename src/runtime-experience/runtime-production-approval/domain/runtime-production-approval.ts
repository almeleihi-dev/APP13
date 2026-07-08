export const RUNTIME_PRODUCTION_APPROVAL_VERSION = "an-act-runtime-production-approval-v1" as const;

export const APPROVAL_FIXED_TIMESTAMP = "2026-06-22T02:00:00.000Z" as const;

export interface RuntimeProductionApprovalDefinition {
  version: typeof RUNTIME_PRODUCTION_APPROVAL_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeProductionApprovalDefinition(): RuntimeProductionApprovalDefinition {
  return {
    version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
