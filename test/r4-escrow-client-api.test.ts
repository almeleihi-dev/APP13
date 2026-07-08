import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EscrowClient, EscrowClientError } from "../src/ui/escrow/escrow-client.js";
import {
  MVP_ESCROW_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
} from "../src/ui/escrow/escrow-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R4 escrow client API integration", () => {
  it("calls GET /escrow/:id through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_MILESTONE_ESCROW_SOURCE);
      },
    });

    const api = await client.getEscrowOverviewWithApiResult({ escrow_id: MVP_ESCROW_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.escrow.status, "held");
    assert.equal(api.meta.path, `/escrow/${MVP_ESCROW_ID}`);
    assert.match(requestedUrl, /\/escrow\//);
  });

  it("calls GET /escrow/:id/history through R1", async () => {
    let requestedUrl = "";

    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_MILESTONE_ESCROW_SOURCE);
      },
    });

    const api = await client.getEscrowHistoryWithApiResult({ escrow_id: MVP_ESCROW_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/escrow/${MVP_ESCROW_ID}/history`);
    assert.match(requestedUrl, /\/history$/);
  });

  it("maps not found errors to EscrowClientError", async () => {
    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(404, { code: "NOT_FOUND", message: "Escrow not found" }, false),
    });

    await assert.rejects(
      () => client.getEscrowOverview({ escrow_id: MVP_ESCROW_ID }),
      (error) => error instanceof EscrowClientError && error.status === 404
    );
  });

  it("maps unauthorized errors to EscrowClientError", async () => {
    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getEscrowOverview({ escrow_id: MVP_ESCROW_ID }),
      (error) => error instanceof EscrowClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getEscrowOverviewWithApiResult({ escrow_id: MVP_ESCROW_ID });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
    assert.equal(api.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new EscrowClient({
      overviewExecutor: async () => MVP_MILESTONE_ESCROW_SOURCE,
    });

    const result = await client.getEscrowOverview({ escrow_id: MVP_ESCROW_ID });
    assert.equal(result.view.escrow_status, "held");
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new EscrowClient();
    const api = await client.getEscrowOverviewWithApiResult({ escrow_id: MVP_ESCROW_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.escrow.id, MVP_ESCROW_ID);
  });
});
