import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  IdempotencyService,
  hashRequestBody,
  type IdempotencyStore,
} from "../src/platform/idempotency/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly data = new Map<string, string>();

  async get(key: string) {
    const raw = this.data.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async set(key: string, record: unknown, _ttlSeconds: number) {
    this.data.set(key, JSON.stringify(record));
  }
}

describe("IdempotencyService", () => {
  const service = new IdempotencyService(new MemoryIdempotencyStore(), 86400);

  it("requires Idempotency-Key header", () => {
    assert.throws(
      () => service.validateKey(undefined),
      (error: unknown) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.IDEMPOTENCY_KEY_REQUIRED
    );
  });

  it("replays same key + same body", async () => {
    const key = "550e8400-e29b-41d4-a716-446655440000";
    const hash = hashRequestBody('{"a":1}');
    await service.complete(key, hash, 201, {}, '{"id":"x"}');

    const replay = await service.begin(key, hash);
    assert.ok(replay);
    assert.equal(replay.replay, true);
    assert.equal(replay.statusCode, 201);
    assert.equal(replay.body, '{"id":"x"}');
  });

  it("rejects same key + different body with 409", async () => {
    const key = "550e8400-e29b-41d4-a716-446655440001";
    const hashA = hashRequestBody('{"a":1}');
    await service.complete(key, hashA, 201, {}, "{}");

    await assert.rejects(
      () => service.begin(key, hashRequestBody('{"a":2}')),
      (error: unknown) =>
        error instanceof AppError &&
        error.problem.status === 409 &&
        error.problem.code === ErrorCodes.IDEMPOTENCY_KEY_REUSE
    );
  });
});

describe("ProblemDetails", () => {
  it("matches RFC 7807 required fields", async () => {
    const { problem } = await import("../src/shared/errors/index.js");
    const body = problem({
      title: "Unauthorized",
      status: 401,
      code: ErrorCodes.UNAUTHORIZED,
      engine: "platform",
    });
    assert.equal(typeof body.type, "string");
    assert.equal(typeof body.title, "string");
    assert.equal(body.status, 401);
  });
});

describe("Module registry", () => {
  it("lists engine and platform modules", async () => {
    const { listRegisteredModules } = await import("../src/bootstrap/modules.js");
    const modules = listRegisteredModules();
    assert.ok(modules.includes("identity"));
    assert.ok(modules.includes("platform.outbox"));
  });
});
