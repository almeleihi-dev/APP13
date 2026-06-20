import { createHmac, timingSafeEqual } from "node:crypto";
import type { DbPool } from "../../shared/db/index.js";
import type { AppConfig } from "../../shared/config/index.js";
import type { Logger } from "../../shared/logging/index.js";
import { DomainEvents } from "../../shared/events/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { outboxWriter } from "../../platform/outbox/index.js";
import type { User, VerificationTier } from "../domain/index.js";
import {
  IdentityRepository,
  VerificationRepository,
  TokenStore,
  KycSandboxAdapter,
} from "../infrastructure/index.js";

const TIER_ORDER: VerificationTier[] = ["T0", "T1", "T2", "T3", "T4"];

function tierAtLeast(current: VerificationTier, target: VerificationTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(target);
}

export class VerificationService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly verificationRepo: VerificationRepository,
    private readonly tokenStore: TokenStore,
    private readonly kyc: KycSandboxAdapter,
    private readonly config: AppConfig,
    private readonly logger: Logger
  ) {}

  async getMyVerification(userId: string) {
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!user) throw notFound();
    const verification = await this.verificationRepo.findLatestByUserId(
      this.db.pool,
      userId
    );
    return {
      tier: user.verificationTier,
      status: verification?.status ?? "pending",
      t1_completed_at:
        user.verificationTier !== "T0" && verification?.reviewedAt
          ? verification.reviewedAt.toISOString()
          : null,
    };
  }

  async startT1(userId: string, redirectUrl?: string) {
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!user) throw notFound();
    if (tierAtLeast(user.verificationTier, "T1")) {
      throw new AppError(
        problem({
          title: "Unprocessable Entity",
          status: 422,
          code: ErrorCodes.TIER_INSUFFICIENT,
          engine: "identity",
          detail: "T1 verification already completed",
        })
      );
    }

    const verification = await this.db.withTransaction(async (tx) => {
      return this.verificationRepo.createVerification(tx, {
        userId,
        tier: "T1",
        status: "submitted",
        metadata: { redirectUrl },
      });
    });

    const { sessionId, kycUrl, expiresAt } = this.kyc.createSession({
      userId,
      verificationId: verification.id,
      redirectUrl,
    });

    await this.tokenStore.saveKycSession(sessionId, {
      userId,
      verificationId: verification.id,
    });

    return { session_id: sessionId, kyc_url: kycUrl, expires_at: expiresAt };
  }

  async completeT1(userId: string, sessionId: string) {
    const kycSession = await this.tokenStore.getKycSession(sessionId);
    if (!kycSession || kycSession.userId !== userId) {
      throw new AppError(
        problem({
          title: "Unprocessable Entity",
          status: 422,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "identity",
          detail: "Invalid KYC session",
        })
      );
    }
    return this.getMyVerification(userId);
  }

  verifyWebhookSignature(body: string, signature: string | undefined): void {
    if (!signature) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Missing KYC webhook signature",
        })
      );
    }
    const expected = createHmac("sha256", this.config.kyc.webhookSecret)
      .update(body)
      .digest("hex");
    const provided = signature.replace(/^sha256=/, "");
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Invalid KYC webhook signature",
        })
      );
    }
  }

  async handleT1Webhook(payload: {
    session_id: string;
    result: "approved" | "rejected" | "expired";
    idempotency_key: string;
  }) {
    const kycSession = await this.tokenStore.getKycSession(payload.session_id);
    if (!kycSession) {
      this.logger.warn({ sessionId: payload.session_id }, "unknown KYC session");
      return;
    }

    const userId = kycSession.userId as string;
    const verificationId = kycSession.verificationId as string;

    await this.db.withTransaction(async (tx) => {
      if (payload.result === "approved") {
        await this.verificationRepo.updateStatus(tx, verificationId, "approved");
        const user = await this.identityRepo.setVerificationTier(tx, userId, "T1");
        await this.emitVerificationApproved(tx, user, payload.idempotency_key);
      } else if (payload.result === "rejected") {
        await this.verificationRepo.updateStatus(tx, verificationId, "rejected", {
          rejectionReason: "KYC provider rejected",
        });
      } else {
        await this.verificationRepo.updateStatus(tx, verificationId, "expired");
      }
    });

    await this.tokenStore.deleteKycSession(payload.session_id);
  }

  private async emitVerificationApproved(
    tx: Parameters<Parameters<DbPool["withTransaction"]>[0]>[0],
    user: User,
    idempotencyKey: string
  ): Promise<void> {
    await outboxWriter.write(tx, {
      eventType: DomainEvents.VERIFICATION_APPROVED,
      payload: {
        user_id: user.id,
        tier: "T1",
      },
      engineSource: "identity",
      idempotencyKey,
    });
  }

  async createCredential(
    userId: string,
    input: {
      credential_type: string;
      issuer: string;
      credential_number?: string;
      expires_at?: string | null;
    }
  ) {
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    if (!provider) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "identity",
          detail: "Only providers may submit credentials",
        })
      );
    }
    const credential = await this.verificationRepo.createCredential(this.db.pool, {
      providerId: provider.id,
      credentialType: input.credential_type,
      credentialName: input.credential_type,
      issuingAuthority: input.issuer,
      credentialNumber: input.credential_number,
      expiresAt: input.expires_at ? new Date(input.expires_at) : null,
    });
    return {
      id: credential.id,
      credential_type: credential.credentialType,
      issuer: credential.issuingAuthority,
      status: credential.status,
    };
  }

  async listMyCredentials(userId: string) {
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    if (!provider) {
      return { data: [], meta: { has_more: false } };
    }
    const credentials = await this.verificationRepo.listCredentialsByProviderId(
      this.db.pool,
      provider.id
    );
    return {
      data: credentials.map((c) => ({
        id: c.id,
        credential_type: c.credentialType,
        issuer: c.issuingAuthority,
        status: c.status,
      })),
      meta: { has_more: false },
    };
  }
}

export function createVerificationService(deps: {
  db: DbPool;
  identityRepo: IdentityRepository;
  verificationRepo: VerificationRepository;
  tokenStore: TokenStore;
  kyc: KycSandboxAdapter;
  config: AppConfig;
  logger: Logger;
}): VerificationService {
  return new VerificationService(
    deps.db,
    deps.identityRepo,
    deps.verificationRepo,
    deps.tokenStore,
    deps.kyc,
    deps.config,
    deps.logger
  );
}
