import type { RegisteredExperienceId } from "../../runtime-registry/domain/runtime-experience.js";

export interface CoordinationRequestInput {
  generated_at?: string;
  current_route?: string;
  requested_route?: string;
  action?: "next" | "back" | "transition" | "finish" | "reset";
  context?: Record<string, unknown>;
}

export interface CoordinatorRuntimeContext {
  sessionId?: string;
  journeySessionId?: string;
  currentStepId?: string;
  currentMode?: string;
  runtimePhase?: string;
  returnDestination?: string;
  handoff?: Record<string, unknown>;
  registryExperienceId?: RegisteredExperienceId;
}

export interface CoordinationRequest {
  currentRoute: string;
  requestedRoute?: string;
  action?: CoordinationRequestInput["action"];
  context: CoordinatorRuntimeContext;
  generatedAt: string;
}

export function buildCoordinationRequest(
  input: CoordinationRequestInput,
  context: CoordinatorRuntimeContext
): CoordinationRequest {
  return {
    currentRoute: input.current_route ?? context.currentStepId ? `/${context.currentStepId}` : "/runtime/launch",
    requestedRoute: input.requested_route,
    action: input.action,
    context,
    generatedAt: input.generated_at ?? new Date().toISOString(),
  };
}
