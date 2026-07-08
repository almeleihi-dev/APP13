import type { RuntimeJourneyState, RuntimeHandoffContext, RuntimeReturnContext } from "./runtime-state.js";
import { createInitialRuntimeJourneyState } from "./runtime-state.js";
import type { RuntimeStepId } from "./runtime-step.js";

export interface RuntimeJourneyHistoryEntry {
  stepId: RuntimeStepId;
  experience: string;
  route: string;
  timestamp: string;
}

export interface RuntimeJourneySession {
  userId: string;
  sessionId: string;
  state: RuntimeJourneyState;
  history: RuntimeJourneyHistoryEntry[];
  generatedAt: string;
  activeExperience?: string;
  activeScreenId?: string;
  activeRoute?: string;
}

export function createRuntimeJourneySession(userId: string, generatedAt: string): RuntimeJourneySession {
  return {
    userId,
    sessionId: `journey-${userId.slice(-8)}-${Date.now()}`,
    state: createInitialRuntimeJourneyState(generatedAt),
    history: [],
    generatedAt,
  };
}

export function appendHistoryEntry(
  session: RuntimeJourneySession,
  entry: Omit<RuntimeJourneyHistoryEntry, "timestamp"> & { timestamp?: string }
): RuntimeJourneyHistoryEntry {
  const record: RuntimeJourneyHistoryEntry = {
    stepId: entry.stepId,
    experience: entry.experience,
    route: entry.route,
    timestamp: entry.timestamp ?? session.generatedAt,
  };
  session.history.push(record);
  return record;
}

export function updateSessionHandoff(session: RuntimeJourneySession, handoff: Partial<RuntimeHandoffContext>): void {
  session.state.handoff = { ...session.state.handoff, ...handoff };
}

export function updateReturnContext(session: RuntimeJourneySession, context: Partial<RuntimeReturnContext>): void {
  session.state.returnContext = { ...session.state.returnContext, ...context };
}
