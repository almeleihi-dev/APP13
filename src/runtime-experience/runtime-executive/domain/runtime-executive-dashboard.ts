export const RUNTIME_EXECUTIVE_VERSION = "an-act-runtime-executive-v1" as const;

export const EXECUTIVE_FIXED_TIMESTAMP = "2026-06-21T22:00:00.000Z" as const;

export interface RuntimeExecutiveDefinition {
  version: typeof RUNTIME_EXECUTIVE_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeExecutiveDefinition(): RuntimeExecutiveDefinition {
  return {
    version: RUNTIME_EXECUTIVE_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
