export interface ExecutiveSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  executiveReadinessScore: number;
  insightCount: number;
}

export function createExecutiveSession(userId: string, generatedAt: string): ExecutiveSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    executiveReadinessScore: 0,
    insightCount: 0,
  };
}

export class RuntimeExecutiveDashboardRepository {
  private readonly sessions = new Map<string, ExecutiveSession>();

  getSession(userId: string, generatedAt: string): ExecutiveSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createExecutiveSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ExecutiveSession): ExecutiveSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeExecutiveDashboardRepository(): RuntimeExecutiveDashboardRepository {
  return new RuntimeExecutiveDashboardRepository();
}
