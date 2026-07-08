export interface RuntimeCompletionSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  completionPercentage: number;
  runtimeChapter3Completed: boolean;
  runtimeCertified: boolean;
}

export function createRuntimeCompletionSession(userId: string, generatedAt: string): RuntimeCompletionSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    completionPercentage: 0,
    runtimeChapter3Completed: false,
    runtimeCertified: false,
  };
}

export class RuntimeCompletionRepository {
  private readonly sessions = new Map<string, RuntimeCompletionSession>();

  getSession(userId: string, generatedAt: string): RuntimeCompletionSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createRuntimeCompletionSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: RuntimeCompletionSession): RuntimeCompletionSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeCompletionRepository(): RuntimeCompletionRepository {
  return new RuntimeCompletionRepository();
}
