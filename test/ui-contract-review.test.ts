import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import { ContractClient, ContractClientError } from "../src/ui/contract/contract-client.js";
import {
  MVP_CONTRACT_WORKFLOW_INPUT,
  buildContractReviewContext,
  buildContractWorkflowPayload,
  validateContractReviewInput,
} from "../src/ui/contract/contract-payload.js";
import {
  analyzeContractReview,
  buildContractReview,
  createContractReviewPageModel,
  renderContractReviewPage,
} from "../src/ui/pages/contract-review.js";

describe("P4 contract review page", () => {
  const workflow = createWorkflowIntelligenceService().analyze(
    buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
  );
  const context = buildContractReviewContext(MVP_CONTRACT_WORKFLOW_INPUT, workflow);

  it("validates workflow review input", () => {
    const valid = validateContractReviewInput({ workflow, context });
    assert.equal(valid.valid, true);

    const invalid = validateContractReviewInput({
      workflow: { ...workflow, workflow_status: "invalid" as "ready" },
    });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.some((error) => error.field === "workflow_status"));
  });

  it("rejects missing requirement output", () => {
    const invalid = validateContractReviewInput({
      workflow: { ...workflow, requirement: undefined as never },
    });

    assert.equal(invalid.valid, false);
    assert.equal(invalid.errors[0]?.field, "requirement");
  });

  it("builds contract payload with customer context", () => {
    const payload = buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT);

    assert.equal(payload.profession, "software_developer");
    assert.equal(payload.customer_budget, 15000);
    assert.ok(payload.providers.length >= 1);
  });

  it("projects workflow into contract review result", () => {
    const review = buildContractReview({ workflow, context });

    assert.equal(review.view.workflow_status, "ready");
    assert.equal(review.view.contract_summary.fields[0]?.value, "ready");
    assert.equal(review.view.parties.fields[0]?.value, "Demo Customer");
    assert.equal(review.view.trust.fields[1]?.value, "emerald");
  });

  it("executes contract review through workflow integration layer", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const result = await analyzeContractReview(MVP_CONTRACT_WORKFLOW_INPUT, {
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    assert.equal(result.workflow.workflow_status, "ready");
    assert.equal(result.context.customer_label, "Demo Customer");
    assert.equal(result.view.milestones.fields[0]?.value, "4");
    assert.equal(result.view.escrow.fields[0]?.value, "milestone_based");
  });

  it("renders contract review page markup", () => {
    const review = buildContractReview({ workflow, context });
    const html = renderContractReviewPage(createContractReviewPageModel(review));

    assert.match(html, /data-page="contract-review"/);
    assert.match(html, /data-section="review-preview"/);
    assert.match(html, /data-section="full-summary"/);
    assert.match(html, /Contract Readiness: ready/);
    assert.match(html, /data-card="contract-summary"/);
    assert.match(html, /data-card="risk"/);
  });

  it("handles no-provider workflow state without throwing", () => {
    const emptyWorkflow = createWorkflowIntelligenceService().analyze({
      requirement_text: MVP_CONTRACT_WORKFLOW_INPUT.request_text,
      providers: [],
    });
    const review = buildContractReview({
      workflow: emptyWorkflow,
      context: buildContractReviewContext(MVP_CONTRACT_WORKFLOW_INPUT, emptyWorkflow),
    });

    assert.equal(review.view.workflow_status, "no_provider_match");
    assert.equal(review.view.contract_summary.fields[3]?.value, "—");
    assert.equal(review.view.trust.fields[0]?.value, "—");
  });

  it("surfaces HTTP errors from the contract client", async () => {
    const client = new ContractClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ code: "UNAUTHORIZED", detail: "Authentication required" }),
        }) as Response,
    });

    await assert.rejects(
      () => client.analyzeContractReview(MVP_CONTRACT_WORKFLOW_INPUT),
      (error) => error instanceof ContractClientError && error.status === 401
    );
  });
});
