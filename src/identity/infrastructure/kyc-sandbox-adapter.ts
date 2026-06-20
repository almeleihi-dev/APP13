import { randomUUID } from "node:crypto";
import type { AppConfig } from "../../shared/config/index.js";
import type { Logger } from "../../shared/logging/index.js";

/** Sandbox KYC adapter — B3.7 local stub */
export class KycSandboxAdapter {
  constructor(
    private readonly config: AppConfig["kyc"],
    private readonly logger: Logger
  ) {}

  createSession(input: {
    userId: string;
    verificationId: string;
    redirectUrl?: string;
  }): { sessionId: string; kycUrl: string; expiresAt: string } {
    const sessionId = randomUUID();
    const kycUrl = `${this.config.sandboxBaseUrl}/verify/${sessionId}?redirect=${encodeURIComponent(input.redirectUrl ?? "")}`;
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    this.logger.info(
      { userId: input.userId, verificationId: input.verificationId, sessionId },
      "KYC sandbox session created"
    );
    return { sessionId, kycUrl, expiresAt };
  }
}

export function createKycSandboxAdapter(
  config: AppConfig,
  logger: Logger
): KycSandboxAdapter {
  return new KycSandboxAdapter(config.kyc, logger);
}
