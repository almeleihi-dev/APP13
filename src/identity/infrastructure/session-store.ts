import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import type { AppConfig } from "../../shared/config/index.js";
import type { PlatformRole, VerificationTier } from "../domain/user.js";
import type { AccountStatus } from "../domain/user.js";

export interface SessionRecord {
  sessionId: string;
  userId: string;
  roles: PlatformRole[];
  tier: VerificationTier;
  status: AccountStatus;
  customerId: string | null;
  providerId: string | null;
  refreshTokenHash: string;
  createdAt: string;
  expiresAt: string;
}

const PREFIX = {
  session: "app13:session:",
  refresh: "app13:refresh:",
  refreshUsed: "app13:refresh-used:",
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class SessionStore {
  constructor(
    private readonly redis: Redis,
    private readonly config: AppConfig["session"]
  ) {}

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
    const refreshHash = hashToken(refreshToken);
    const now = Date.now();
    const expiresAt = new Date(now + this.config.ttlSeconds * 1000).toISOString();

    const session: SessionRecord = {
      sessionId,
      userId: input.userId,
      roles: input.roles,
      tier: input.tier,
      status: input.status,
      customerId: input.customerId,
      providerId: input.providerId,
      refreshTokenHash: refreshHash,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    };

    const pipeline = this.redis.pipeline();
    pipeline.set(
      `${PREFIX.session}${sessionId}`,
      JSON.stringify(session),
      "EX",
      this.config.ttlSeconds
    );
    pipeline.set(
      `${PREFIX.refresh}${refreshHash}`,
      sessionId,
      "EX",
      this.config.refreshTtlSeconds
    );
    await pipeline.exec();
    return { session, refreshToken };
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const raw = await this.redis.get(`${PREFIX.session}${sessionId}`);
    return raw ? (JSON.parse(raw) as SessionRecord) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    const pipeline = this.redis.pipeline();
    pipeline.del(`${PREFIX.session}${sessionId}`);
    if (session) {
      pipeline.del(`${PREFIX.refresh}${session.refreshTokenHash}`);
    }
    await pipeline.exec();
  }

  /** P0-E4 — rotate refresh token; mark old hash as used */
  async rotateRefreshToken(oldRefreshToken: string): Promise<{
    session: SessionRecord;
    refreshToken: string;
  } | null> {
    const oldHash = hashToken(oldRefreshToken);
    const used = await this.redis.get(`${PREFIX.refreshUsed}${oldHash}`);
    if (used) {
      await this.revokeAllSessionsForUser(used);
      return null;
    }

    const sessionId = await this.redis.get(`${PREFIX.refresh}${oldHash}`);
    if (!sessionId) {
      return null;
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const newRefreshToken = randomBytes(32).toString("base64url");
    const newHash = hashToken(newRefreshToken);
    session.refreshTokenHash = newHash;

    const pipeline = this.redis.pipeline();
    pipeline.set(
      `${PREFIX.session}${sessionId}`,
      JSON.stringify(session),
      "EX",
      this.config.ttlSeconds
    );
    pipeline.del(`${PREFIX.refresh}${oldHash}`);
    pipeline.set(`${PREFIX.refreshUsed}${oldHash}`, session.userId, "EX", 86400);
    pipeline.set(
      `${PREFIX.refresh}${newHash}`,
      sessionId,
      "EX",
      this.config.refreshTtlSeconds
    );
    await pipeline.exec();

    return { session, refreshToken: newRefreshToken };
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    const keys = await this.redis.keys(`${PREFIX.session}*`);
    for (const key of keys) {
      const raw = await this.redis.get(key);
      if (!raw) continue;
      const session = JSON.parse(raw) as SessionRecord;
      if (session.userId === userId) {
        await this.deleteSession(session.sessionId);
      }
    }
  }
}

export function createSessionStore(config: AppConfig): SessionStore {
  const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 3 });
  return new SessionStore(redis, config.session);
}
