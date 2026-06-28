export interface ExecutiveLaunchAuthoritySession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  authorizationPercentage: number;
  officialExecutiveLaunchApproval: boolean;
}

export function createExecutiveLaunchAuthoritySession(
  userId: string,
  generatedAt: string
): ExecutiveLaunchAuthoritySession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    authorizationPercentage: 0,
    officialExecutiveLaunchApproval: false,
  };
}

export class RuntimeExecutiveLaunchAuthorityRepository {
  private readonly sessions = new Map<string, ExecutiveLaunchAuthoritySession>();

  getSession(userId: string, generatedAt: string): ExecutiveLaunchAuthoritySession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createExecutiveLaunchAuthoritySession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ExecutiveLaunchAuthoritySession): ExecutiveLaunchAuthoritySession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeExecutiveLaunchAuthorityRepository(): RuntimeExecutiveLaunchAuthorityRepository {
  return new RuntimeExecutiveLaunchAuthorityRepository();
}
