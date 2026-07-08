import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TrustClient, TrustClientError } from "../src/ui/trust/trust-client.js";
import {
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
} from "../src/ui/trust/trust-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R5 trust client API integration", () => {
  it("calls GET /trust/:id through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_TRUST_CENTER_SOURCE);
      },
    });

    const api = await client.getTrustCenterWithApiResult({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.trustSummary.trustTier, "emerald");
    assert.equal(api.meta.path, `/trust/${MVP_TRUST_PROVIDER_ID}`);
    assert.match(requestedUrl, /\/trust\//);
  });

  it("calls GET /trust/provider/:id through R1", async () => {
    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, MVP_TRUST_CENTER_SOURCE),
    });

    const api = await client.getProviderTrustReportWithApiResult({
      provider_id: MVP_TRUST_PROVIDER_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/trust/provider/${MVP_TRUST_PROVIDER_ID}`);
  });

  it("calls GET /trust/:id/timeline through R1", async () => {
    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        assert.match(String(url), /\/timeline(\?|$)/);
        return mockResponse(200, MVP_TRUST_CENTER_SOURCE);
      },
    });

    const api = await client.getTrustTimelineWithApiResult({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/trust/${MVP_TRUST_PROVIDER_ID}/timeline`);
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new TrustClient({ baseUrl: "http://localhost:3000" });

    await assert.rejects(
      () => client.getTrustCenterWithApiResult({ provider_id: "bad-id" }),
      (error) => error instanceof Error && /valid UUID/.test(error.message)
    );
  });

  it("maps not found errors to TrustClientError", async () => {
    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(404, { code: "NOT_FOUND", message: "Trust profile not found" }, false),
    });

    await assert.rejects(
      () => client.getTrustCenter({ provider_id: MVP_TRUST_PROVIDER_ID }),
      (error) => error instanceof TrustClientError && error.status === 404
    );
  });

  it("maps unauthorized errors to TrustClientError", async () => {
    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getTrustCenter({ provider_id: MVP_TRUST_PROVIDER_ID }),
      (error) => error instanceof TrustClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new TrustClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getTrustCenterWithApiResult({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
    assert.equal(api.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new TrustClient({
      centerExecutor: async () => MVP_TRUST_CENTER_SOURCE,
    });

    const result = await client.getTrustCenter({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(result.view.trust_tier, "emerald");
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new TrustClient();
    const api = await client.getTrustCenterWithApiResult({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.providerId, MVP_TRUST_PROVIDER_ID);
  });
});
