import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import { EscrowClient, EscrowClientError } from "../src/ui/escrow/escrow-client.js";
import {
  MVP_CONTRACT_WORKFLOW_INPUT,
  buildContractWorkflowPayload,
} from "../src/ui/contract/contract-payload.js";
import {
  MVP_EMPTY_HISTORY_ESCROW_SOURCE,
  MVP_ESCROW_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
  MVP_REFUND_ESCROW_SOURCE,
  MVP_SINGLE_RELEASE_ESCROW_SOURCE,
  buildEscrowExperienceSourceFromWorkflow,
  validateEscrowOverviewRequest,
} from "../src/ui/escrow/escrow-payload.js";
import {
  buildEscrowOverviewView,
  createEscrowOverviewPageModel,
  renderEscrowOverviewPage,
  renderResponseCard,
} from "../src/ui/pages/escrow-overview.js";

describe("P5 escrow overview page", () => {
  it("validates escrow overview request", () => {
    const valid = validateEscrowOverviewRequest({ escrow_id: MVP_ESCROW_ID });
    assert.equal(valid.valid, true);

    const invalid = validateEscrowOverviewRequest({ escrow_id: "bad-id" });
    assert.equal(invalid.valid, false);
    assert.equal(invalid.errors[0]?.field, "escrow_id");
  });

  it("projects milestone escrow overview cards", () => {
    const view = buildEscrowOverviewView(MVP_MILESTONE_ESCROW_SOURCE);

    assert.equal(view.escrow_summary.fields[0]?.value, MVP_ESCROW_ID);
    assert.equal(view.financial_status.fields[1]?.value, "13,500.00 SAR");
    assert.equal(view.escrow_state.fields[2]?.value, "Yes");
    assert.equal(view.escrow_state.fields[3]?.value, "Yes");
    assert.equal(view.release_strategy.fields[0]?.value, "milestone_based");
    assert.equal(view.milestones.fields[0]?.value, "4");
    assert.equal(view.trust_context.fields[1]?.value, "emerald");
    assert.equal(view.contract_context.fields[2]?.value, "ready");
  });

  it("projects single release escrow overview", () => {
    const view = buildEscrowOverviewView(MVP_SINGLE_RELEASE_ESCROW_SOURCE);

    assert.equal(view.escrow_status, "released");
    assert.equal(view.release_strategy.summary, "single_release");
    assert.equal(view.escrow_state.fields[4]?.value, "Yes");
    assert.equal(view.financial_status.fields[4]?.value, "0.00 SAR");
  });

  it("projects refund escrow overview", () => {
    const view = buildEscrowOverviewView(MVP_REFUND_ESCROW_SOURCE);

    assert.equal(view.escrow_status, "refunded");
    assert.equal(view.escrow_state.fields[5]?.value, "Yes");
    assert.equal(view.escrow_state.fields[6]?.value, "Yes");
    assert.equal(view.financial_status.fields[3]?.value, "9,000.00 SAR");
    assert.equal(view.release_strategy.fields[0]?.value, "two_stage");
  });

  it("builds workflow-backed escrow source without financial calculations", () => {
    const workflow = createWorkflowIntelligenceService().analyze(
      buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
    );

    const source = buildEscrowExperienceSourceFromWorkflow(workflow, {
      escrow: MVP_MILESTONE_ESCROW_SOURCE.escrow,
      financial: MVP_MILESTONE_ESCROW_SOURCE.financial,
      history: MVP_MILESTONE_ESCROW_SOURCE.history,
    });

    assert.equal(source.trust.providerTrustTier, "emerald");
    assert.equal(source.releaseStrategy, "milestone_based");
    assert.equal(source.milestones.total, 4);
    assert.ok(source.milestones.releaseAllocation.includes("%"));
  });

  it("loads overview through escrow client executor", async () => {
    const client = new EscrowClient({
      overviewExecutor: async () => MVP_MILESTONE_ESCROW_SOURCE,
    });

    const result = await client.getEscrowOverview({ escrow_id: MVP_ESCROW_ID });
    assert.equal(result.view.escrow_status, "held");
    assert.equal(result.source.escrow.contractId, MVP_MILESTONE_ESCROW_SOURCE.escrow.contractId);
  });

  it("returns 404 when escrow fixture is missing without executor", async () => {
    const client = new EscrowClient();

    await assert.rejects(
      () => client.getEscrowOverview({ escrow_id: "990e8400-e29b-41d4-a716-446655440099" }),
      (error) => error instanceof EscrowClientError && error.status === 404
    );
  });

  it("renders escrow overview page markup", () => {
    const html = renderEscrowOverviewPage(createEscrowOverviewPageModel(MVP_MILESTONE_ESCROW_SOURCE));

    assert.match(html, /data-page="escrow-overview"/);
    assert.match(html, /data-card="escrow-summary"/);
    assert.match(html, /data-card="financial-status"/);
    assert.match(html, /data-card="escrow-state"/);
    assert.match(html, /data-card="release-strategy"/);
    assert.match(html, /data-card="milestones"/);
    assert.match(html, /data-card="trust-context"/);
    assert.match(html, /data-card="contract-context"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildEscrowOverviewView(MVP_EMPTY_HISTORY_ESCROW_SOURCE);
    const html = renderResponseCard(view.financial_status);

    assert.match(html, /Remaining Amount/);
    assert.match(html, /13,500.00 SAR/);
  });
});
