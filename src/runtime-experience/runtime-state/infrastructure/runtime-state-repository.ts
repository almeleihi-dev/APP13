import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import { createApplicationRuntimeSession } from "../domain/runtime-session.js";

export class RuntimeStateRepository {
  private readonly sessions = new Map<string, ApplicationRuntimeSession>();

  getSession(userId: string, generatedAt: string): ApplicationRuntimeSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createApplicationRuntimeSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ApplicationRuntimeSession): ApplicationRuntimeSession {
    this.sessions.set(session.userId, {
      ...session,
      state: {
        ...session.state,
        context: { ...session.state.context },
        navigationStack: [...session.state.navigationStack],
      },
      history: [...session.history],
    });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): ApplicationRuntimeSession {
    const session = createApplicationRuntimeSession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }

  getHistory(userId: string): ApplicationRuntimeSession["history"] {
    return this.getSession(userId, new Date().toISOString()).history;
  }
}

export function createRuntimeStateRepository(): RuntimeStateRepository {
  return new RuntimeStateRepository();
}
