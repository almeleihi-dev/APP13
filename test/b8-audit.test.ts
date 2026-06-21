import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuditLogRepository } from "../src/security/infrastructure/audit-log-repository.js";
import { SecurityAuditService } from "../src/security/audit-service.js";
import { createMockDb } from "./helpers/b8-security-harness.js";

describe("B8 audit logging", () => {
  it("stores user_id, action, entity_type, entity_id, and timestamp", async () => {
    const db = createMockDb();
    const repo = new AuditLogRepository(db as never);
    const audit = new SecurityAuditService(repo);

    await audit.log({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      action: "login",
      entityType: "session",
      entityId: "session-123",
      ipAddress: "127.0.0.1",
    });

    const rows = await repo.listByUser("550e8400-e29b-41d4-a716-446655440000");
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.userId, "550e8400-e29b-41d4-a716-446655440000");
    assert.equal(rows[0]!.action, "login");
    assert.equal(rows[0]!.entityType, "session");
    assert.equal(rows[0]!.entityId, "session-123");
    assert.ok(rows[0]!.createdAt instanceof Date);
  });

  it("supports required audit actions", async () => {
    const db = createMockDb();
    const audit = new SecurityAuditService(new AuditLogRepository(db as never));
    const userId = "550e8400-e29b-41d4-a716-446655440000";
    const actions = [
      "login",
      "logout",
      "token_refresh",
      "read",
      "create",
      "update",
      "delete",
    ] as const;

    for (const action of actions) {
      await audit.log({
        userId,
        action,
        entityType: "resource",
        entityId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      });
    }

    assert.equal(db.auditRows.length, actions.length);
    assert.deepEqual(
      db.auditRows.map((row) => row.action),
      [...actions]
    );
  });
});
