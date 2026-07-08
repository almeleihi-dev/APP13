export interface OperationsSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  operationalCount: number;
  alertCount: number;
}

export function createOperationsSession(userId: string, generatedAt: string): OperationsSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    operationalCount: 0,
    alertCount: 0,
  };
}

export class RuntimeOperationsRepository {
  private readonly sessions = new Map<string, OperationsSession>();

  getSession(userId: string, generatedAt: string): OperationsSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createOperationsSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: OperationsSession): OperationsSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeOperationsRepository(): RuntimeOperationsRepository {
  return new RuntimeOperationsRepository();
}
