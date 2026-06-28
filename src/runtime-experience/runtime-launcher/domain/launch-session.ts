export interface LaunchSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  activeModeId?: string;
  evaluatedChecks: number;
  passedChecks: number;
  mvpReadinessPercentage: number;
}

export function createLaunchSession(userId: string, generatedAt: string): LaunchSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    evaluatedChecks: 0,
    passedChecks: 0,
    mvpReadinessPercentage: 0,
  };
}
