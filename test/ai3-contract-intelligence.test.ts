import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createActionIntelligenceService } from "../src/action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "../src/action/intelligence/requirement/requirement-intelligence-service.js";
import {
  createContractIntelligenceService,
  generateScopeOfWork,
  generateMilestones,
} from "../src/contract/intelligence/index.js";
import { getEscrowRule } from "../src/contract/intelligence/escrow-rule-library.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

describe("AI-3 ContractIntelligenceService", () => {
  const actionIntelligence = createActionIntelligenceService();
  const requirementIntelligence = createRequirementIntelligenceService();
  const service = createContractIntelligenceService(actionIntelligence, requirementIntelligence);

  it("generates a software website proposal with phased escrow", () => {
    const ai1 = actionIntelligence.extract({
      profession: "Software Developer",
      cv_text: "Full-stack developer building websites and admin dashboards.",
    });
    const ai2 = requirementIntelligence.extract({
      requirement_text: "Build a restaurant website with admin dashboard",
      profession_hint: "software_developer",
    });

    const result = service.generate({
      profession: "software_developer",
      requirement_text: "Build a restaurant website with admin dashboard",
      contract_value: 12000,
      currency: "SAR",
      ai1_result: ai1,
      ai2_result: ai2,
    });

    assert.ok(result.scope_of_work.length >= 1);
    assert.equal(result.milestones.length, 4);
    assert.deepEqual(
      result.milestones.map((milestone) => milestone.percentage),
      [25, 25, 25, 25]
    );
    assert.equal(result.escrow_plan.release_strategy, "milestone_based");
    assert.equal(result.escrow_plan.recommended_structure.length, 4);
    assert.ok(result.acceptance_criteria.length >= 4);
    assert.ok(result.draft_contract.sections.length === 4);
    assert.ok(["ready", "needs_clarification"].includes(result.contract_readiness));
    assert.ok(["low", "medium", "high"].includes(result.risk_profile.risk_level));
    assert.equal(result.risk_profile.recommended_milestones, 4);
  });

  it("auto-resolves AI-1 and AI-2 when result objects are empty", () => {
    const result = service.generate({
      profession: "cleaner",
      requirement_text: "Deep cleaning and disinfection for apartment",
      contract_value: 800,
      currency: "SAR",
      ai1_result: {},
      ai2_result: {},
    });

    assert.equal(result.milestones.length, 1);
    assert.equal(result.milestones[0]?.percentage, 100);
    assert.equal(result.escrow_plan.release_strategy, "single_release");
    assert.equal(result.risk_profile.risk_level, "low");
  });

  it("builds scope from AI-2 actions and deliverables", () => {
    const ai2 = requirementIntelligence.extract({
      requirement_text: "Need a plumber to fix kitchen pipe leak",
    });

    const scope = generateScopeOfWork(
      {
        profession: "Plumber",
        confidence: 0.8,
        language_detected: "en",
        actions: [{ action_code: "B.1.2", action_name: "Plumbing Service", score: 0.8 }],
        skills: ["Pipe fitting"],
        deliverables: ["Leak repair"],
      },
      ai2
    );

    assert.ok(scope.some((item) => item.action_code === "B.1.2"));
    assert.ok(scope.some((item) => item.title.toLowerCase().includes("leak") || item.title.includes("Plumbing")));
  });

  it("returns unknown proposal for unmatched inputs", () => {
    const result = service.generate({
      requirement_text: "xyzzy qwerty foobar",
      ai1_result: {
        profession: "unknown",
        confidence: 0,
        language_detected: "en",
        actions: [],
        skills: [],
        deliverables: [],
      },
      ai2_result: {
        language_detected: "en",
        confidence: 0,
        suggested_actions: [],
        deliverables: [],
        milestones: [],
        missing_questions: [],
        contract_readiness: "unknown",
      },
    });

    assert.equal(result.contract_readiness, "unknown");
    assert.deepEqual(result.scope_of_work, []);
    assert.deepEqual(result.milestones, []);
  });

  it("rejects completely empty requests", () => {
    assert.throws(
      () => service.generate({ ai1_result: {}, ai2_result: {} }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "contract"
    );
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      profession: "graphic_designer",
      requirement_text: "Design a logo and brand identity package",
      contract_value: 5000,
      currency: "SAR",
      ai1_result: {},
      ai2_result: {},
    };

    const first = service.generate(input);
    const second = service.generate(input);
    assert.deepEqual(first, second);
  });

  it("maps design engagements to 50/50 escrow", () => {
    const rule = getEscrowRule("design", ["E.1.1"]);
    const ai2 = requirementIntelligence.extract({
      requirement_text: "Logo design and brand identity for startup",
      profession_hint: "graphic_designer",
    });
    const milestones = generateMilestones(ai2, rule);

    assert.equal(milestones.length, 2);
    assert.deepEqual(
      milestones.map((milestone) => milestone.percentage),
      [50, 50]
    );
  });
});

describe("AI-3 scope and milestone generators", () => {
  it("uses AI-2 milestone templates when available", () => {
    const ai2 = createRequirementIntelligenceService().extract({
      requirement_text: "Coordinate a corporate conference with venue logistics",
      profession_hint: "event_coordinator",
    });
    const rule = getEscrowRule("events", ["F.1.2"]);
    const milestones = generateMilestones(ai2, rule);

    assert.equal(milestones.length, rule.milestoneCount);
    assert.ok(milestones[0]?.acceptance_criteria.length >= 1);
  });
});
