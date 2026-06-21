import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApiConfig } from "../src/integration/api-config.js";
import { ApiClient, createApiClient } from "../src/integration/api-client.js";
import { TimeoutError } from "../src/integration/api-errors.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R1 api client", () => {
  it("performs GET requests with query parameters", async () => {
    let requestedUrl = "";

    const client = createApiClient({
      config: createApiConfig("test", { baseUrl: "http://localhost:3000" }),
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, { items: ["a"] });
      },
    });

    const response = await client.get<{ items: string[] }>("/providers", {
      query: { page: 1, active: true },
      requestId: "req-001",
    });

    assert.equal(response.ok, true);
    assert.deepEqual(response.body, { items: ["a"] });
    assert.match(requestedUrl, /\/providers\?page=1&active=true/);
  });

  it("performs POST requests with JSON body and bearer token", async () => {
    let method = "";
    let body = "";
    let authorization = "";

    const client = createApiClient({
      config: createApiConfig("test"),
      authToken: "global-token",
      fetchImpl: async (_url, init) => {
        method = init?.method ?? "";
        body = String(init?.body ?? "");
        authorization = String(
          new Headers(init?.headers).get("Authorization") ?? ""
        );
        return mockResponse(201, { id: "created" });
      },
    });

    const response = await client.post<{ id: string }>(
      "/contracts",
      { title: "Demo" },
      { authToken: "override-token" }
    );

    assert.equal(method, "POST");
    assert.equal(body, JSON.stringify({ title: "Demo" }));
    assert.equal(authorization, "Bearer override-token");
    assert.equal(response.status, 201);
    assert.equal(response.body.id, "created");
  });

  it("supports PUT, PATCH, and DELETE verbs", async () => {
    const methods: string[] = [];

    const client = createApiClient({
      config: createApiConfig("test"),
      fetchImpl: async (_url, init) => {
        methods.push(init?.method ?? "");
        return mockResponse(200, { ok: true });
      },
    });

    await client.put("/contracts/1", { status: "active" });
    await client.patch("/contracts/1", { title: "Updated" });
    await client.delete("/contracts/1");

    assert.deepEqual(methods, ["PUT", "PATCH", "DELETE"]);
  });

  it("enforces request timeout", async () => {
    const client = createApiClient({
      config: createApiConfig("test", { timeoutMs: 20 }),
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    await assert.rejects(() => client.get("/slow"), (error) => error instanceof TimeoutError);
  });

  it("returns typed raw responses with metadata headers", async () => {
    const client = createApiClient({
      config: createApiConfig("test"),
      fetchImpl: async () =>
        mockResponse(200, { trust_score: 92 }, true),
    });

    const response = await client.get<{ trust_score: number }>("/trust/1", {
      requestId: "req-trust",
    });

    assert.equal(response.body.trust_score, 92);
    assert.equal(response.headers.get("content-type"), "application/json");
  });
});

describe("R1 api client integration", () => {
  it("uses ApiClient class directly", async () => {
    const client = new ApiClient({
      config: createApiConfig("local"),
      fetchImpl: async () => mockResponse(200, { environment: "local" }),
    });

    const response = await client.get<{ environment: string }>("/health");
    assert.equal(response.body.environment, "local");
  });
});
