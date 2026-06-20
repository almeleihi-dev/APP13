import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

const TOP_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440001";
const WEAK_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440002";

const READY_REQUIREMENT_TEXT =
  "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.";

const CLARIFICATION_REQUIREMENT_TEXT =
  "Build a restaurant website with online menu, admin dashboard, and mobile-friendly design.";

const BASE_PROVIDERS = [
  {
    provider_id: TOP_PROVIDER_ID,
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
    provider_id: WEAK_PROVIDER_ID,
    action_codes: ["A.4.2"],
    skills: ["cleaning"],
    trust_score: 80,
    rating: 4.5,
    price_offer: 400,
  },
];

describe("AI-Orchestrator WorkflowIntelligenceService", () => {
  const service = createWorkflowIntelligenceService();

  it("runs the full ready workflow across AI-2 through AI-4", () => {
    const result = service.analyze({
      profession: "software_developer",
      requirement_text: READY_REQUIREMENT_TEXT,
      customer_budget: 15000,
      customer_days: 14,
      providers: BASE_PROVIDERS,
    });

    assert.equal(result.workflow_status, "ready");
    assert.equal(result.requirement.contract_readiness, "ready");
    assert.ok(result.requirement.suggested_actions.some((action) => action.action_code === "E.3.1"));
    assert.equal(result.matching.selected_provider_id, TOP_PROVIDER_ID);
    assert.ok(result.matching.ranked_matches[0]!.match_score > result.matching.ranked_matches[1]!.match_score);
    assert.deepEqual(result.pricing?.price_range, {
      minimum: 8000,
      recommended: 12500,
      premium: 15000,
    });
    assert.equal(result.negotiation?.negotiation_state, "negotiable");
    assert.equal(result.negotiation?.recommended_price, 13500);
    assert.equal(result.contract?.milestones.length, 4);
    assert.equal(result.contract?.escrow_plan.release_strategy, "milestone_based");
    assert.equal(result.trust?.trust_score, 92);
    assert.equal(result.trust?.trust_tier, "emerald");
    assert.equal(result.trust?.live_frame_color, "emerald");
    assert.deepEqual(result.summary, {
      provider_id: TOP_PROVIDER_ID,
      recommended_price: 13500,
      trust_score: 92,
      negotiation_state: "negotiable",
    });
  });

  it("returns needs_clarification when requirement extraction is incomplete", () => {
    const result = service.analyze({
      profession: "software_developer",
      requirement_text: CLARIFICATION_REQUIREMENT_TEXT,
      customer_budget: 15000,
      providers: [BASE_PROVIDERS[0]!],
    });

    assert.equal(result.workflow_status, "needs_clarification");
    assert.equal(result.requirement.contract_readiness, "needs_clarification");
    assert.ok(result.requirement.missing_questions.length >= 1);
    assert.equal(result.matching.selected_provider_id, TOP_PROVIDER_ID);
    assert.ok(result.pricing);
    assert.ok(result.negotiation);
    assert.ok(result.contract);
    assert.ok(result.trust);
  });

  it("returns no_provider_match when no candidates are supplied", () => {
    const result = service.analyze({
      requirement_text: READY_REQUIREMENT_TEXT,
      providers: [],
    });

    assert.equal(result.workflow_status, "no_provider_match");
    assert.equal(result.requirement.contract_readiness, "ready");
    assert.deepEqual(result.matching.ranked_matches, []);
    assert.equal(result.matching.selected_provider_id, null);
    assert.equal(result.pricing, null);
    assert.equal(result.negotiation, null);
    assert.equal(result.contract, null);
    assert.equal(result.trust, null);
    assert.deepEqual(result.summary, {
      provider_id: null,
      recommended_price: null,
      trust_score: null,
      negotiation_state: null,
    });
  });

  it("rejects empty requirement_text", () => {
    assert.throws(
      () =>
        service.analyze({
          requirement_text: "   ",
          providers: BASE_PROVIDERS,
        }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "orchestrator"
    );
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      profession: "software_developer",
      requirement_text: READY_REQUIREMENT_TEXT,
      customer_budget: 15000,
      customer_days: 14,
      providers: BASE_PROVIDERS,
    };

    assert.deepEqual(service.analyze(input), service.analyze(input));
  });
});
