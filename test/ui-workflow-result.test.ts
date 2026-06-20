import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  buildWorkflowResultView,
  createRequestResultPageModel,
  renderWorkflowResultPage,
} from "../src/ui/pages/request-result.js";

const READY_REQUEST = {
  request_text:
    "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
  budget: 15000,
  preferred_days: 14,
};

describe("P1 workflow result page", () => {
  const workflow = createWorkflowIntelligenceService().analyze({
    requirement_text: READY_REQUEST.request_text,
    customer_budget: READY_REQUEST.budget,
    customer_days: READY_REQUEST.preferred_days,
    providers: [
      {
        provider_id: "550e8400-e29b-41d4-a716-446655440001",
        action_codes: ["E.3.1", "B.3.3"],
        skills: ["frontend", "backend", "deployment"],
        trust_score: 92,
        rating: 4.8,
        price_offer: 12000,
        estimated_days: 14,
        latitude: 24.7,
        longitude: 46.68,
      },
      {
        provider_id: "550e8400-e29b-41d4-a716-446655440002",
        action_codes: ["A.4.2"],
        skills: ["cleaning"],
        trust_score: 80,
        rating: 4.5,
        price_offer: 400,
      },
    ],
  });

  it("projects workflow response into response cards only", () => {
    const view = buildWorkflowResultView(workflow, READY_REQUEST);

    assert.equal(view.workflow_status, "ready");
    assert.equal(view.request_summary.id, "request");
    assert.equal(view.provider.id, "provider");
    assert.equal(view.trust.id, "trust");
    assert.equal(view.pricing.id, "pricing");
    assert.equal(view.negotiation.id, "negotiation");
    assert.equal(view.contract.id, "contract");
    assert.equal(view.trust.fields[0]?.value, "92");
    assert.equal(view.trust.fields[1]?.value, "emerald");
    assert.equal(view.pricing.summary, "13,500 SAR");
    assert.equal(view.negotiation.summary, "negotiable");
    assert.equal(view.contract.fields[0]?.value, workflow.requirement.contract_readiness);
    assert.equal(view.contract.fields[1]?.value, "milestone_based");
    assert.equal(view.contract.fields[2]?.value, workflow.contract?.risk_profile.risk_level);
  });

  it("includes requirement classification fields", () => {
    const view = buildWorkflowResultView(workflow, READY_REQUEST);
    const actions = view.requirement_classification.find((field) => field.label === "Suggested Actions");

    assert.ok(actions?.value.includes("E.3.1"));
    assert.ok(view.requirement_classification.some((field) => field.label === "Contract Readiness"));
  });

  it("renders unified result page markup with all cards", () => {
    const model = createRequestResultPageModel(workflow, READY_REQUEST);
    const html = renderWorkflowResultPage(model);

    assert.match(html, /data-page="request-result"/);
    assert.match(html, /data-card="request"/);
    assert.match(html, /data-card="provider"/);
    assert.match(html, /data-card="trust"/);
    assert.match(html, /data-card="pricing"/);
    assert.match(html, /data-card="negotiation"/);
    assert.match(html, /data-card="contract"/);
    assert.match(html, /Requirement Classification/);
  });

  it("handles no-provider workflow state without throwing", () => {
    const emptyWorkflow = createWorkflowIntelligenceService().analyze({
      requirement_text: READY_REQUEST.request_text,
      providers: [],
    });

    const view = buildWorkflowResultView(emptyWorkflow, READY_REQUEST);

    assert.equal(view.workflow_status, "no_provider_match");
    assert.equal(view.provider.summary, "No provider selected");
    assert.equal(view.trust.fields[0]?.value, "—");
  });
});
