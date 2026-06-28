import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { requireAuth, requireRole, requireOwnership } from "../src/security/guards.js";
import { SecurityAuditService } from "../src/security/audit-service.js";
import { AuditLogRepository } from "../src/security/infrastructure/audit-log-repository.js";
import { ContractOwnershipChecker } from "../src/security/ownership-registry.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { createMockDb } from "./helpers/b8-security-harness.js";
import { createMatchingIntelligenceService } from "../src/matching/intelligence/matching-intelligence-service.js";
import { createTrustIntelligenceService } from "../src/trust/intelligence/trust-intelligence-service.js";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function extractRouteHandlers(source: string): Array<{ method: string; path: string; config: string }> {
  const handlers: Array<{ method: string; path: string; config: string }> = [];
  const pattern =
    /app\.(get|post|put|patch|delete)\(\s*\n?\s*"([^"]+)"\s*,\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    handlers.push({ method: match[1]!, path: match[2]!, config: match[3] ?? "" });
  }
  return handlers;
}

const customerContext: AuthContext = {
  userId: "11111111-1111-4111-8111-111111111111",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "s3-session",
};

describe("S3.1 Security Hardening Verification", () => {
  describe("authorization audit", () => {
    it("exports framework-agnostic requireAuth and requireRole guards", () => {
      const securityIndex = readSource("src/security/index.ts");
      assert.match(securityIndex, /requireAuth/);
      assert.match(securityIndex, /requireRole/);
      assert.match(securityIndex, /requireOwnership/);
    });

    it("requireAuth rejects unauthenticated access", () => {
      assert.throws(() => requireAuth(null), (error: unknown) => {
        return error instanceof AppError && error.problem.status === 401;
      });
    });

    it("requireRole enforces role membership", () => {
      assert.throws(() => requireRole(customerContext, "provider"), (error: unknown) => {
        return error instanceof AppError && error.problem.status === 403;
      });
    });

    it("wires authenticate and requireAuth middleware in server bootstrap", () => {
      const server =
        readSource("src/api/server.ts") + readSource("src/bootstrap/routes.ts");
      assert.match(server, /createAuthenticateMiddleware/);
      assert.match(server, /requireAuthMiddleware/);
      assert.match(server, /registerSecurityAuthRoutes/);
    });
  });

  describe("route protection audit", () => {
    it("protects operational mutation routes with authRequired", () => {
      const protectedPatterns = [
        { file: "src/api/routes/actions.ts", path: "/v1/actions" },
        { file: "src/api/routes/contracts.ts", path: "/v1/contracts/:contractId/transitions" },
        { file: "src/api/routes/evidence.ts", path: "/v1/contracts/:contractId/milestones/:milestoneId/evidence/upload-intent" },
        { file: "src/api/routes/issues.ts", path: "/v1/issues" },
        { file: "src/api/routes/escrow.ts", path: "/escrow/:id" },
      ];

      for (const route of protectedPatterns) {
        const source = readSource(route.file);
        const block = source.slice(source.indexOf(route.path));
        assert.match(block, /authRequired:\s*true/, `${route.path} must require auth`);
      }
    });

    it("allows explicit public auth routes without authRequired", () => {
      const authRoutes = readSource("src/api/routes/security-auth.ts");
      assert.match(authRoutes, /authRequired:\s*false/);
      assert.match(authRoutes, /"\/auth\/login"/);
    });

    it("protects internal service routes with serviceAuth", () => {
      const internal = readSource("src/api/routes/internal/contracts.ts");
      assert.match(internal, /serviceAuth:\s*true/);
      assert.match(internal, /authRequired:\s*false/);
    });

    it("requires authentication on AI mutation routes", () => {
      const aiRouteFiles = readdirSync(join(SRC, "api/routes")).filter((file) =>
        file.startsWith("ai-")
      );
      for (const file of aiRouteFiles) {
        const source = readSource(`src/api/routes/${file}`);
        const handlers = extractRouteHandlers(source).filter((handler) => handler.method === "post");
        assert.ok(handlers.length >= 1, `${file} should expose POST handlers`);
        for (const handler of handlers) {
          assert.match(
            handler.config,
            /authRequired:\s*true/,
            `${handler.path} in ${file} must require auth`
          );
        }
      }
    });
  });

  describe("input validation audit", () => {
    it("rejects invalid trust provider identifiers", () => {
      const trust = createTrustIntelligenceService();
      assert.throws(
        () => trust.calculate({ provider_id: "not-a-uuid", metrics: {} as never }),
        (error: unknown) => error instanceof AppError && error.problem.status === 400
      );
    });

    it("rejects malformed matching provider payloads", () => {
      const matching = createMatchingIntelligenceService();
      assert.throws(
        () =>
          matching.rank({
            requirement: {
              required_action_codes: ["A.2.1"],
              required_skills: ["cleaning"],
              budget: 100,
            },
            providers: [
              {
                provider_id: "550e8400-e29b-41d4-a716-446655440001",
                action_codes: ["A.2.1"],
                skills: ["cleaning"],
                trust_score: 80,
                average_rating: Number.NaN,
                price_estimate: 100,
                available_now: true,
              },
            ],
          }),
        (error: unknown) => error instanceof AppError && error.problem.status === 400
      );
    });

    it("ownership checker rejects unsupported entity types", async () => {
      const checker = new ContractOwnershipChecker({ pool: { query: async () => ({ rows: [] }) } } as never);
      const decision = await checker.check(customerContext, {
        entityType: "unknown_resource",
        entityId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      });
      assert.equal(decision.allowed, false);
    });
  });

  describe("rate limiting verification", () => {
    it("records rate limiting as documented but not yet implemented in src", () => {
      const server = readSource("src/api/server.ts");
      const securityIndex = readSource("src/security/index.ts");
      assert.doesNotMatch(server, /rateLimit|rate-limit|rate_limit/);
      assert.doesNotMatch(securityIndex, /rateLimit|rate-limit|rate_limit/);

      const apiArchitecture = readSource("docs/architecture/APP13-API-Architecture-v1.1.md");
      assert.match(apiArchitecture, /Rate limiting/);
      assert.match(apiArchitecture, /100\/min/);
    });
  });

  describe("audit logging verification", () => {
    it("persists required audit actions through SecurityAuditService", async () => {
      const db = createMockDb();
      const audit = new SecurityAuditService(new AuditLogRepository(db as never));
      await audit.log({
        userId: customerContext.userId,
        action: "login",
        entityType: "session",
        entityId: "session-s3",
      });
      assert.equal(db.auditRows.length, 1);
      assert.equal(db.auditRows[0]?.action, "login");
    });

    it("indexes durable audit log migration", () => {
      assert.ok(existsSync(join(ROOT, "database/migrations/015_security_kernel.sql")));
      const migration = readSource("database/migrations/015_security_kernel.sql");
      assert.match(migration, /identity\.audit_logs/);
    });

    it("SecurityAuthKernelService source emits auth lifecycle audit calls", () => {
      const kernel = readSource("src/security/auth-kernel-service.ts");
      assert.match(kernel, /action:\s*"login"/);
      assert.match(kernel, /action:\s*"logout"/);
      assert.match(kernel, /action:\s*"token_refresh"/);
    });
  });
});
