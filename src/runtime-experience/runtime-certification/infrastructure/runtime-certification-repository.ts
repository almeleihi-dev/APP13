export interface CertificationSession {
  userId: string;
  generatedAt: string;
  lastRefreshedAt: string;
  authorityStatus: string;
  certificationPercentage: number;
  readyForProductionApproval: boolean;
}

export function createCertificationSession(userId: string, generatedAt: string): CertificationSession {
  return {
    userId,
    generatedAt,
    lastRefreshedAt: generatedAt,
    authorityStatus: "pending",
    certificationPercentage: 0,
    readyForProductionApproval: false,
  };
}

export class RuntimeCertificationRepository {
  private readonly sessions = new Map<string, CertificationSession>();

  getSession(userId: string, generatedAt: string): CertificationSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createCertificationSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: CertificationSession): CertificationSession {
    this.sessions.set(session.userId, { ...session });
    return this.getSession(session.userId, session.generatedAt);
  }
}

export function createRuntimeCertificationRepository(): RuntimeCertificationRepository {
  return new RuntimeCertificationRepository();
}
