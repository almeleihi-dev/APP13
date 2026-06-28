export interface ProductionApprovalSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  overallStatus: string;
  approvalPercentage: number;
  officiallyApprovedForProduction: boolean;
}

export function createProductionApprovalSession(userId: string, generatedAt: string): ProductionApprovalSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    overallStatus: "pending",
    approvalPercentage: 0,
    officiallyApprovedForProduction: false,
  };
}

export class RuntimeProductionApprovalRepository {
  private readonly sessions = new Map<string, ProductionApprovalSession>();

  getSession(userId: string, generatedAt: string): ProductionApprovalSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createProductionApprovalSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: ProductionApprovalSession): ProductionApprovalSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeProductionApprovalRepository(): RuntimeProductionApprovalRepository {
  return new RuntimeProductionApprovalRepository();
}
