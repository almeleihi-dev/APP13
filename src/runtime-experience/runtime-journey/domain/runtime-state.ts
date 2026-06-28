import type { RuntimeStepId } from "./runtime-step.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export type RuntimeLifecyclePhase =
  | "idle"
  | "need"
  | "transition"
  | "action"
  | "contract"
  | "shared"
  | "completion"
  | "return"
  | "finished";

export interface RuntimeHandoffContext {
  needRequest?: NeedRequestDraft;
  contractId?: string;
  actionId?: string;
  conversationId?: string;
}

export interface RuntimeReturnContext {
  fromExperience: string;
  returnRoute: string;
  completed: boolean;
}

export interface RuntimeJourneyState {
  currentStepId: RuntimeStepId;
  currentStepIndex: number;
  lifecyclePhase: RuntimeLifecyclePhase;
  startedAt: string;
  updatedAt: string;
  finished: boolean;
  handoff: RuntimeHandoffContext;
  returnContext: RuntimeReturnContext;
}

export function createInitialRuntimeJourneyState(generatedAt: string): RuntimeJourneyState {
  return {
    currentStepId: "launch",
    currentStepIndex: 0,
    lifecyclePhase: "idle",
    startedAt: generatedAt,
    updatedAt: generatedAt,
    finished: false,
    handoff: {},
    returnContext: {
      fromExperience: "need",
      returnRoute: "/need/home",
      completed: false,
    },
  };
}

export function resolveLifecyclePhase(stepId: RuntimeStepId): RuntimeLifecyclePhase {
  switch (stepId) {
    case "launch":
      return "idle";
    case "need-home":
    case "search":
    case "opportunity-list":
    case "request":
      return "need";
    case "need-transition":
      return "transition";
    case "action-home":
      return "action";
    case "contract":
      return "contract";
    case "chat":
    case "timeline":
    case "notification":
    case "profile":
      return "shared";
    case "completion":
      return "completion";
    case "return-transition":
      return "return";
    case "need-home-return":
      return "finished";
    default:
      return "idle";
  }
}
