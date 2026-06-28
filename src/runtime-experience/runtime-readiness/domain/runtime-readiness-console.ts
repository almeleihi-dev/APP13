export const RUNTIME_READINESS_CONSOLE_VERSION = "an-act-runtime-readiness-console-v1" as const;

export const READINESS_FIXED_TIMESTAMP = "2026-06-21T23:00:00.000Z" as const;

export interface RuntimeReadinessConsoleDefinition {
  version: typeof RUNTIME_READINESS_CONSOLE_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeReadinessConsoleDefinition(): RuntimeReadinessConsoleDefinition {
  return {
    version: RUNTIME_READINESS_CONSOLE_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
