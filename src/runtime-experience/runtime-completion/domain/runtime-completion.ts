export const RUNTIME_COMPLETION_VERSION = "an-act-runtime-completion-v1" as const;

export const RUNTIME_COMPLETION_FIXED_TIMESTAMP = "2026-06-22T07:00:00.000Z" as const;

export interface RuntimeCompletionDefinition {
  version: typeof RUNTIME_COMPLETION_VERSION;
  readOnly: true;
  delegatesOnly: true;
  noDeployment: true;
  noRuntimeExecution: true;
  noExternalIntegration: true;
  noBubbleIntegration: true;
  noBusinessLogicDuplication: true;
  chapter: "CH3";
  handoffTarget: "CH4";
}

export function buildRuntimeCompletionDefinition(): RuntimeCompletionDefinition {
  return {
    version: RUNTIME_COMPLETION_VERSION,
    readOnly: true,
    delegatesOnly: true,
    noDeployment: true,
    noRuntimeExecution: true,
    noExternalIntegration: true,
    noBubbleIntegration: true,
    noBusinessLogicDuplication: true,
    chapter: "CH3",
    handoffTarget: "CH4",
  };
}
