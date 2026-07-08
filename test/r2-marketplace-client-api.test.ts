import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  MVP_MARKETPLACE_SEARCH,
  buildMarketplaceWorkflowPayload,
} from "../src/ui/marketplace/marketplace-payload.js";
import { MarketplaceClient, MarketplaceClientError } from "../src/ui/marketplace/marketplace-client.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R2 marketplace client API integration", () => {
  it("calls POST /ai/workflow/analyze through R1 and returns typed success result", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const payload = buildMarketplaceWorkflowPayload(MVP_MARKETPLACE_SEARCH);
    const expected = workflowService.analyze(payload);

    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, expected),
    });

    const apiResult = await client.analyzeAndFindProvidersWithApiResult(MVP_MARKETPLACE_SEARCH);

    assert.equal(apiResult.response.success, true);
    assert.equal(apiResult.response.data?.workflow_status, "ready");
    assert.equal(apiResult.meta.path, "/ai/workflow/analyze");
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          400,
          { code: "INVALID_INPUT", message: "profession is invalid" },
          false
        ),
    });

    const result = await client.postWorkflowAnalyzeWithApiResult(
      buildMarketplaceWorkflowPayload(MVP_MARKETPLACE_SEARCH)
    );

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "INVALID_INPUT");
    assert.equal(result.meta.status, 400);
  });

  it("maps unauthorized errors to MarketplaceClientError", async () => {
    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          401,
          { code: "UNAUTHORIZED", detail: "Authentication required" },
          false
        ),
    });

    await assert.rejects(
      () => client.analyzeAndFindProviders(MVP_MARKETPLACE_SEARCH),
      (error) => error instanceof MarketplaceClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const result = await client.postWorkflowAnalyzeWithApiResult(
      buildMarketplaceWorkflowPayload(MVP_MARKETPLACE_SEARCH)
    );

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "TIMEOUT");
  });

  it("still supports executor mode for tests and demos", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    const workflow = await client.analyzeAndFindProviders(MVP_MARKETPLACE_SEARCH);
    assert.equal(workflow.workflow_status, "ready");
    assert.equal(workflow.matching.selected_provider_id, "550e8400-e29b-41d4-a716-446655440001");
  });
});
