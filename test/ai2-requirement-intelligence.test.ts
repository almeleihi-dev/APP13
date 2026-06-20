import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RequirementIntelligenceService,
  REQUIREMENT_PROFILE_LIBRARY,
} from "../src/action/intelligence/requirement/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

describe("AI-2 requirement profile library", () => {
  it("defines ten bilingual requirement profiles", () => {
    assert.equal(REQUIREMENT_PROFILE_LIBRARY.length, 10);
    const ids = REQUIREMENT_PROFILE_LIBRARY.map((profile) => profile.id);
    assert.deepEqual(ids.sort(), [
      "accountant",
      "cleaner",
      "consultant",
      "electrician",
      "event_coordinator",
      "graphic_designer",
      "lawyer",
      "plumber",
      "software_developer",
      "tutor",
    ]);

    for (const profile of REQUIREMENT_PROFILE_LIBRARY) {
      assert.ok(profile.keywords.en.length >= 1);
      assert.ok(profile.keywords.ar.length >= 1);
      assert.ok(profile.suggestedActions.length >= 1);
      assert.ok(profile.deliverables.length >= 1);
      assert.ok(profile.milestones.length >= 1);
      assert.ok(profile.missingQuestions.length >= 1);
    }
  });
});

describe("AI-2 RequirementIntelligenceService", () => {
  const service = new RequirementIntelligenceService();

  it("maps Arabic accountant requirement with profession hint", () => {
    const result = service.extract({
      requirement_text: "أحتاج محاسب يراجع حساباتي ويطلع لي تقرير",
      profession_hint: "accountant",
      language: "ar",
    });

    assert.equal(result.language_detected, "ar");
    assert.ok(result.confidence > 0);
    assert.equal(result.suggested_actions[0]?.action_code, "C.1.2");
    assert.ok(result.deliverables.length >= 1);
    assert.ok(result.milestones.length >= 1);
    assert.ok(result.missing_questions.includes("كم عدد الفواتير أو الملفات المطلوب مراجعتها؟"));
    assert.ok(result.missing_questions.includes("ما الفترة المالية المطلوبة؟"));
    assert.equal(result.contract_readiness, "needs_clarification");
  });

  it("maps English plumbing requirement to B.1.2", () => {
    const result = service.extract({
      requirement_text: "Need a plumber to fix a kitchen pipe leak and unclog the drain.",
    });

    assert.equal(result.language_detected, "en");
    assert.equal(result.suggested_actions[0]?.action_code, "B.1.2");
    assert.ok(result.confidence > 0);
    assert.equal(result.contract_readiness, "needs_clarification");
  });

  it("maps cleaner requirement to A.4.2", () => {
    const result = service.extract({
      requirement_text: "Deep cleaning and disinfection for a 3 bedroom apartment weekly.",
      profession_hint: "cleaner",
    });

    assert.equal(result.suggested_actions[0]?.action_code, "A.4.2");
    assert.ok(result.deliverables.some((item) => item.title.toLowerCase().includes("sanit")));
  });

  it("returns ready when scope signals answer missing questions", () => {
    const result = service.extract({
      requirement_text:
        "Review 50 invoices for Q1 2025 and deliver a financial review report with reconciliation worksheet.",
      profession_hint: "accountant",
    });

    assert.equal(result.suggested_actions[0]?.action_code, "C.1.2");
    assert.equal(result.missing_questions.length, 0);
    assert.equal(result.contract_readiness, "ready");
    assert.ok(result.confidence >= 0.65);
  });

  it("returns unknown for gibberish requirement text", () => {
    const result = service.extract({
      requirement_text: "xyzzy qwerty foobar nonsense",
    });

    assert.equal(result.confidence, 0);
    assert.deepEqual(result.suggested_actions, []);
    assert.deepEqual(result.deliverables, []);
    assert.deepEqual(result.milestones, []);
    assert.deepEqual(result.missing_questions, []);
    assert.equal(result.contract_readiness, "unknown");
  });

  it("rejects empty requirement_text", () => {
    assert.throws(
      () => service.extract({ requirement_text: "   " }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "action"
    );
  });

  it("uses profession_hint to boost software developer match", () => {
    const result = service.extract({
      requirement_text: "Build a REST API integration for our mobile app.",
      profession_hint: "software_developer",
    });

    assert.ok(result.suggested_actions.some((action) => action.action_code === "E.3.1"));
    assert.ok(result.confidence > 0);
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      requirement_text: "Need a tutor for math exam prep twice weekly.",
      profession_hint: "tutor",
    };
    const first = service.extract(input);
    const second = service.extract(input);
    assert.deepEqual(first, second);
  });
});
