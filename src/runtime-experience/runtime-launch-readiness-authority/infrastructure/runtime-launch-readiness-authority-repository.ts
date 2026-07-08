export interface LaunchReadinessAuthoritySession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  readinessPercentage: number;
  officiallyReadyForLaunch: boolean;
}

export function createLaunchReadinessAuthoritySession(userId: string, generatedAt: string): LaunchReadinessAuthoritySession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    readinessPercentage: 0,
    officiallyReadyForLaunch: false,
  };
}

export class RuntimeLaunchReadinessAuthorityRepository {
  private readonly sessions = new Map<string, LaunchReadinessAuthoritySession>();

  getSession(userId: string, generatedAt: string): LaunchReadinessAuthoritySession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createLaunchReadinessAuthoritySession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: LaunchReadinessAuthoritySession): LaunchReadinessAuthoritySession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeLaunchReadinessAuthorityRepository(): RuntimeLaunchReadinessAuthorityRepository {
  return new RuntimeLaunchReadinessAuthorityRepository();
}
