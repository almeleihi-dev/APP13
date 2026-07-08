export interface ReadinessConsoleSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  readinessPercentage: number;
  openGateCount: number;
}

export function createReadinessConsoleSession(userId: string, generatedAt: string): ReadinessConsoleSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "pending",
    readinessPercentage: 0,
    openGateCount: 0,
  };
}

export class RuntimeReadinessConsoleRepository {
  private readonly sessions = new Map<string, ReadinessConsoleSession>();

  getSession(userId: string, generatedAt: string): ReadinessConsoleSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createReadinessConsoleSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ReadinessConsoleSession): ReadinessConsoleSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeReadinessConsoleRepository(): RuntimeReadinessConsoleRepository {
  return new RuntimeReadinessConsoleRepository();
}
