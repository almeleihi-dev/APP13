import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  MVP_CONTRACT_WORKFLOW_INPUT,
  buildContractWorkflowPayload,
} from "../src/ui/contract/contract-payload.js";
import { ContractClient, ContractClientError } from "../src/ui/contract/contract-client.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R2 contract client API integration", () => {
  it("calls POST /ai/workflow/analyze through R1 and returns typed success result", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const payload = buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT);
    const expected = workflowService.analyze(payload);

    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, expected),
    });

    const { api, review } = await client.analyzeContractReviewWithApiResult(MVP_CONTRACT_WORKFLOW_INPUT);

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.workflow_status, "ready");
    assert.equal(review?.context.customer_label, "Demo Customer");
    assert.equal(review?.view.trust.fields[1]?.value, "emerald");
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          422,
          { code: "VALIDATION_ERROR", message: "providers list is required" },
          false
        ),
    });

    const { api, review } = await client.analyzeContractReviewWithApiResult(MVP_CONTRACT_WORKFLOW_INPUT);

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "VALIDATION_ERROR");
    assert.equal(review, undefined);
  });

  it("maps unauthorized errors to ContractClientError", async () => {
    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          401,
          { code: "UNAUTHORIZED", detail: "Authentication required" },
          false
        ),
    });

    await assert.rejects(
      () => client.analyzeContractReview(MVP_CONTRACT_WORKFLOW_INPUT),
      (error) => error instanceof ContractClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new ContractClient({
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
      buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
    );

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "TIMEOUT");
    assert.equal(result.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    const result = await client.analyzeContractReview(MVP_CONTRACT_WORKFLOW_INPUT);
    assert.equal(result.workflow.workflow_status, "ready");
    assert.equal(result.view.milestones.fields[0]?.value, "4");
  });

  it("returns typed ApiResult in executor mode", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    const { api, review } = await client.analyzeContractReviewWithApiResult(MVP_CONTRACT_WORKFLOW_INPUT);
    assert.equal(api.response.success, true);
    assert.equal(review?.workflow.workflow_status, "ready");
  });
});
