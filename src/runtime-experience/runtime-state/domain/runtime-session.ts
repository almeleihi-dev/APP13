import type { ApplicationRuntimeState } from "./runtime-state.js";
import { createInitialApplicationRuntimeState } from "./runtime-state.js";
import type { RuntimeStateHistoryEntry } from "./runtime-history.js";

export interface ApplicationRuntimeSession {
  userId: string;
  sessionId: string;
  state: ApplicationRuntimeState;
  history: RuntimeStateHistoryEntry[];
  generatedAt: string;
  journeySessionId?: string;
}

export function createApplicationRuntimeSession(userId: string, generatedAt: string): ApplicationRuntimeSession {
  return {
    userId,
    sessionId: `runtime-state-${userId.slice(-8)}-${Date.now()}`,
    state: createInitialApplicationRuntimeState(generatedAt),
    history: [],
    generatedAt,
  };
}

export function appendStateHistoryEntry(
  session: ApplicationRuntimeSession,
  entry: Omit<RuntimeStateHistoryEntry, "timestamp"> & { timestamp?: string }
): RuntimeStateHistoryEntry {
  const record: RuntimeStateHistoryEntry = {
    stepId: entry.stepId,
    screenId: entry.screenId,
    route: entry.route,
    experience: entry.experience,
    phase: entry.phase,
    mode: entry.mode,
    timestamp: entry.timestamp ?? session.generatedAt,
  };
  session.history.push(record);
  return record;
}
