export interface OperationsCenterSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  operationalCount: number;
  alertCount: number;
  productionApproved: boolean;
}

export function createOperationsCenterSession(userId: string, generatedAt: string): OperationsCenterSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "unknown",
    operationalCount: 0,
    alertCount: 0,
    productionApproved: false,
  };
}

export class RuntimeOperationsCenterRepository {
  private readonly sessions = new Map<string, OperationsCenterSession>();

  getSession(userId: string, generatedAt: string): OperationsCenterSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createOperationsCenterSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: OperationsCenterSession): OperationsCenterSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeOperationsCenterRepository(): RuntimeOperationsCenterRepository {
  return new RuntimeOperationsCenterRepository();
}
