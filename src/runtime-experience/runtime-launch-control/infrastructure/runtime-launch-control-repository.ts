export interface LaunchControlSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  launchClearancePercentage: number;
  officiallyClearedForLaunch: boolean;
}

export function createLaunchControlSession(userId: string, generatedAt: string): LaunchControlSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    launchClearancePercentage: 0,
    officiallyClearedForLaunch: false,
  };
}

export class RuntimeLaunchControlRepository {
  private readonly sessions = new Map<string, LaunchControlSession>();

  getSession(userId: string, generatedAt: string): LaunchControlSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createLaunchControlSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: LaunchControlSession): LaunchControlSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeLaunchControlRepository(): RuntimeLaunchControlRepository {
  return new RuntimeLaunchControlRepository();
}
