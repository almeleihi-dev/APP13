export const RUNTIME_LAUNCHER_VERSION = "an-act-runtime-launcher-v1" as const;

export const LAUNCHER_FIXED_TIMESTAMP = "2026-06-21T19:00:00.000Z" as const;

export interface RuntimeLauncherDefinition {
  version: typeof RUNTIME_LAUNCHER_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noLaunchExecution: true;
  noDeployment: true;
  noBubbleImplementation: true;
  noBusinessLogic: true;
  noAi: true;
  noPersistenceChanges: true;
}

export function buildRuntimeLauncherDefinition(): RuntimeLauncherDefinition {
  return {
    version: RUNTIME_LAUNCHER_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noLaunchExecution: true,
    noDeployment: true,
    noBubbleImplementation: true,
    noBusinessLogic: true,
    noAi: true,
    noPersistenceChanges: true,
  };
}
