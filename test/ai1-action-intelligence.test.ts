import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ActionIntelligenceService,
  detectLanguage,
  PROFESSION_ACTION_LIBRARY,
} from "../src/action/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

describe("AI-1 profession action library", () => {
  it("defines bilingual mappings for MVP action codes", () => {
    assert.ok(PROFESSION_ACTION_LIBRARY.length >= 11);
    for (const mapping of PROFESSION_ACTION_LIBRARY) {
      assert.ok(mapping.profession.en.length > 0);
      assert.ok(mapping.profession.ar.length > 0);
      assert.ok(mapping.actionCodes.length >= 1);
      assert.ok(mapping.keywords.en.length >= 1);
      assert.ok(mapping.keywords.ar.length >= 1);
    }
  });
});

describe("AI-1 language detection", () => {
  it("detects Arabic, English, and mixed corpora", () => {
    assert.equal(detectLanguage("Licensed plumber with drain repair experience"), "en");
    assert.equal(detectLanguage("سباك محترف لإصلاح التسريبات"), "ar");
    assert.equal(detectLanguage("Plumber سباك with mixed experience"), "mixed");
  });
});

describe("AI-1 ActionIntelligenceService", () => {
  const service = new ActionIntelligenceService();

  it("maps English CV text to plumbing actions and deliverables", () => {
    const result = service.extract({
      cv_text:
        "Licensed plumber with 8 years experience in pipe fitting, drain clearing, and leak repair.",
      experience_text: "Installed fixtures and repaired water heater leaks.",
    });

    assert.equal(result.profession, "Plumber");
    assert.ok(result.confidence >= 0.5);
    assert.equal(result.language_detected, "en");
    assert.equal(result.actions[0]?.action_code, "B.1.2");
    assert.ok(result.skills.some((skill) => skill.toLowerCase().includes("pipe")));
    assert.ok(result.deliverables.some((item) => item.toLowerCase().includes("leak")));
  });

  it("maps Arabic experience text to electrician profile", () => {
    const result = service.extract({
      experience_text: "كهربائي مع خبرة في تمديد الأسلاك وتركيب الإضاءة وصيانة اللوحات الكهربائية",
      language: "ar",
    });

    assert.equal(result.profession, "كهربائي");
    assert.equal(result.language_detected, "ar");
    assert.equal(result.actions[0]?.action_code, "B.2.1");
    assert.ok(result.skills.length >= 2);
    assert.ok(result.deliverables.length >= 2);
  });

  it("uses explicit profession hint to boost confidence", () => {
    const withoutHint = service.extract({
      cv_text: "Built REST APIs with TypeScript and PostgreSQL.",
    });
    const withHint = service.extract({
      profession: "Software Developer",
      cv_text: "Built REST APIs with TypeScript and PostgreSQL.",
    });

    assert.equal(withHint.profession, "Software Developer");
    assert.ok(withHint.confidence >= withoutHint.confidence);
    assert.ok(withHint.actions.some((action) => action.action_code === "E.3.1"));
  });

  it("returns ranked actions with monotonic scores", () => {
    const result = service.extract({
      profession: "consultant",
      cv_text: "Strategy and operations advisory for SMB clients.",
    });

    assert.ok(result.actions.length >= 1);
    for (let index = 1; index < result.actions.length; index += 1) {
      assert.ok(result.actions[index - 1].score >= result.actions[index].score);
    }
  });

  it("rejects empty extraction requests", () => {
    assert.throws(
      () => service.extract({}),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "action"
    );
  });

  it("returns unknown profile for gibberish input with no keyword matches", () => {
    const result = service.extract({
      cv_text: "xyzzy qwerty foobar nonsense lorem ipsum",
      experience_text: "zzzz 12345 !!!",
    });

    assert.equal(result.profession, "unknown");
    assert.equal(result.confidence, 0);
    assert.deepEqual(result.actions, []);
    assert.deepEqual(result.skills, []);
    assert.deepEqual(result.deliverables, []);
  });

  it("maps English cleaning keywords to A.4.2", () => {
    const result = service.extract({
      cv_text: "Professional cleaner with housekeeping and disinfection experience.",
      experience_text: "Janitor services including sanitization of shared spaces.",
    });

    assert.equal(result.profession, "Cleaning & Sanitization");
    assert.equal(result.actions[0]?.action_code, "A.4.2");
    assert.ok(result.confidence > 0);
  });

  it("maps Arabic cleaning keywords to A.4.2", () => {
    const result = service.extract({
      experience_text: "عامل نظافة متخصص في تنظيف وتعقيم المساحات باستخدام مطهرات معتمدة",
      language: "ar",
    });

    assert.equal(result.profession, "تنظيف وتعقيم");
    assert.equal(result.actions[0]?.action_code, "A.4.2");
    assert.ok(result.confidence > 0);
  });
});
