import { randomBytes } from "node:crypto";
import { Redis } from "ioredis";
import type { AppConfig } from "../../shared/config/index.js";

const PREFIX = {
  emailVerify: "app13:email-verify:",
  passwordReset: "app13:password-reset:",
  phoneOtp: "app13:phone-otp:",
  kycSession: "app13:kyc-session:",
};

export class TokenStore {
  constructor(private readonly redis: Redis) {}

  async createEmailVerificationToken(userId: string, ttlSeconds = 86400): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await this.redis.set(`${PREFIX.emailVerify}${token}`, userId, "EX", ttlSeconds);
    return token;
  }

  async consumeEmailVerificationToken(token: string): Promise<string | null> {
    const key = `${PREFIX.emailVerify}${token}`;
    const userId = await this.redis.get(key);
    if (userId) {
      await this.redis.del(key);
    }
    return userId;
  }

  async createPasswordResetToken(userId: string, ttlSeconds = 3600): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await this.redis.set(`${PREFIX.passwordReset}${token}`, userId, "EX", ttlSeconds);
    return token;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const key = `${PREFIX.passwordReset}${token}`;
    const userId = await this.redis.get(key);
    if (userId) {
      await this.redis.del(key);
    }
    return userId;
  }

  async setPhoneOtp(userId: string, phone: string, otp: string, ttlSeconds = 600): Promise<void> {
    await this.redis.set(
      `${PREFIX.phoneOtp}${userId}`,
      JSON.stringify({ phone, otp }),
      "EX",
      ttlSeconds
    );
  }

  async verifyPhoneOtp(
    userId: string,
    otp: string
  ): Promise<{ phone: string } | null> {
    const key = `${PREFIX.phoneOtp}${userId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { phone: string; otp: string };
    if (parsed.otp !== otp) return null;
    await this.redis.del(key);
    return { phone: parsed.phone };
  }

  async saveKycSession(
    sessionId: string,
    payload: Record<string, unknown>,
    ttlSeconds = 3600
  ): Promise<void> {
    await this.redis.set(
      `${PREFIX.kycSession}${sessionId}`,
      JSON.stringify(payload),
      "EX",
      ttlSeconds
    );
  }

  async getKycSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const raw = await this.redis.get(`${PREFIX.kycSession}${sessionId}`);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }

  async deleteKycSession(sessionId: string): Promise<void> {
    await this.redis.del(`${PREFIX.kycSession}${sessionId}`);
  }
}

export function createTokenStore(config: AppConfig): TokenStore {
  const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 3 });
  return new TokenStore(redis);
}
