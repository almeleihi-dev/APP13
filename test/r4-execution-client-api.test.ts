import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutionClient, ExecutionClientError } from "../src/ui/execution/execution-client.js";
import {
  MVP_ACTIVE_EXECUTION_SOURCE,
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
} from "../src/ui/execution/execution-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R4 execution client API integration", () => {
  it("calls GET /execution/:id/dashboard through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new ExecutionClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_ACTIVE_EXECUTION_SOURCE);
      },
    });

    const api = await client.getExecutionDashboardWithApiResult({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.contract.status, "active");
    assert.equal(api.meta.path, `/execution/${MVP_EXECUTION_CONTRACT_ID}/dashboard`);
    assert.match(requestedUrl, /\/dashboard$/);
  });

  it("calls GET /execution/milestone/:id through R1", async () => {
    const client = new ExecutionClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, MVP_ACTIVE_EXECUTION_SOURCE),
    });

    const api = await client.getMilestoneDetailsWithApiResult({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/execution/milestone/${MVP_MILESTONE_ACCESS_ID}`);
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new ExecutionClient({ baseUrl: "http://localhost:3000" });

    await assert.rejects(
      () => client.getExecutionDashboardWithApiResult({ contract_id: "bad-id" }),
      (error) => error instanceof Error && /valid UUID/.test(error.message)
    );
  });

  it("maps unauthorized errors to ExecutionClientError", async () => {
    const client = new ExecutionClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getExecutionDashboard({ contract_id: MVP_EXECUTION_CONTRACT_ID }),
      (error) => error instanceof ExecutionClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new ExecutionClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getExecutionDashboardWithApiResult({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
    });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new ExecutionClient({
      dashboardExecutor: async () => MVP_ACTIVE_EXECUTION_SOURCE,
    });

    const result = await client.getExecutionDashboard({ contract_id: MVP_EXECUTION_CONTRACT_ID });
    assert.equal(result.view.contract_status, "active");
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new ExecutionClient();
    const api = await client.getExecutionDashboardWithApiResult({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.contract.id, MVP_EXECUTION_CONTRACT_ID);
  });
});
