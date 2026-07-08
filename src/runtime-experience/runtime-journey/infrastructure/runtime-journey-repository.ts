import type { RuntimeJourneySession } from "../domain/runtime-session.js";
import { createRuntimeJourneySession } from "../domain/runtime-session.js";

export class RuntimeJourneyRepository {
  private readonly sessions = new Map<string, RuntimeJourneySession>();

  getSession(userId: string, generatedAt: string): RuntimeJourneySession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createRuntimeJourneySession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: RuntimeJourneySession): RuntimeJourneySession {
    this.sessions.set(session.userId, { ...session, state: { ...session.state, handoff: { ...session.state.handoff } } });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): RuntimeJourneySession {
    const session = createRuntimeJourneySession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }

  getHistory(userId: string): RuntimeJourneySession["history"] {
    return this.getSession(userId, new Date().toISOString()).history;
  }
}

export function createRuntimeJourneyRepository(): RuntimeJourneyRepository {
  return new RuntimeJourneyRepository();
}
