import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { requireAuth, requireRole } from "../src/security/guards.js";
import { createAuthorizeRolesMiddleware } from "../src/security/middleware/authorize-roles.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { errorHandler } from "../src/api/middleware/request.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { AppError } from "../src/shared/errors/index.js";

const customerContext: AuthContext = {
  userId: "11111111-1111-4111-8111-111111111111",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "session-customer",
};

const providerContext: AuthContext = {
  userId: "22222222-2222-4222-8222-222222222222",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "session-provider",
};

const adminContext: AuthContext = {
  userId: "33333333-3333-4333-8333-333333333333",
  roles: ["platform_admin"],
  tier: "T3",
  status: "active",
  sessionId: "session-admin",
};

describe("B8 authorization guards", () => {
  it("requireAuth rejects missing context", () => {
    assert.throws(() => requireAuth(null), (error: unknown) => {
      return error instanceof AppError && error.problem.status === 401;
    });
  });

  it("requireAuth accepts valid context", () => {
    assert.doesNotThrow(() => requireAuth(customerContext));
  });

  it("requireRole allows matching role", () => {
    assert.doesNotThrow(() => requireRole(customerContext, "customer"));
    assert.doesNotThrow(() => requireRole(providerContext, "provider"));
  });

  it("requireRole maps platform_admin to admin requirement", () => {
    assert.doesNotThrow(() => requireRole(adminContext, "admin"));
  });

  it("requireRole rejects insufficient role", () => {
    assert.throws(() => requireRole(customerContext, "provider"), (error: unknown) => {
      return error instanceof AppError && error.problem.status === 403;
    });
  });

  it("authorizeRoles middleware enforces route role", async () => {
    const buildApp = (ctx: AuthContext) => {
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ctx;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.addHook("preHandler", createAuthorizeRolesMiddleware("provider"));
      app.setErrorHandler(errorHandler);
      app.get("/provider-only", { config: { authRequired: true } }, async () => ({ ok: true }));
      return app;
    };

    const allowed = await buildApp(providerContext).inject({ method: "GET", url: "/provider-only" });
    assert.equal(allowed.statusCode, 200);

    const denied = await buildApp(customerContext).inject({ method: "GET", url: "/provider-only" });
    assert.equal(denied.statusCode, 403);
  });
});
