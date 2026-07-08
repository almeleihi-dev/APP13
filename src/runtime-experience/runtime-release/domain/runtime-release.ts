export const RUNTIME_RELEASE_VERSION = "an-act-runtime-release-v1" as const;

export const RELEASE_FIXED_TIMESTAMP = "2026-06-21T20:00:00.000Z" as const;

export interface RuntimeReleaseDefinition {
  version: typeof RUNTIME_RELEASE_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noReleaseExecution: true;
  noDeployment: true;
  noBubbleImplementation: true;
  noBusinessLogic: true;
  noAi: true;
  noPersistence: true;
  noRuntimeMutations: true;
}

export function buildRuntimeReleaseDefinition(): RuntimeReleaseDefinition {
  return {
    version: RUNTIME_RELEASE_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noReleaseExecution: true,
    noDeployment: true,
    noBubbleImplementation: true,
    noBusinessLogic: true,
    noAi: true,
    noPersistence: true,
    noRuntimeMutations: true,
  };
}
