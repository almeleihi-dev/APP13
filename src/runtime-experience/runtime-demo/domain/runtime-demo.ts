export const RUNTIME_DEMO_VERSION = "an-act-runtime-demo-v1" as const;

export const DEMO_FIXED_TIMESTAMP = "2026-06-21T18:00:00.000Z" as const;

export type DemoPlaybackStatus = "idle" | "playing" | "paused" | "stopped" | "completed";

export interface RuntimeDemoDefinition {
  version: typeof RUNTIME_DEMO_VERSION;
  readOnly: true;
  deterministic: true;
  simulatedData: true;
  delegatesOnly: true;
}

export function buildRuntimeDemoDefinition(): RuntimeDemoDefinition {
  return {
    version: RUNTIME_DEMO_VERSION,
    readOnly: true,
    deterministic: true,
    simulatedData: true,
    delegatesOnly: true,
  };
}
