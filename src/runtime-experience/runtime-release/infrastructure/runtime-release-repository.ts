export interface ReleaseSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  qualityScore: number;
  readinessPercentage: number;
  candidateDecision: string;
}

export function createReleaseSession(userId: string, generatedAt: string): ReleaseSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    qualityScore: 0,
    readinessPercentage: 0,
    candidateDecision: "pending",
  };
}

export class RuntimeReleaseRepository {
  private readonly sessions = new Map<string, ReleaseSession>();

  getSession(userId: string, generatedAt: string): ReleaseSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createReleaseSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ReleaseSession): ReleaseSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): ReleaseSession {
    const session = createReleaseSession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }
}

export function createRuntimeReleaseRepository(): RuntimeReleaseRepository {
  return new RuntimeReleaseRepository();
}
