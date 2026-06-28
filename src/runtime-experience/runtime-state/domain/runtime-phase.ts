import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";

export type RuntimeApplicationPhase =
  | "launch"
  | "need-session"
  | "transition"
  | "action-session"
  | "completion"
  | "return-transition";

export const OFFICIAL_RUNTIME_LIFECYCLE = [
  "Launch",
  "Need Session",
  "Transition",
  "Action Session",
  "Completion",
  "Return Transition",
  "Need Session",
] as const;

export function resolveApplicationPhase(stepId: RuntimeStepId): RuntimeApplicationPhase {
  switch (stepId) {
    case "launch":
      return "launch";
    case "need-home":
    case "search":
    case "opportunity-list":
    case "request":
    case "need-home-return":
      return "need-session";
    case "need-transition":
      return "transition";
    case "action-home":
    case "contract":
    case "chat":
    case "timeline":
    case "notification":
    case "profile":
      return "action-session";
    case "completion":
      return "completion";
    case "return-transition":
      return "return-transition";
    default:
      return "launch";
  }
}

export function resolveRuntimeMode(stepId: RuntimeStepId): "Need" | "Action" | "Transition" {
  const phase = resolveApplicationPhase(stepId);
  if (phase === "transition" || phase === "return-transition") return "Transition";
  if (phase === "need-session" || stepId === "launch") return "Need";
  return "Action";
}

export function isTransitionPhase(phase: RuntimeApplicationPhase): boolean {
  return phase === "transition" || phase === "return-transition";
}
