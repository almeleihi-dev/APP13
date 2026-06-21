import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApiConfig } from "../src/integration/api-config.js";
import {
  NotFoundError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
} from "../src/integration/api-errors.js";
import {
  createRequestExecutor,
  mapResponseToResult,
  RequestExecutor,
} from "../src/integration/request-executor.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R1 request executor", () => {
  it("maps successful responses to typed results", async () => {
    const executor = createRequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async () => mockResponse(200, { workflow_status: "ready" }),
    });

    const result = await executor.post<{ workflow_status: string }>("/ai/workflow/analyze", {
      requirement_text: "Build app",
    });

    assert.equal(result.response.success, true);
    assert.equal(result.response.data?.workflow_status, "ready");
    assert.equal(result.meta.method, "POST");
    assert.equal(result.meta.path, "/ai/workflow/analyze");
    assert.equal(result.meta.status, 200);
    assert.ok(result.meta.durationMs >= 0);
  });

  it("maps validation failures without throwing by default", async () => {
    const executor = createRequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async () =>
        mockResponse(422, {
          code: "VALIDATION_ERROR",
          message: "provider_id must be a valid UUID",
        }, false),
    });

    const result = await executor.get("/providers/bad-id");

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "VALIDATION_ERROR");
    assert.equal(result.meta.status, 422);
  });

  it("throws mapped unauthorized errors when throwOnError is enabled", async () => {
    const executor = createRequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async () =>
        mockResponse(401, {
          code: "UNAUTHORIZED",
          detail: "Authentication required",
        }, false),
    });

    await assert.rejects(
      () => executor.get("/secure", { throwOnError: true }),
      (error) => error instanceof UnauthorizedError
    );
  });

  it("throws mapped not found errors when throwOnError is enabled", async () => {
    const executor = createRequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async () =>
        mockResponse(404, {
          code: "NOT_FOUND",
          message: "Dispute not found",
        }, false),
    });

    await assert.rejects(
      () => executor.get("/disputes/missing", { throwOnError: true }),
      (error) => error instanceof NotFoundError
    );
  });

  it("propagates timeout errors from the client layer", async () => {
    const executor = createRequestExecutor({
      config: createApiConfig("test", { timeoutMs: 20 }),
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    await assert.rejects(
      () => executor.get("/slow"),
      (error) => error instanceof TimeoutError
    );
  });

  it("maps raw responses through mapResponseToResult", () => {
    const success = mapResponseToResult<{ id: string }>(
      200,
      "GET",
      "/contracts/1",
      { id: "880e8400-e29b-41d4-a716-446655440001" },
      12,
      "req-123"
    );
    const failure = mapResponseToResult(
      400,
      "POST",
      "/contracts",
      { code: "VALIDATION_ERROR", message: "Invalid payload" },
      8
    );

    assert.equal(success.response.success, true);
    assert.equal(success.meta.requestId, "req-123");
    assert.equal(failure.response.success, false);
    assert.equal(failure.response.error?.code, "VALIDATION_ERROR");
    assert.equal(failure.meta.durationMs, 8);
  });

  it("throws validation errors through execute with throwOnError", async () => {
    const executor = new RequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async () =>
        mockResponse(400, {
          code: "INVALID_INPUT",
          message: "Missing contract_id",
        }, false),
    });

    await assert.rejects(
      () =>
        executor.execute({
          method: "POST",
          path: "/contracts/review",
          body: {},
          throwOnError: true,
        }),
      (error) => error instanceof ValidationError
    );
  });
});

describe("R1 request executor integration", () => {
  it("supports all HTTP verbs through the executor pipeline", async () => {
    const methods: string[] = [];
    const executor = createRequestExecutor({
      config: createApiConfig("test"),
      fetchImpl: async (_url, init) => {
        methods.push(init?.method ?? "");
        return mockResponse(200, { ok: true });
      },
    });

    await executor.get("/a");
    await executor.post("/b", { ok: true });
    await executor.put("/c", { ok: true });
    await executor.patch("/d", { ok: true });
    await executor.delete("/e");

    assert.deepEqual(methods, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
  });
});
