import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { SignJWT } from "jose";
import { createSecretKey } from "node:crypto";
import { JwtService } from "../src/identity/infrastructure/jwt-service.js";
import { SecurityAuthKernelService } from "../src/security/auth-kernel-service.js";
import { AuditLogRepository } from "../src/security/infrastructure/audit-log-repository.js";
import { SecurityAuditService } from "../src/security/audit-service.js";
import { registerSecurityAuthRoutes } from "../src/api/routes/security-auth.js";
import { createAuthenticateMiddleware } from "../src/api/middleware/authenticate.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { errorHandler } from "../src/api/middleware/request.js";
import type { AuthService, AuthTokens } from "../src/identity/application/auth-service.js";
import type { RegistrationService } from "../src/identity/application/auth-service.js";
import type { User } from "../src/identity/domain/user.js";
import {
  createMockDb,
  createTestConfig,
  InMemorySessionStore,
} from "./helpers/b8-security-harness.js";
import { AppError } from "../src/shared/errors/index.js";

const testUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  phone: null,
  passwordHash: "hash",
  role: "customer",
  status: "active",
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  verificationTier: "T0",
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

function sampleTokens(accessToken: string, refreshToken = "refresh-token"): AuthTokens {
  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 900,
    refresh_token: refreshToken,
  };
}

describe("B8 authentication", () => {
  it("JWT access token includes sub, role, and sessionId claims", async () => {
    const config = createTestConfig();
    const jwt = new JwtService(config.jwt);
    const token = await jwt.signAccessToken({
      sub: testUser.id,
      roles: ["customer"],
      tier: "T0",
      session_id: "session-123",
    });
    const claims = await jwt.verifyAccessToken(token);
    assert.equal(claims.sub, testUser.id);
    assert.equal(claims.role, "customer");
    assert.equal(claims.sessionId, "session-123");
    assert.equal(claims.session_id, "session-123");
  });

  it("register success returns tokens", async () => {
    const config = createTestConfig();
    const db = createMockDb();
    const jwt = new JwtService(config.jwt);
    const sessions = new InMemorySessionStore(config.session);
    const { session, refreshToken } = await sessions.createSession({
      userId: testUser.id,
      roles: ["customer"],
      tier: "T0",
      status: "active",
      customerId: "cust-1",
      providerId: null,
    });
    const accessToken = await jwt.signAccessToken({
      sub: testUser.id,
      roles: ["customer"],
      tier: "T0",
      session_id: session.sessionId,
    });

    const registration = {
      registerCustomer: mock.fn(async () => sampleTokens(accessToken, refreshToken)),
      registerProvider: mock.fn(async () => sampleTokens(accessToken, refreshToken)),
    } as unknown as RegistrationService;

    const auth = {
      login: mock.fn(),
      refresh: mock.fn(),
      logout: mock.fn(),
    } as unknown as AuthService;

    const audit = new SecurityAuditService(new AuditLogRepository(db as never));
    const kernel = new SecurityAuthKernelService(
      db as never,
      config,
      auth,
      registration,
      { findUserById: async () => testUser } as never,
      jwt,
      sessions as never,
      audit,
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-1", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => ["customer"] } as never
    );

    const tokens = await kernel.register({
      email: "user@example.com",
      password: "securepassword123",
      displayName: "Test User",
      role: "customer",
    });
    assert.equal(tokens.token_type, "Bearer");
    assert.ok(tokens.access_token);
    assert.ok(tokens.refresh_token);
  });

  it("login success returns tokens and writes audit log", async () => {
    const config = createTestConfig();
    const db = createMockDb();
    const jwt = new JwtService(config.jwt);
    const sessions = new InMemorySessionStore(config.session);
    const { session, refreshToken } = await sessions.createSession({
      userId: testUser.id,
      roles: ["customer"],
      tier: "T0",
      status: "active",
      customerId: "cust-1",
      providerId: null,
    });
    const accessToken = await jwt.signAccessToken({
      sub: testUser.id,
      roles: ["customer"],
      tier: "T0",
      session_id: session.sessionId,
    });

    const auth = {
      login: mock.fn(async () => sampleTokens(accessToken, refreshToken)),
      refresh: mock.fn(),
      logout: mock.fn(),
    } as unknown as AuthService;

    const audit = new SecurityAuditService(new AuditLogRepository(db as never));
    const kernel = new SecurityAuthKernelService(
      db as never,
      config,
      auth,
      {} as RegistrationService,
      { findUserById: async () => testUser } as never,
      jwt,
      sessions as never,
      audit,
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-1", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => ["customer"] } as never
    );

    const tokens = await kernel.login("user@example.com", "securepassword123");
    assert.ok(tokens.access_token);
    assert.equal(db.auditRows.some((row) => row.action === "login"), true);
  });

  it("login failure rejects invalid credentials", async () => {
    const config = createTestConfig();
    const auth = {
      login: mock.fn(async () => {
        const { AppError, ErrorCodes, problem } = await import("../src/shared/errors/index.js");
        throw new AppError(
          problem({
            title: "Unauthorized",
            status: 401,
            code: ErrorCodes.UNAUTHORIZED,
            engine: "identity",
            detail: "Invalid email or password",
          })
        );
      }),
    } as unknown as AuthService;

    const kernel = new SecurityAuthKernelService(
      createMockDb() as never,
      config,
      auth,
      {} as RegistrationService,
      {} as never,
      new JwtService(config.jwt),
      new InMemorySessionStore(config.session) as never,
      new SecurityAuditService(new AuditLogRepository(createMockDb() as never)),
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-1", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => [] } as never
    );

    await assert.rejects(() => kernel.login("bad@example.com", "wrong"), (error: unknown) => {
      return error instanceof AppError && error.problem.status === 401;
    });
  });

  it("rejects expired access token", async () => {
    const secret = createSecretKey(
      Buffer.from("test-jwt-secret-minimum-32-characters-long", "utf8")
    );
    const expired = await new SignJWT({
      role: "customer",
      roles: ["customer"],
      tier: "T0",
      session_id: "session-expired",
      sessionId: "session-expired",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(testUser.id)
      .setIssuer("app13")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
      .sign(secret);

    const jwt = new JwtService(createTestConfig().jwt);
    await assert.rejects(() => jwt.verifyAccessToken(expired));
  });

  it("refresh token rotation returns new tokens", async () => {
    const config = createTestConfig();
    const db = createMockDb();
    const jwt = new JwtService(config.jwt);
    const sessions = new InMemorySessionStore(config.session);
    const { session, refreshToken } = await sessions.createSession({
      userId: testUser.id,
      roles: ["customer"],
      tier: "T0",
      status: "active",
      customerId: "cust-1",
      providerId: null,
    });
    const accessToken = await jwt.signAccessToken({
      sub: testUser.id,
      roles: ["customer"],
      tier: "T0",
      session_id: session.sessionId,
    });

    const auth = {
      refresh: mock.fn(async () =>
        sampleTokens(accessToken, "rotated-refresh-token")
      ),
      login: mock.fn(),
      logout: mock.fn(),
    } as unknown as AuthService;

    const audit = new SecurityAuditService(new AuditLogRepository(db as never));
    const kernel = new SecurityAuthKernelService(
      db as never,
      config,
      auth,
      {} as RegistrationService,
      { findUserById: async () => testUser } as never,
      jwt,
      sessions as never,
      audit,
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-2", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => ["customer"] } as never
    );

    const tokens = await kernel.refresh(refreshToken);
    assert.equal(tokens.refresh_token, "rotated-refresh-token");
    assert.equal(db.auditRows.some((row) => row.action === "token_refresh"), true);
  });

  it("logout invalidates session", async () => {
    const config = createTestConfig();
    const db = createMockDb();
    const sessions = new InMemorySessionStore(config.session);
    const { session } = await sessions.createSession({
      userId: testUser.id,
      roles: ["customer"],
      tier: "T0",
      status: "active",
      customerId: "cust-1",
      providerId: null,
    });

    const auth = {
      logout: mock.fn(async (sessionId: string) => {
        await sessions.deleteSession(sessionId);
      }),
      login: mock.fn(),
      refresh: mock.fn(),
    } as unknown as AuthService;

    const audit = new SecurityAuditService(new AuditLogRepository(db as never));
    const kernel = new SecurityAuthKernelService(
      db as never,
      config,
      auth,
      {} as RegistrationService,
      { findUserById: async () => testUser } as never,
      new JwtService(config.jwt),
      sessions as never,
      audit,
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-1", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => ["customer"] } as never
    );

    await kernel.logout(session.sessionId, testUser.id);
    assert.equal(await sessions.getSession(session.sessionId), null);
    assert.equal(db.auditRows.some((row) => row.action === "logout"), true);
  });

  it("GET /auth/me returns current user profile", async () => {
    const config = createTestConfig();
    const db = createMockDb();
    const jwt = new JwtService(config.jwt);
    const sessions = new InMemorySessionStore(config.session);
    const { session, refreshToken } = await sessions.createSession({
      userId: testUser.id,
      roles: ["customer"],
      tier: "T0",
      status: "active",
      customerId: "cust-1",
      providerId: null,
    });
    const accessToken = await jwt.signAccessToken({
      sub: testUser.id,
      roles: ["customer"],
      tier: "T0",
      session_id: session.sessionId,
    });

    const kernel = new SecurityAuthKernelService(
      db as never,
      config,
      {} as AuthService,
      {} as RegistrationService,
      { findUserById: async () => testUser } as never,
      jwt,
      sessions as never,
      new SecurityAuditService(new AuditLogRepository(db as never)),
      { create: async () => undefined, revoke: async () => undefined } as never,
      { create: async () => "rt-1", revokeByToken: async () => undefined } as never,
      { grant: async () => undefined, listActive: async () => ["customer"] } as never
    );

    const app = Fastify({ logger: false });
    app.decorateRequest("authContext", null);
    app.addHook(
      "preHandler",
      createAuthenticateMiddleware({ jwt, sessions: sessions as never, config })
    );
    app.addHook("preHandler", requireAuthMiddleware);
    app.setErrorHandler(errorHandler);
    await registerSecurityAuthRoutes(app, { securityAuth: kernel });

    const response = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(response.statusCode, 200);
    const body = response.json() as { user_id: string; role: string; session_id: string };
    assert.equal(body.user_id, testUser.id);
    assert.equal(body.role, "customer");
    assert.equal(body.session_id, session.sessionId);
    assert.ok(refreshToken);
  });
});
