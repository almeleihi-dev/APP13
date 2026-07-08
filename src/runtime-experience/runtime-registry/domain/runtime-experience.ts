export const RUNTIME_REGISTRY_VERSION = "an-act-runtime-registry-v1" as const;

export const REGISTERED_EXPERIENCE_IDS = [
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
  "runtime-journey",
  "runtime-state",
] as const;

export type RegisteredExperienceId = (typeof REGISTERED_EXPERIENCE_IDS)[number];

export type RuntimeExperienceMode = "Need" | "Action" | "Transition" | "Shared" | "Orchestration" | "State";

export interface RegisteredRuntimeExperience {
  id: RegisteredExperienceId;
  name: string;
  version: string;
  mode: RuntimeExperienceMode;
  lifecyclePhase: string;
  primaryRoute: string;
  supportedRoutes: string[];
  requiredContexts: string[];
  producedContexts: string[];
  dependencies: RegisteredExperienceId[];
  capabilities: string[];
  available: boolean;
  validationStatus: "valid" | "invalid" | "unknown";
  moduleRef: string;
}

export function isRegisteredExperienceId(value: string): value is RegisteredExperienceId {
  return REGISTERED_EXPERIENCE_IDS.includes(value as RegisteredExperienceId);
}
