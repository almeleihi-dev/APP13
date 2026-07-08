import type { AppConfig } from "../shared/config/index.js";
import type { DbPool } from "../shared/db/index.js";
import type { AuthService, AuthTokens, RegistrationService } from "../identity/application/auth-service.js";
import type { User } from "../identity/domain/user.js";
import { IdentityRepository } from "../identity/infrastructure/identity-repository.js";
import type { SecurityAuditService } from "./audit-service.js";
import type { SecurityRole } from "./types.js";
import { SessionRecordRepository } from "./infrastructure/session-record-repository.js";
import { RefreshTokenRecordRepository } from "./infrastructure/session-record-repository.js";
import { UserRoleRepository } from "./infrastructure/user-role-repository.js";
import type { JwtService } from "../identity/infrastructure/jwt-service.js";
import type { SessionStore } from "../identity/infrastructure/session-store.js";
import { AppError, ErrorCodes, problem } from "../shared/errors/index.js";

export interface SecurityRequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  role: "customer" | "provider";
  businessName?: string;
  primaryTrade?: string;
}

export interface AuthMeResponse {
  user_id: string;
  email: string;
  role: SecurityRole;
  roles: string[];
  session_id: string;
}

function primaryRoleForUser(user: User): SecurityRole {
  if (user.role === "admin") return "admin";
  if (user.role === "provider") return "provider";
  return "customer";
}

export class SecurityAuthKernelService {
  constructor(
    private readonly db: DbPool,
    private readonly config: AppConfig,
    private readonly auth: AuthService,
    private readonly registration: RegistrationService,
    private readonly identityRepo: IdentityRepository,
    private readonly jwt: JwtService,
    private readonly sessions: SessionStore,
    private readonly audit: SecurityAuditService,
    private readonly sessionRecords: SessionRecordRepository,
    private readonly refreshRecords: RefreshTokenRecordRepository,
    private readonly userRoles: UserRoleRepository
  ) {}

  async register(input: RegisterInput, meta: SecurityRequestMeta = {}): Promise<AuthTokens> {
    const tokens =
      input.role === "provider"
        ? await this.registration.registerProvider({
            email: input.email,
            password: input.password,
            displayName: input.displayName,
            businessName: input.businessName ?? input.displayName,
            primaryTrade: input.primaryTrade ?? "general",
          })
        : await this.registration.registerCustomer({
            email: input.email,
            password: input.password,
            displayName: input.displayName,
          });

    const claims = await this.jwt.verifyAccessToken(tokens.access_token);
    const user = await this.identityRepo.findUserById(this.db.pool, claims.sub);
    if (user) {
      await this.persistSecurityArtifacts(user, claims.session_id, tokens.refresh_token, meta);
      await this.audit.log({
        userId: user.id,
        action: "create",
        entityType: "user",
        entityId: user.id,
        ipAddress: meta.ipAddress,
        metadata: { event: "register", role: primaryRoleForUser(user) },
      });
    }

    return tokens;
  }

  async login(
    email: string,
    password: string,
    meta: SecurityRequestMeta = {}
  ): Promise<AuthTokens> {
    const tokens = await this.auth.login(email, password);
    const claims = await this.jwt.verifyAccessToken(tokens.access_token);
    const user = await this.identityRepo.findUserById(this.db.pool, claims.sub);
    if (user) {
      await this.persistSecurityArtifacts(user, claims.session_id, tokens.refresh_token, meta);
      await this.audit.log({
        userId: user.id,
        action: "login",
        entityType: "session",
        entityId: claims.session_id,
        ipAddress: meta.ipAddress,
      });
    }
    return tokens;
  }

  async refresh(refreshToken: string, meta: SecurityRequestMeta = {}): Promise<AuthTokens> {
    await this.refreshRecords.revokeByToken(refreshToken);
    const tokens = await this.auth.refresh(refreshToken);
    const claims = await this.jwt.verifyAccessToken(tokens.access_token);
    const user = await this.identityRepo.findUserById(this.db.pool, claims.sub);
    if (user) {
      const expiresAt = new Date(Date.now() + this.config.session.refreshTtlSeconds * 1000);
      await this.refreshRecords.create({
        sessionId: claims.session_id,
        userId: user.id,
        token: tokens.refresh_token,
        expiresAt,
        rotatedFromId: null,
      });
      await this.audit.log({
        userId: user.id,
        action: "token_refresh",
        entityType: "session",
        entityId: claims.session_id,
        ipAddress: meta.ipAddress,
      });
    }
    return tokens;
  }

  async logout(sessionId: string, userId: string | null, meta: SecurityRequestMeta = {}): Promise<void> {
    await this.auth.logout(sessionId);
    await this.sessionRecords.revoke(sessionId);
    await this.audit.log({
      userId,
      action: "logout",
      entityType: "session",
      entityId: sessionId,
      ipAddress: meta.ipAddress,
    });
  }

  async me(sessionId: string): Promise<AuthMeResponse> {
    const session = await this.sessions.getSession(sessionId);
    if (!session) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "Session not found",
        })
      );
    }
    const user = await this.identityRepo.findUserById(this.db.pool, session.userId);
    if (!user) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
          detail: "User not found",
        })
      );
    }
    return {
      user_id: user.id,
      email: user.email,
      role: primaryRoleForUser(user),
      roles: session.roles,
      session_id: session.sessionId,
    };
  }

  private async persistSecurityArtifacts(
    user: User,
    sessionId: string,
    refreshToken: string,
    meta: SecurityRequestMeta
  ): Promise<void> {
    const role = primaryRoleForUser(user);
    await this.userRoles.grant(user.id, role);
    const expiresAt = new Date(Date.now() + this.config.session.ttlSeconds * 1000);
    await this.sessionRecords.create({
      id: sessionId,
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    });
    const refreshExpiresAt = new Date(Date.now() + this.config.session.refreshTtlSeconds * 1000);
    await this.refreshRecords.create({
      sessionId,
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
    });
  }
}

export function createSecurityAuthKernelService(deps: {
  db: DbPool;
  config: AppConfig;
  auth: AuthService;
  registration: RegistrationService;
  identityRepo: IdentityRepository;
  jwt: JwtService;
  sessions: SessionStore;
  audit: SecurityAuditService;
}): SecurityAuthKernelService {
  return new SecurityAuthKernelService(
    deps.db,
    deps.config,
    deps.auth,
    deps.registration,
    deps.identityRepo,
    deps.jwt,
    deps.sessions,
    deps.audit,
    new SessionRecordRepository(deps.db),
    new RefreshTokenRecordRepository(deps.db),
    new UserRoleRepository(deps.db)
  );
}
