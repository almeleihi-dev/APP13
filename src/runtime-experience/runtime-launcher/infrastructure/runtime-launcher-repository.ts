import type { LaunchSession } from "../domain/launch-session.js";
import { createLaunchSession } from "../domain/launch-session.js";

export class RuntimeLauncherRepository {
  private readonly sessions = new Map<string, LaunchSession>();

  getSession(userId: string, generatedAt: string): LaunchSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createLaunchSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: LaunchSession): LaunchSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): LaunchSession {
    const session = createLaunchSession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }
}

export function createRuntimeLauncherRepository(): RuntimeLauncherRepository {
  return new RuntimeLauncherRepository();
}
