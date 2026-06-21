import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PlatformClient, PlatformClientError } from "../src/ui/platform/platform-client.js";
import {
  MVP_PLATFORM_HOME_SOURCE,
  MVP_PLATFORM_ID,
} from "../src/ui/platform/platform-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R5 platform client API integration", () => {
  it("calls GET /platform/home through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new PlatformClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_PLATFORM_HOME_SOURCE);
      },
    });

    const api = await client.getPlatformHomeWithApiResult({ platform_id: MVP_PLATFORM_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.platformId, MVP_PLATFORM_ID);
    assert.equal(api.meta.path, "/platform/home");
    assert.match(requestedUrl, /\/platform\/home/);
  });

  it("calls GET /platform/overview through R1", async () => {
    const client = new PlatformClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        assert.match(String(url), /\/platform\/overview/);
        return mockResponse(200, MVP_PLATFORM_HOME_SOURCE);
      },
    });

    const api = await client.getPlatformOverviewWithApiResult({ platform_id: MVP_PLATFORM_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, "/platform/overview");
  });

  it("maps unauthorized errors to PlatformClientError", async () => {
    const client = new PlatformClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getPlatformHome({ platform_id: MVP_PLATFORM_ID }),
      (error) => error instanceof PlatformClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new PlatformClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getPlatformHomeWithApiResult({ platform_id: MVP_PLATFORM_ID });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
    assert.equal(api.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new PlatformClient({
      homeExecutor: async () => MVP_PLATFORM_HOME_SOURCE,
    });

    const result = await client.getPlatformHome({ platform_id: MVP_PLATFORM_ID });
    assert.equal(result.view.platform_id, MVP_PLATFORM_ID);
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new PlatformClient();
    const api = await client.getPlatformHomeWithApiResult({ platform_id: MVP_PLATFORM_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.platformId, MVP_PLATFORM_ID);
  });
});
