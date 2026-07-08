import { RUNTIME_REGISTRY_VERSION } from "./runtime-experience.js";
import type { RegisteredRuntimeExperience } from "./runtime-experience.js";
import { REGISTERED_EXPERIENCE_IDS } from "./runtime-experience.js";
import { NEED_EXPERIENCE_VERSION, NEED_SCREEN_ROUTES } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION, ACTION_SCREEN_ROUTES } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION, CONTRACT_SCREEN_ROUTES } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION, CHAT_SCREEN_ROUTES } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION, TIMELINE_SCREEN_ROUTES } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION, NOTIFICATION_SCREEN_ROUTES } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION, PROFILE_SCREEN_ROUTES } from "../../profile/domain/profile-screen.js";
import { RUNTIME_JOURNEY_VERSION, OFFICIAL_RUNTIME_JOURNEY_FLOW } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_JOURNEY_STEPS } from "../../runtime-journey/domain/runtime-step.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { OFFICIAL_RUNTIME_LIFECYCLE } from "../../runtime-state/domain/runtime-phase.js";

export interface RuntimeCatalog {
  version: string;
  experienceCount: number;
  experiences: RegisteredRuntimeExperience[];
  lifecycleCoverage: readonly string[];
  loadedAt: string;
}

function routesFromRecord(record: Record<string, string>): string[] {
  return [...new Set(Object.values(record))];
}

export function buildOfficialRuntimeCatalog(
  validationStatus: Record<string, "valid" | "invalid">,
  loadedAt: string
): RuntimeCatalog {
  const experiences: RegisteredRuntimeExperience[] = [
    {
      id: "need",
      name: "Need Experience",
      version: NEED_EXPERIENCE_VERSION,
      mode: "Need",
      lifecyclePhase: "need-session",
      primaryRoute: NEED_SCREEN_ROUTES["need-home"],
      supportedRoutes: routesFromRecord(NEED_SCREEN_ROUTES),
      requiredContexts: [],
      producedContexts: ["needRequest"],
      dependencies: [],
      capabilities: ["navigation", "screens", "handoff", "transition", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.need ?? "unknown",
      moduleRef: "runtime-experience/need",
    },
    {
      id: "action",
      name: "Action Experience",
      version: ACTION_EXPERIENCE_VERSION,
      mode: "Action",
      lifecyclePhase: "action-session",
      primaryRoute: ACTION_SCREEN_ROUTES["action-home"],
      supportedRoutes: routesFromRecord(ACTION_SCREEN_ROUTES),
      requiredContexts: ["needRequest"],
      producedContexts: ["actionId"],
      dependencies: ["need"],
      capabilities: ["navigation", "screens", "handoff", "transition", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.action ?? "unknown",
      moduleRef: "runtime-experience/action",
    },
    {
      id: "contract",
      name: "Contract Experience",
      version: CONTRACT_EXPERIENCE_VERSION,
      mode: "Action",
      lifecyclePhase: "action-session",
      primaryRoute: CONTRACT_SCREEN_ROUTES["contract-home"],
      supportedRoutes: routesFromRecord(CONTRACT_SCREEN_ROUTES),
      requiredContexts: ["needRequest", "actionId"],
      producedContexts: ["contractId"],
      dependencies: ["need", "action"],
      capabilities: ["navigation", "screens", "handoff", "transition", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.contract ?? "unknown",
      moduleRef: "runtime-experience/contract",
    },
    {
      id: "chat",
      name: "Chat Experience",
      version: CHAT_EXPERIENCE_VERSION,
      mode: "Shared",
      lifecyclePhase: "action-session",
      primaryRoute: CHAT_SCREEN_ROUTES["chat-home"],
      supportedRoutes: routesFromRecord(CHAT_SCREEN_ROUTES),
      requiredContexts: ["contractId", "actionId"],
      producedContexts: ["conversationId"],
      dependencies: ["need", "action", "contract"],
      capabilities: ["navigation", "screens", "handoff", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.chat ?? "unknown",
      moduleRef: "runtime-experience/chat",
    },
    {
      id: "timeline",
      name: "Timeline Experience",
      version: TIMELINE_EXPERIENCE_VERSION,
      mode: "Shared",
      lifecyclePhase: "action-session",
      primaryRoute: TIMELINE_SCREEN_ROUTES["timeline-home"],
      supportedRoutes: routesFromRecord(TIMELINE_SCREEN_ROUTES),
      requiredContexts: ["actionId"],
      producedContexts: ["timelineContext"],
      dependencies: ["need", "action", "contract"],
      capabilities: ["navigation", "screens", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.timeline ?? "unknown",
      moduleRef: "runtime-experience/timeline",
    },
    {
      id: "notification",
      name: "Notification Experience",
      version: NOTIFICATION_EXPERIENCE_VERSION,
      mode: "Shared",
      lifecyclePhase: "action-session",
      primaryRoute: NOTIFICATION_SCREEN_ROUTES["notification-home"],
      supportedRoutes: routesFromRecord(NOTIFICATION_SCREEN_ROUTES),
      requiredContexts: ["actionId"],
      producedContexts: ["notificationContext"],
      dependencies: ["need", "action", "contract"],
      capabilities: ["navigation", "screens", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.notification ?? "unknown",
      moduleRef: "runtime-experience/notification",
    },
    {
      id: "profile",
      name: "Profile Experience",
      version: PROFILE_EXPERIENCE_VERSION,
      mode: "Shared",
      lifecyclePhase: "action-session",
      primaryRoute: PROFILE_SCREEN_ROUTES["profile-home"],
      supportedRoutes: routesFromRecord(PROFILE_SCREEN_ROUTES),
      requiredContexts: ["userId"],
      producedContexts: ["profileContext"],
      dependencies: ["need", "action", "contract", "chat", "timeline", "notification"],
      capabilities: ["navigation", "screens", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus.profile ?? "unknown",
      moduleRef: "runtime-experience/profile",
    },
    {
      id: "runtime-journey",
      name: "Runtime Journey",
      version: RUNTIME_JOURNEY_VERSION,
      mode: "Orchestration",
      lifecyclePhase: "orchestration",
      primaryRoute: "/runtime/launch",
      supportedRoutes: RUNTIME_JOURNEY_STEPS.map((s) => s.route),
      requiredContexts: ["needRequest"],
      producedContexts: ["journeySession", "handoff", "returnContext"],
      dependencies: ["need", "action", "contract", "chat", "timeline", "notification", "profile"],
      capabilities: ["navigation", "orchestration", "session", "handoff", "transition", "validation", "discovery", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus["runtime-journey"] ?? "unknown",
      moduleRef: "runtime-experience/runtime-journey",
    },
    {
      id: "runtime-state",
      name: "Runtime State",
      version: RUNTIME_STATE_VERSION,
      mode: "State",
      lifecyclePhase: "state-management",
      primaryRoute: "/runtime-state",
      supportedRoutes: [
        "/runtime-state",
        "/runtime-state/session",
        "/runtime-state/history",
        "/runtime-state/context",
        "/runtime-state/phase",
      ],
      requiredContexts: ["journeySession"],
      producedContexts: ["applicationSession", "navigationStack", "activeContexts"],
      dependencies: ["runtime-journey"],
      capabilities: ["state-management", "session", "discovery", "validation", "read-only", "deterministic"],
      available: true,
      validationStatus: validationStatus["runtime-state"] ?? "unknown",
      moduleRef: "runtime-experience/runtime-state",
    },
  ];

  return {
    version: RUNTIME_REGISTRY_VERSION,
    experienceCount: experiences.length,
    experiences,
    lifecycleCoverage: [...OFFICIAL_RUNTIME_LIFECYCLE, ...OFFICIAL_RUNTIME_JOURNEY_FLOW.slice(0, 1)],
    loadedAt,
  };
}

export { REGISTERED_EXPERIENCE_IDS };
