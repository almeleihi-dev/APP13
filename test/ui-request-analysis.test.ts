import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  analyzeCustomerRequest,
  createRequestAnalysisPageModel,
  renderRequestAnalysisPage,
  validateCustomerRequest,
} from "../src/ui/pages/request-analysis.js";
import { buildWorkflowAnalyzePayload } from "../src/ui/workflow/workflow-payload.js";
import { WorkflowClient, WorkflowClientError } from "../src/ui/workflow/workflow-client.js";

const READY_REQUEST = {
  request_text:
    "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
  budget: 15000,
  preferred_days: 14,
};

describe("P1 request analysis page", () => {
  it("defines the customer request form model", () => {
    const model = createRequestAnalysisPageModel();

    assert.equal(model.page_id, "request-analysis");
    assert.equal(model.submit_label, "Analyze Request");
    assert.ok(model.fields.some((field) => field.name === "request_text" && field.required));
  });

  it("renders the request analysis page markup", () => {
    const html = renderRequestAnalysisPage(createRequestAnalysisPageModel());

    assert.match(html, /Analyze Request/);
    assert.match(html, /data-page="request-analysis"/);
    assert.match(html, /name="request_text"/);
  });

  it("validates required request text", () => {
    const result = validateCustomerRequest({ request_text: "   " });

    assert.equal(result.valid, false);
    assert.equal(result.errors[0]?.field, "request_text");
  });

  it("builds workflow payload without intelligence duplication", () => {
    const payload = buildWorkflowAnalyzePayload(READY_REQUEST);

    assert.equal(payload.requirement_text, READY_REQUEST.request_text);
    assert.equal(payload.customer_budget, 15000);
    assert.equal(payload.customer_days, 14);
    assert.ok(payload.providers.length >= 1);
    assert.equal(typeof payload.profession, "undefined");
  });

  it("executes workflow analysis through the API integration layer", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const result = await analyzeCustomerRequest(READY_REQUEST, {
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    assert.equal(result.workflow.workflow_status, "ready");
    assert.equal(result.view.provider.fields[0]?.value, "550e8400-e29b-41d4-a716-446655440001");
    assert.equal(result.view.trust.fields[1]?.value, "emerald");
    assert.equal(result.view.pricing.summary, "13,500 SAR");
  });

  it("surfaces HTTP errors from the workflow client", async () => {
    const client = new WorkflowClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ code: "UNAUTHORIZED", detail: "Authentication required" }),
        }) as Response,
    });

    await assert.rejects(
      () => client.analyzeRequest(READY_REQUEST),
      (error) => error instanceof WorkflowClientError && error.status === 401
    );
  });
});
