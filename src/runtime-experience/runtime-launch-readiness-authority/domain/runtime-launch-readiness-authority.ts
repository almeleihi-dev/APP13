export const RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION = "an-act-runtime-launch-readiness-authority-v1" as const;

export const LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP = "2026-06-22T05:00:00.000Z" as const;

export interface RuntimeLaunchReadinessAuthorityDefinition {
  version: typeof RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeLaunchReadinessAuthorityDefinition(): RuntimeLaunchReadinessAuthorityDefinition {
  return {
    version: RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
