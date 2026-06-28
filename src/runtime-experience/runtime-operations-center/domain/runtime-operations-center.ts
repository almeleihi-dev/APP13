export const RUNTIME_OPERATIONS_CENTER_VERSION = "an-act-runtime-operations-center-v1" as const;

export const OPERATIONS_CENTER_FIXED_TIMESTAMP = "2026-06-22T03:00:00.000Z" as const;

export interface RuntimeOperationsCenterDefinition {
  version: typeof RUNTIME_OPERATIONS_CENTER_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeOperationsCenterDefinition(): RuntimeOperationsCenterDefinition {
  return {
    version: RUNTIME_OPERATIONS_CENTER_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
