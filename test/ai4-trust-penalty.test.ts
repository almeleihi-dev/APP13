import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyBehaviorPenalties,
  calculateWeightedTrustScore,
  scoreIssues,
  scoreRefunds,
} from "../src/trust/intelligence/trust-rule-library.js";

describe("AI-4 trust penalty rules", () => {
  it("reduces issue component score as issue rate increases", () => {
    const low = scoreIssues(0.01);
    const high = scoreIssues(0.1);

    assert.ok(high < low);
    assert.equal(scoreIssues(0.03), 90);
  });

  it("reduces refund component score as refund rate increases", () => {
    const low = scoreRefunds(0.01);
    const high = scoreRefunds(0.15);

    assert.ok(high < low);
    assert.equal(scoreRefunds(0.01), 98);
  });

  it("applies behavior penalties to weighted trust score", () => {
    const weighted = calculateWeightedTrustScore({
      verification: 100,
      rating: 96,
      completion: 95,
      issues: 90,
      refunds: 98,
      evidence: 90,
    });

    assert.equal(weighted, 97);

    const adjusted = applyBehaviorPenalties(weighted, {
      completed_contracts: 52,
      completion_rate: 0.96,
      average_rating: 4.8,
      refund_rate: 0.01,
      issue_rate: 0.03,
      evidence_quality_score: 0.9,
      identity_verification_level: "iron",
    });

    assert.equal(adjusted, 92);
  });

  it("penalizes high refund and issue rates more aggressively", () => {
    const baseline = applyBehaviorPenalties(80, {
      completed_contracts: 10,
      completion_rate: 0.95,
      average_rating: 4.5,
      refund_rate: 0.01,
      issue_rate: 0.02,
      evidence_quality_score: 0.85,
      identity_verification_level: "gold",
    });

    const penalized = applyBehaviorPenalties(80, {
      completed_contracts: 10,
      completion_rate: 0.95,
      average_rating: 4.5,
      refund_rate: 0.12,
      issue_rate: 0.15,
      evidence_quality_score: 0.85,
      identity_verification_level: "gold",
    });

    assert.ok(penalized < baseline);
  });
});
