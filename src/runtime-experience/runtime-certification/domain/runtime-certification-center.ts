export const RUNTIME_CERTIFICATION_CENTER_VERSION = "an-act-runtime-certification-center-v1" as const;

export const CERTIFICATION_FIXED_TIMESTAMP = "2026-06-22T00:00:00.000Z" as const;

export interface RuntimeCertificationCenterDefinition {
  version: typeof RUNTIME_CERTIFICATION_CENTER_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
}

export function buildRuntimeCertificationCenterDefinition(): RuntimeCertificationCenterDefinition {
  return {
    version: RUNTIME_CERTIFICATION_CENTER_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
  };
}
