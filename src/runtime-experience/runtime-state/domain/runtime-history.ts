import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";
import type { RuntimeApplicationPhase } from "./runtime-phase.js";

export interface RuntimeStateHistoryEntry {
  stepId: RuntimeStepId;
  screenId?: string;
  route: string;
  experience: string;
  phase: RuntimeApplicationPhase;
  mode: "Need" | "Action" | "Transition";
  timestamp: string;
}

export function createHistoryEntry(input: Omit<RuntimeStateHistoryEntry, "timestamp"> & { timestamp?: string }): RuntimeStateHistoryEntry {
  return {
    stepId: input.stepId,
    screenId: input.screenId,
    route: input.route,
    experience: input.experience,
    phase: input.phase,
    mode: input.mode,
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}
