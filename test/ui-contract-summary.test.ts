import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  buildContractReviewContext,
  buildContractWorkflowPayload,
  MVP_CONTRACT_WORKFLOW_INPUT,
} from "../src/ui/contract/contract-payload.js";
import {
  buildContractSummaryView,
  createContractSummaryPageModel,
  renderContractSummaryPage,
  renderResponseCard,
} from "../src/ui/pages/contract-summary.js";

describe("P4 contract summary page", () => {
  const workflow = createWorkflowIntelligenceService().analyze(
    buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
  );
  const context = buildContractReviewContext(MVP_CONTRACT_WORKFLOW_INPUT, workflow);

  it("projects workflow and AI-3 contract output into summary cards", () => {
    const view = buildContractSummaryView(workflow, context);

    assert.equal(view.contract_summary.id, "contract-summary");
    assert.equal(view.parties.id, "parties");
    assert.equal(view.scope.id, "scope");
    assert.equal(view.milestones.id, "milestones");
    assert.equal(view.pricing.id, "pricing");
    assert.equal(view.negotiation.id, "negotiation");
    assert.equal(view.trust.id, "trust");
    assert.equal(view.escrow.id, "escrow");
    assert.equal(view.risk.id, "risk");

    assert.equal(view.contract_summary.fields[1]?.value, "software_developer");
    assert.equal(view.contract_summary.fields[2]?.value, "14 days");
    assert.ok(view.scope.fields[0]?.value.includes("E.3.1"));
    assert.equal(view.milestones.fields[0]?.value, "4");
    assert.ok(view.milestones.fields[1]?.value.includes("%"));
    assert.equal(view.pricing.fields[1]?.value, "12,500 SAR");
    assert.equal(view.pricing.fields[2]?.value, "13,500 SAR");
    assert.equal(view.negotiation.summary, "negotiable");
    assert.equal(view.trust.fields[2]?.value, "emerald");
    assert.equal(view.escrow.fields[0]?.value, "milestone_based");
    assert.ok(view.risk.fields[1]?.value.length >= 1);
  });

  it("projects scope deliverables from AI-3 scope of work", () => {
    const view = buildContractSummaryView(workflow, context);

    assert.ok(view.scope.fields[2]?.value.length >= 1);
    assert.notEqual(view.scope.fields[2]?.value, "—");
  });

  it("handles missing contract output with safe placeholders", () => {
    const view = buildContractSummaryView(
      {
        ...workflow,
        contract: null,
        pricing: null,
        negotiation: null,
        trust: null,
      },
      context
    );

    assert.equal(view.contract_summary.fields[3]?.value, "—");
    assert.equal(view.pricing.fields[0]?.value, "—");
    assert.equal(view.negotiation.fields[0]?.value, "—");
    assert.equal(view.trust.fields[0]?.value, "—");
    assert.equal(view.escrow.fields[0]?.value, "—");
    assert.equal(view.risk.fields[1]?.value, "—");
  });

  it("renders reusable response card markup", () => {
    const view = buildContractSummaryView(workflow, context);
    const html = renderResponseCard(view.pricing);

    assert.match(html, /data-card="pricing"/);
    assert.match(html, /Minimum/);
    assert.match(html, /Negotiated/);
    assert.match(html, /Premium/);
  });

  it("renders contract summary page with all cards", () => {
    const model = createContractSummaryPageModel(workflow, context);
    const html = renderContractSummaryPage(model);

    assert.match(html, /data-page="contract-summary"/);
    assert.match(html, /data-section="contract-cards"/);
    assert.match(html, /data-card="contract-summary"/);
    assert.match(html, /data-card="parties"/);
    assert.match(html, /data-card="scope"/);
    assert.match(html, /data-card="milestones"/);
    assert.match(html, /data-card="pricing"/);
    assert.match(html, /data-card="negotiation"/);
    assert.match(html, /data-card="trust"/);
    assert.match(html, /data-card="escrow"/);
    assert.match(html, /data-card="risk"/);
  });
});
