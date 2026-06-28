export const RUNTIME_COORDINATOR_VERSION = "an-act-runtime-coordinator-v1" as const;

export const COORDINATOR_DELEGATION_TARGETS = [
  "runtime-journey",
  "runtime-state",
  "runtime-registry",
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
] as const;

export type CoordinatorDelegationTarget = (typeof COORDINATOR_DELEGATION_TARGETS)[number];

export interface RuntimeCoordinatorDefinition {
  version: typeof RUNTIME_COORDINATOR_VERSION;
  delegationOnly: true;
  ownsBusinessLogic: false;
  deterministic: true;
  readOnly: true;
}

export function buildRuntimeCoordinatorDefinition(): RuntimeCoordinatorDefinition {
  return {
    version: RUNTIME_COORDINATOR_VERSION,
    delegationOnly: true,
    ownsBusinessLogic: false,
    deterministic: true,
    readOnly: true,
  };
}
