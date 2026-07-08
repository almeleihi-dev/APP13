export const RUNTIME_PREVIEW_VERSION = "an-act-runtime-preview-v1" as const;

export const PREVIEW_FIXED_TIMESTAMP = "2026-06-21T18:30:00.000Z" as const;

export interface RuntimePreviewDefinition {
  version: typeof RUNTIME_PREVIEW_VERSION;
  readOnly: true;
  deterministic: true;
  delegatesOnly: true;
  noLifecycleMutations: true;
  noPersistence: true;
  noAi: true;
  noNetworking: true;
}

export function buildRuntimePreviewDefinition(): RuntimePreviewDefinition {
  return {
    version: RUNTIME_PREVIEW_VERSION,
    readOnly: true,
    deterministic: true,
    delegatesOnly: true,
    noLifecycleMutations: true,
    noPersistence: true,
    noAi: true,
    noNetworking: true,
  };
}
