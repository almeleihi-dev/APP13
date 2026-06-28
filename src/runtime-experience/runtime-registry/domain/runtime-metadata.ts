import type { RegisteredExperienceId } from "./runtime-experience.js";

export interface RuntimeExperienceMetadata {
  id: RegisteredExperienceId;
  chapter: string;
  description: string;
  apiPrefix: string;
  readOnly: true;
  deterministic: true;
  persistence: false;
}

export const RUNTIME_EXPERIENCE_METADATA: Record<RegisteredExperienceId, RuntimeExperienceMetadata> = {
  need: {
    id: "need",
    chapter: "CH3-X5",
    description: "Need Experience — search, opportunities, request, transition",
    apiPrefix: "/need-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  action: {
    id: "action",
    chapter: "CH3-X6",
    description: "Action Experience — action home, progress, completion, return",
    apiPrefix: "/action-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  contract: {
    id: "contract",
    chapter: "CH3-X7",
    description: "Contract Experience — contract review, terms, confirmation",
    apiPrefix: "/contract-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  chat: {
    id: "chat",
    chapter: "CH3-X8",
    description: "Chat Experience — conversations and messaging",
    apiPrefix: "/chat-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  timeline: {
    id: "timeline",
    chapter: "CH3-X9",
    description: "Timeline Experience — activity timeline and progress",
    apiPrefix: "/timeline-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  notification: {
    id: "notification",
    chapter: "CH3-X10",
    description: "Notification Experience — notifications and settings",
    apiPrefix: "/notification-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  profile: {
    id: "profile",
    chapter: "CH3-X11",
    description: "Profile Experience — identity, live frame, achievements",
    apiPrefix: "/profile-experience",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  "runtime-journey": {
    id: "runtime-journey",
    chapter: "CH3-X12",
    description: "Complete Runtime Journey — orchestrates all experiences",
    apiPrefix: "/runtime-journey",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
  "runtime-state": {
    id: "runtime-state",
    chapter: "CH3-X13",
    description: "Runtime State Engine — authoritative application session",
    apiPrefix: "/runtime-state",
    readOnly: true,
    deterministic: true,
    persistence: false,
  },
};

export function getRuntimeExperienceMetadata(id: RegisteredExperienceId): RuntimeExperienceMetadata {
  return RUNTIME_EXPERIENCE_METADATA[id];
}
