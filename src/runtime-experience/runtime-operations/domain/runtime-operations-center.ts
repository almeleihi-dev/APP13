export const RUNTIME_OPERATIONS_VERSION = "an-act-runtime-operations-v1" as const;

export const OPERATIONS_FIXED_TIMESTAMP = "2026-06-21T21:00:00.000Z" as const;

export interface RuntimeOperationsDefinition {
  version: typeof RUNTIME_OPERATIONS_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeOperationsDefinition(): RuntimeOperationsDefinition {
  return {
    version: RUNTIME_OPERATIONS_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
