import { randomBytes, randomUUID } from "node:crypto";
import type { AppConfig } from "../../src/shared/config/index.js";
import type {
  AccountStatus,
  PlatformRole,
  VerificationTier,
} from "../../src/identity/domain/user.js";
import type { SessionRecord } from "../../src/identity/infrastructure/session-store.js";

export class InMemorySessionStore {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly refreshToSession = new Map<string, string>();
  private readonly usedRefresh = new Set<string>();

  constructor(private readonly config: AppConfig["session"]) {}

  async createSession(input: {
    userId: string;
    roles: PlatformRole[];
    tier: VerificationTier;
    status: AccountStatus;
    customerId: string | null;
    providerId: string | null;
  }): Promise<{ session: SessionRecord; refreshToken: string }> {
    const sessionId = randomUUID();
    const refreshToken = randomBytes(32).toString("base64url");
    const now = Date.now();
    const session: SessionRecord = {
      sessionId,
      userId: input.userId,
      roles: input.roles,
      tier: input.tier,
      status: input.status,
      customerId: input.customerId,
      providerId: input.providerId,
      refreshTokenHash: refreshToken,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + this.config.ttlSeconds * 1000).toISOString(),
    };
    this.sessions.set(sessionId, session);
    this.refreshToSession.set(refreshToken, sessionId);
    return { session, refreshToken };
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    this.sessions.delete(sessionId);
    if (session) {
      this.refreshToSession.delete(session.refreshTokenHash);
    }
  }

  async rotateRefreshToken(oldRefreshToken: string): Promise<{
    session: SessionRecord;
    refreshToken: string;
  } | null> {
    if (this.usedRefresh.has(oldRefreshToken)) {
      return null;
    }
    const sessionId = this.refreshToSession.get(oldRefreshToken);
    if (!sessionId) {
      return null;
    }
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    this.usedRefresh.add(oldRefreshToken);
    this.refreshToSession.delete(oldRefreshToken);
    const refreshToken = randomBytes(32).toString("base64url");
    session.refreshTokenHash = refreshToken;
    this.sessions.set(sessionId, session);
    this.refreshToSession.set(refreshToken, sessionId);
    return { session, refreshToken };
  }

  async revokeAllSessionsForUser(_userId: string): Promise<void> {
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === _userId) {
        await this.deleteSession(id);
      }
    }
  }
}

export function createTestConfig(overrides?: Partial<AppConfig>): AppConfig {
  return {
    env: "local",
    serviceId: "app13-test",
    host: "127.0.0.1",
    port: 0,
    logLevel: "error",
    logPretty: false,
    databaseUrl: "postgres://app13:app13@127.0.0.1:5432/app13",
    redisUrl: "redis://localhost:6379",
    s3: {
      bucket: "app13-evidence",
      region: "us-east-1",
      endpoint: "http://127.0.0.1:9000",
      accessKey: "app13",
      secretKey: "app13secret",
    },
    idempotencyTtlSeconds: 86400,
    jwt: {
      secret: "test-jwt-secret-minimum-32-characters-long",
      accessTtlSeconds: 900,
      issuer: "app13",
    },
    session: {
      cookieName: "app13_session",
      ttlSeconds: 604800,
      refreshTtlSeconds: 604800,
    },
    kyc: {
      webhookSecret: "local-kyc-webhook-secret",
      sandboxBaseUrl: "https://sandbox.kyc.app13.local",
    },
    ...overrides,
  };
}

export function createMockDb() {
  const auditRows: Array<Record<string, unknown>> = [];
  const query = async (sql: string, params?: unknown[]) => {
    if (sql.includes("INSERT INTO identity.audit_logs")) {
      const row = {
        id: randomUUID(),
        user_id: params?.[0] ?? null,
        action: params?.[1],
        entity_type: params?.[2],
        entity_id: params?.[3],
        metadata:
          typeof params?.[4] === "string"
            ? JSON.parse(params[4] as string)
            : ((params?.[4] as Record<string, unknown>) ?? {}),
        ip_address: params?.[5] ?? null,
        created_at: new Date(),
      };
      auditRows.push(row);
      return { rows: [row], rowCount: 1 };
    }
    if (sql.includes("SELECT") && sql.includes("identity.audit_logs")) {
      const userId = params?.[0];
      const rows = auditRows.filter((row) => row.user_id === userId);
      return { rows, rowCount: rows.length };
    }
    return { rows: [{ id: randomUUID() }], rowCount: 1 };
  };
  return {
    pool: {},
    query,
    withTransaction: async <T>(fn: (tx: { query: typeof query }) => Promise<T>) =>
      fn({ query }),
    auditRows,
  };
}
