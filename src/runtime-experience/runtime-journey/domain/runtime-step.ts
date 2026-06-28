import type { RuntimeJourneyExperienceId } from "./runtime-journey.js";

export type RuntimeStepId =
  | "launch"
  | "need-home"
  | "search"
  | "opportunity-list"
  | "request"
  | "need-transition"
  | "action-home"
  | "contract"
  | "chat"
  | "timeline"
  | "notification"
  | "profile"
  | "completion"
  | "return-transition"
  | "need-home-return";

export interface RuntimeStep {
  id: RuntimeStepId;
  label: string;
  experience: RuntimeJourneyExperienceId | "journey";
  screenId?: string;
  route: string;
  phase: "launch" | "need" | "transition" | "action" | "contract" | "shared" | "completion" | "return";
}

export const RUNTIME_JOURNEY_STEPS: RuntimeStep[] = [
  { id: "launch", label: "Launch", experience: "journey", route: "/runtime/launch", phase: "launch" },
  { id: "need-home", label: "Need Home", experience: "need", screenId: "need-home", route: "/need/home", phase: "need" },
  { id: "search", label: "Search", experience: "need", screenId: "search", route: "/need/search", phase: "need" },
  { id: "opportunity-list", label: "Opportunity List", experience: "need", screenId: "opportunity-list", route: "/need/opportunities", phase: "need" },
  { id: "request", label: "Request", experience: "need", screenId: "request", route: "/need/request/create", phase: "need" },
  { id: "need-transition", label: "an act...", experience: "need", screenId: "transition", route: "/system/transition", phase: "transition" },
  { id: "action-home", label: "Action Home", experience: "action", screenId: "action-home", route: "/action/home", phase: "action" },
  { id: "contract", label: "Contract", experience: "contract", screenId: "contract-home", route: "/contract/home", phase: "contract" },
  { id: "chat", label: "Chat", experience: "chat", screenId: "chat-home", route: "/chat/home", phase: "shared" },
  { id: "timeline", label: "Timeline", experience: "timeline", screenId: "timeline-home", route: "/timeline/home", phase: "shared" },
  { id: "notification", label: "Notification", experience: "notification", screenId: "notification-home", route: "/notification/home", phase: "shared" },
  { id: "profile", label: "Profile", experience: "profile", screenId: "profile-home", route: "/profile/home", phase: "shared" },
  { id: "completion", label: "Completion", experience: "action", screenId: "completion-screen", route: "/action/completion", phase: "completion" },
  { id: "return-transition", label: "Return Transition", experience: "action", screenId: "transition", route: "/system/transition", phase: "return" },
  { id: "need-home-return", label: "Need Home", experience: "need", screenId: "need-home", route: "/need/home", phase: "need" },
];

export function getRuntimeStep(stepId: RuntimeStepId): RuntimeStep {
  const step = RUNTIME_JOURNEY_STEPS.find((s) => s.id === stepId);
  if (!step) throw new Error(`Unknown runtime step: ${stepId}`);
  return step;
}

export function getRuntimeStepByIndex(index: number): RuntimeStep | undefined {
  return RUNTIME_JOURNEY_STEPS[index];
}

export function getRuntimeStepIndex(stepId: RuntimeStepId): number {
  return RUNTIME_JOURNEY_STEPS.findIndex((s) => s.id === stepId);
}

export function isRuntimeStepId(value: string): value is RuntimeStepId {
  return RUNTIME_JOURNEY_STEPS.some((s) => s.id === value);
}
