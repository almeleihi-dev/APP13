export const RUNTIME_HEALTH_VERSION = "an-act-runtime-health-v1" as const;

export const HEALTH_EXPERIENCE_IDS = [
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
  "runtime-journey",
  "runtime-state",
  "runtime-registry",
  "runtime-coordinator",
] as const;

export type HealthExperienceId = (typeof HEALTH_EXPERIENCE_IDS)[number];

export const HEALTH_EXPERIENCE_NAMES: Record<HealthExperienceId, string> = {
  need: "Need Experience",
  action: "Action Experience",
  contract: "Contract Experience",
  chat: "Chat Experience",
  timeline: "Timeline Experience",
  notification: "Notification Experience",
  profile: "Profile Experience",
  "runtime-journey": "Runtime Journey",
  "runtime-state": "Runtime State",
  "runtime-registry": "Runtime Registry",
  "runtime-coordinator": "Runtime Coordinator",
};

export function isHealthExperienceId(value: string): value is HealthExperienceId {
  return HEALTH_EXPERIENCE_IDS.includes(value as HealthExperienceId);
}

export interface RuntimeHealthDefinition {
  version: typeof RUNTIME_HEALTH_VERSION;
  readOnly: true;
  deterministic: true;
  delegatesOnly: true;
}

export function buildRuntimeHealthDefinition(): RuntimeHealthDefinition {
  return {
    version: RUNTIME_HEALTH_VERSION,
    readOnly: true,
    deterministic: true,
    delegatesOnly: true,
  };
}
