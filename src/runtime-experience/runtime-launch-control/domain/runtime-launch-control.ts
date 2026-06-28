export const RUNTIME_LAUNCH_CONTROL_VERSION = "an-act-runtime-launch-control-v1" as const;

export const LAUNCH_CONTROL_FIXED_TIMESTAMP = "2026-06-22T04:00:00.000Z" as const;

export interface RuntimeLaunchControlDefinition {
  version: typeof RUNTIME_LAUNCH_CONTROL_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeLaunchControlDefinition(): RuntimeLaunchControlDefinition {
  return {
    version: RUNTIME_LAUNCH_CONTROL_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
