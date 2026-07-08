export interface FinalReadinessSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  reviewPercentage: number;
  readyForProduction: boolean;
}

export function createFinalReadinessSession(userId: string, generatedAt: string): FinalReadinessSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "pending",
    reviewPercentage: 0,
    readyForProduction: false,
  };
}

export class RuntimeFinalReadinessRepository {
  private readonly sessions = new Map<string, FinalReadinessSession>();

  getSession(userId: string, generatedAt: string): FinalReadinessSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createFinalReadinessSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: FinalReadinessSession): FinalReadinessSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeFinalReadinessRepository(): RuntimeFinalReadinessRepository {
  return new RuntimeFinalReadinessRepository();
}
