import { randomBytes } from "node:crypto";
import type { DbPool } from "../../shared/db/index.js";
import type { AppConfig } from "../../shared/config/index.js";
import type { Logger } from "../../shared/logging/index.js";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import { platformRolesForUser, validatePassword } from "../domain/index.js";
import {
  IdentityRepository,
  hashPassword,
  verifyPassword,
  JwtService,
  SessionStore,
  TokenStore,
} from "../infrastructure/index.js";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "provider"}-${randomBytes(3).toString("hex")}`;
}

export class RegistrationService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly auth: AuthService,
    private readonly tokenStore: TokenStore,
    private readonly logger: Logger
  ) {}

  async registerCustomer(input: {
    email: string;
    password: string;
    displayName: string;
  }) {
    validatePassword(input.password);
    return this.db.withTransaction(async (tx) => {
      const existing = await this.identityRepo.findUserByEmail(tx, input.email);
      if (existing) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "identity",
            detail: "Email already registered",
          })
        );
      }
      const passwordHash = await hashPassword(input.password);
      const user = await this.identityRepo.createUser(tx, {
        email: input.email,
        passwordHash,
        role: "customer",
      });
      const customer = await this.identityRepo.createCustomer(tx, {
        userId: user.id,
        displayName: input.displayName,
      });
      const verifyToken = await this.tokenStore.createEmailVerificationToken(user.id);
      this.logger.info({ userId: user.id, verifyToken }, "email verification token (dev)");
      return this.auth.issueTokensForUser(user, customer.id, null);
    });
  }

  async registerProvider(input: {
    email: string;
    password: string;
    displayName: string;
    businessName: string;
    primaryTrade: string;
  }) {
    validatePassword(input.password);
    return this.db.withTransaction(async (tx) => {
      const existing = await this.identityRepo.findUserByEmail(tx, input.email);
      if (existing) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "identity",
            detail: "Email already registered",
          })
        );
      }
      const passwordHash = await hashPassword(input.password);
      const user = await this.identityRepo.createUser(tx, {
        email: input.email,
        passwordHash,
        role: "provider",
      });
      const provider = await this.identityRepo.createProvider(tx, {
        userId: user.id,
        displayName: input.displayName,
        businessName: input.businessName,
        primaryTrade: input.primaryTrade,
        slug: slugify(input.displayName),
      });
      const verifyToken = await this.tokenStore.createEmailVerificationToken(user.id);
      this.logger.info({ userId: user.id, verifyToken }, "email verification token (dev)");
      return this.auth.issueTokensForUser(user, null, provider.id);
    });
  }
}

export interface AuthTokens {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
}

export class AuthService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly jwt: JwtService,
    private readonly sessions: SessionStore,
    private readonly tokenStore: TokenStore,
    private readonly config: AppConfig,
    private readonly logger: Logger
  ) {}

  async issueTokensForUser(
    user: NonNullable<Awaited<ReturnType<IdentityRepository["findUserById"]>>>,
    customerId: string | null,
    providerId: string | null
  ): Promise<AuthTokens> {
    const roles = platformRolesForUser(user);
    const { session, refreshToken } = await this.sessions.createSession({
      userId: user.id,
      roles,
      tier: user.verificationTier,
      status: user.status,
      customerId,
      providerId,
    });
    const accessToken = await this.jwt.signAccessToken({
      sub: user.id,
      roles,
      tier: user.verificationTier,
      session_id: session.sessionId,
    });
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: this.config.jwt.accessTtlSeconds,
      refresh_token: refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.identityRepo.findUserByEmail(this.db.pool, email);
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Invalid email or password",
        })
      );
    }
    if (user.status !== "active") {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.ACCOUNT_SUSPENDED,
          engine: "identity",
          detail: "Account is not active",
        })
      );
    }
    await this.identityRepo.updateLastLogin(this.db.pool, user.id);
    const customer = await this.identityRepo.findCustomerByUserId(this.db.pool, user.id);
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, user.id);
    return this.issueTokensForUser(
      user,
      customer?.id ?? null,
      provider?.id ?? null
    );
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const rotated = await this.sessions.rotateRefreshToken(refreshToken);
    if (!rotated) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Invalid or reused refresh token",
        })
      );
    }
    const user = await this.identityRepo.findUserById(
      this.db.pool,
      rotated.session.userId
    );
    if (!user || user.status !== "active") {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Session invalid",
        })
      );
    }
    const accessToken = await this.jwt.signAccessToken({
      sub: user.id,
      roles: rotated.session.roles,
      tier: user.verificationTier,
      session_id: rotated.session.sessionId,
    });
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: this.config.jwt.accessTtlSeconds,
      refresh_token: rotated.refreshToken,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.deleteSession(sessionId);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.identityRepo.findUserByEmail(this.db.pool, email);
    if (user) {
      const token = await this.tokenStore.createPasswordResetToken(user.id);
      this.logger.info({ userId: user.id, token }, "password reset token (dev)");
    }
  }

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    validatePassword(password);
    const userId = await this.tokenStore.consumePasswordResetToken(token);
    if (!userId) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "identity",
          detail: "Invalid or expired reset token",
        })
      );
    }
    const passwordHash = await hashPassword(password);
    await this.identityRepo.updatePasswordHash(this.db.pool, userId, passwordHash);
    await this.sessions.revokeAllSessionsForUser(userId);
  }

  async requestEmailVerification(userId: string): Promise<void> {
    const token = await this.tokenStore.createEmailVerificationToken(userId);
    this.logger.info({ userId, token }, "email verification token (dev)");
  }

  async confirmEmailVerification(token: string): Promise<void> {
    const userId = await this.tokenStore.consumeEmailVerificationToken(token);
    if (!userId) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "identity",
          detail: "Invalid or expired verification token",
        })
      );
    }
    await this.identityRepo.setEmailVerified(this.db.pool, userId);
  }

  async requestPhoneVerification(userId: string, phone: string): Promise<void> {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await this.tokenStore.setPhoneOtp(userId, phone, otp);
    this.logger.info({ userId, phone, otp }, "phone OTP (dev)");
  }

  async confirmPhoneVerification(userId: string, otp: string): Promise<void> {
    const result = await this.tokenStore.verifyPhoneOtp(userId, otp);
    if (!result) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "identity",
          detail: "Invalid or expired OTP",
        })
      );
    }
    await this.identityRepo.setPhoneVerified(this.db.pool, userId, result.phone);
  }
}

export function createAuthService(deps: {
  db: DbPool;
  identityRepo: IdentityRepository;
  jwt: JwtService;
  sessions: SessionStore;
  tokenStore: TokenStore;
  config: AppConfig;
  logger: Logger;
}): AuthService {
  return new AuthService(
    deps.db,
    deps.identityRepo,
    deps.jwt,
    deps.sessions,
    deps.tokenStore,
    deps.config,
    deps.logger
  );
}

export function createRegistrationService(deps: {
  db: DbPool;
  identityRepo: IdentityRepository;
  auth: AuthService;
  tokenStore: TokenStore;
  logger: Logger;
}): RegistrationService {
  return new RegistrationService(
    deps.db,
    deps.identityRepo,
    deps.auth,
    deps.tokenStore,
    deps.logger
  );
}
