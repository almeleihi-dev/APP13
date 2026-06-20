import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ESCROW_RULES,
  buildEscrowPlan,
  getEscrowRule,
} from "../src/contract/intelligence/escrow-rule-library.js";

describe("AI-3 escrow recommendation engine", () => {
  it("recommends 100% single release for cleaning", () => {
    const rule = getEscrowRule("cleaning", ["A.4.2"]);

    assert.equal(rule.id, "cleaning_single");
    assert.equal(rule.releaseStrategy, "single_release");
    assert.deepEqual(rule.percentages, [100]);
  });

  it("recommends 50/50 split for logo design", () => {
    const rule = getEscrowRule("design", ["E.1.1"]);

    assert.equal(rule.id, "design_split");
    assert.deepEqual(rule.percentages, [50, 50]);
    assert.equal(rule.milestoneCount, 2);
  });

  it("recommends 25/25/25/25 for software website builds", () => {
    const rule = getEscrowRule("software", ["E.3.1"]);

    assert.equal(rule.id, "software_phased");
    assert.deepEqual(rule.percentages, [25, 25, 25, 25]);
    assert.equal(rule.releaseStrategy, "milestone_based");
  });

  it("recommends multi-stage release for construction trades", () => {
    const rule = getEscrowRule("construction", ["B.1.2"]);

    assert.equal(rule.id, "construction_multi");
    assert.equal(rule.releaseStrategy, "multi_stage");
    assert.deepEqual(rule.percentages, [30, 40, 30]);
  });

  it("builds escrow plan stages aligned to milestone titles", () => {
    const rule = ESCROW_RULES.software_phased;
    const plan = buildEscrowPlan(rule, [
      { title: "Discovery" },
      { title: "Build phase 1" },
      { title: "Build phase 2" },
      { title: "Launch handover" },
    ]);

    assert.equal(plan.recommended_structure.length, 4);
    assert.equal(plan.recommended_structure[0]?.label, "Discovery");
    assert.equal(plan.recommended_structure[3]?.percentage, 25);
    assert.ok(plan.recommended_structure.every((stage) => stage.trigger.length > 0));
  });
});
