import type { CoordinationSession } from "../domain/coordination-session.js";

export class RuntimeCoordinatorRepository {
  private readonly sessions = new Map<string, CoordinationSession>();

  getSession(userId: string, generatedAt: string): CoordinationSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        lastPlanId: undefined,
        lastActiveExperience: undefined,
        generatedAt,
      });
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: CoordinationSession): CoordinationSession {
    this.sessions.set(session.userId, { ...session });
    return session;
  }

  resetSession(userId: string, generatedAt: string): CoordinationSession {
    const session: CoordinationSession = {
      userId,
      lastPlanId: undefined,
      lastActiveExperience: undefined,
      generatedAt,
    };
    this.sessions.set(userId, session);
    return session;
  }
}

export function createRuntimeCoordinatorRepository(): RuntimeCoordinatorRepository {
  return new RuntimeCoordinatorRepository();
}
