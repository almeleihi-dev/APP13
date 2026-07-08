import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assessRisk,
  countComplexitySignals,
  scoreToRiskLevel,
  valueRiskScore,
} from "../src/contract/intelligence/risk-rule-library.js";

describe("AI-3 risk engine", () => {
  it("scores low risk for small cleaning contracts", () => {
    const profile = assessRisk({
      category: "cleaning",
      contractValue: 800,
      currency: "SAR",
      milestoneCount: 1,
      requirementText: "Weekly apartment cleaning",
      missingQuestionCount: 0,
      ai2Confidence: 0.8,
    });

    assert.equal(profile.risk_level, "low");
    assert.equal(profile.recommended_milestones, 1);
    assert.ok(profile.reason.length > 0);
  });

  it("scores medium risk for software website with admin dashboard", () => {
    const profile = assessRisk({
      category: "software",
      contractValue: 12000,
      currency: "SAR",
      milestoneCount: 4,
      requirementText: "Build a restaurant website with admin dashboard",
      missingQuestionCount: 1,
      ai2Confidence: 0.75,
    });

    assert.equal(profile.risk_level, "medium");
    assert.equal(profile.recommended_milestones, 4);
    assert.ok(countComplexitySignals("Build a restaurant website with admin dashboard") >= 1);
  });

  it("scores high risk for large construction contracts", () => {
    const profile = assessRisk({
      category: "construction",
      contractValue: 75000,
      currency: "SAR",
      milestoneCount: 3,
      requirementText: "Electrical panel upgrade with legacy wiring migration",
      missingQuestionCount: 2,
      ai2Confidence: 0.6,
    });

    assert.equal(profile.risk_level, "high");
    assert.ok(profile.reason.includes("construction"));
  });

  it("maps numeric scores to risk levels deterministically", () => {
    assert.equal(scoreToRiskLevel(2), "low");
    assert.equal(scoreToRiskLevel(5), "medium");
    assert.equal(scoreToRiskLevel(9), "high");
  });

  it("increases value risk score with contract amount", () => {
    assert.ok(valueRiskScore(1000) < valueRiskScore(20000));
    assert.ok(valueRiskScore(20000) < valueRiskScore(100000));
  });
});
