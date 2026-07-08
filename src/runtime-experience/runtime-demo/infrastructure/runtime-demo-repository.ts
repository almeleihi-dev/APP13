import type { DemoSession } from "../domain/demo-session.js";
import { createDemoSession } from "../domain/demo-session.js";

export class RuntimeDemoRepository {
  private readonly sessions = new Map<string, DemoSession>();

  getSession(userId: string, generatedAt: string): DemoSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createDemoSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: DemoSession): DemoSession {
    this.sessions.set(session.userId, { ...session, stepIndices: [...session.stepIndices] });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): DemoSession {
    const session = createDemoSession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }
}

export function createRuntimeDemoRepository(): RuntimeDemoRepository {
  return new RuntimeDemoRepository();
}
