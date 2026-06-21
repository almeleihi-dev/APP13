import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DisputeClient, DisputeClientError } from "../src/ui/dispute/dispute-client.js";
import {
  MVP_DISPUTE_ID,
  MVP_OPEN_DISPUTE_SOURCE,
} from "../src/ui/dispute/dispute-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R5 dispute client API integration", () => {
  it("calls GET /disputes/:id through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_OPEN_DISPUTE_SOURCE);
      },
    });

    const api = await client.getDisputeDashboardWithApiResult({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.summary.currentStatus, "mediation");
    assert.equal(api.meta.path, `/disputes/${MVP_DISPUTE_ID}`);
    assert.match(requestedUrl, /\/disputes\//);
  });

  it("calls GET /disputes/:id/details through R1", async () => {
    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, MVP_OPEN_DISPUTE_SOURCE),
    });

    const api = await client.getDisputeDetailsWithApiResult({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/disputes/${MVP_DISPUTE_ID}/details`);
  });

  it("calls GET /disputes/:id/timeline through R1", async () => {
    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        assert.match(String(url), /\/timeline(\?|$)/);
        return mockResponse(200, MVP_OPEN_DISPUTE_SOURCE);
      },
    });

    const api = await client.getResolutionTimelineWithApiResult({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/disputes/${MVP_DISPUTE_ID}/timeline`);
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new DisputeClient({ baseUrl: "http://localhost:3000" });

    await assert.rejects(
      () => client.getDisputeDashboardWithApiResult({ dispute_id: "bad-id" }),
      (error) => error instanceof Error && /valid UUID/.test(error.message)
    );
  });

  it("maps not found errors to DisputeClientError", async () => {
    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(404, { code: "NOT_FOUND", message: "Dispute not found" }, false),
    });

    await assert.rejects(
      () => client.getDisputeDashboard({ dispute_id: MVP_DISPUTE_ID }),
      (error) => error instanceof DisputeClientError && error.status === 404
    );
  });

  it("maps unauthorized errors to DisputeClientError", async () => {
    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getDisputeDashboard({ dispute_id: MVP_DISPUTE_ID }),
      (error) => error instanceof DisputeClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new DisputeClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getDisputeDashboardWithApiResult({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
    assert.equal(api.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new DisputeClient({
      dashboardExecutor: async () => MVP_OPEN_DISPUTE_SOURCE,
    });

    const result = await client.getDisputeDashboard({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(result.view.dispute_status, "mediation");
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new DisputeClient();
    const api = await client.getDisputeDashboardWithApiResult({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.summary.disputeId, MVP_DISPUTE_ID);
  });
});
