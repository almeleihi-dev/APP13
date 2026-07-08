export const RUNTIME_JOURNEY_VERSION = "an-act-runtime-journey-v1" as const;

export const RUNTIME_JOURNEY_EXPERIENCE_IDS = [
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
] as const;

export type RuntimeJourneyExperienceId = (typeof RUNTIME_JOURNEY_EXPERIENCE_IDS)[number];

export const OFFICIAL_RUNTIME_JOURNEY_FLOW = [
  "Launch",
  "Need Home",
  "Search",
  "Opportunity List",
  "Request",
  "an act...",
  "Action Home",
  "Contract",
  "Chat",
  "Timeline",
  "Notification",
  "Profile",
  "Completion",
  "Return Transition",
  "Need Home",
] as const;

export interface RuntimeJourneyDefinition {
  version: typeof RUNTIME_JOURNEY_VERSION;
  flow: readonly string[];
  experienceIds: readonly RuntimeJourneyExperienceId[];
  deterministic: true;
  readOnly: true;
}

export function buildRuntimeJourneyDefinition(): RuntimeJourneyDefinition {
  return {
    version: RUNTIME_JOURNEY_VERSION,
    flow: OFFICIAL_RUNTIME_JOURNEY_FLOW,
    experienceIds: RUNTIME_JOURNEY_EXPERIENCE_IDS,
    deterministic: true,
    readOnly: true,
  };
}
