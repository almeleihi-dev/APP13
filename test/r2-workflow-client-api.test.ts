import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import { buildWorkflowAnalyzePayload } from "../src/ui/workflow/workflow-payload.js";
import { WorkflowClient, WorkflowClientError } from "../src/ui/workflow/workflow-client.js";

const READY_REQUEST = {
  request_text:
    "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
  budget: 15000,
  preferred_days: 14,
};

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R2 workflow client API integration", () => {
  it("calls POST /ai/workflow/analyze through R1 and returns typed success result", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const payload = buildWorkflowAnalyzePayload(READY_REQUEST);
    const expected = workflowService.analyze(payload);
    let requestedUrl = "";
    let method = "";

    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url, init) => {
        requestedUrl = String(url);
        method = init?.method ?? "";
        return mockResponse(200, expected);
      },
    });

    const apiResult = await client.analyzeRequestWithApiResult(READY_REQUEST);

    assert.equal(apiResult.response.success, true);
    assert.equal(apiResult.response.data?.workflow_status, "ready");
    assert.equal(apiResult.meta.method, "POST");
    assert.equal(apiResult.meta.path, "/ai/workflow/analyze");
    assert.match(requestedUrl, /\/ai\/workflow\/analyze$/);
    assert.equal(method, "POST");
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          422,
          {
            code: "VALIDATION_ERROR",
            message: "requirement_text is required",
          },
          false
        ),
    });

    const result = await client.postWorkflowAnalyzeWithApiResult(buildWorkflowAnalyzePayload(READY_REQUEST));

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "VALIDATION_ERROR");
    assert.equal(result.meta.status, 422);
  });

  it("maps unauthorized errors to WorkflowClientError", async () => {
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          401,
          { code: "UNAUTHORIZED", detail: "Authentication required" },
          false
        ),
    });

    await assert.rejects(
      () => client.analyzeRequest(READY_REQUEST),
      (error) =>
        error instanceof WorkflowClientError &&
        error.status === 401 &&
        error.code === "UNAUTHORIZED"
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const result = await client.postWorkflowAnalyzeWithApiResult(buildWorkflowAnalyzePayload(READY_REQUEST));

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "TIMEOUT");
    assert.equal(result.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    const workflow = await client.analyzeRequest(READY_REQUEST);
    assert.equal(workflow.workflow_status, "ready");
  });

  it("returns typed ApiResult in executor mode", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    const result = await client.analyzeRequestWithApiResult(READY_REQUEST);
    assert.equal(result.response.success, true);
    assert.equal(result.response.data?.workflow_status, "ready");
  });
});
