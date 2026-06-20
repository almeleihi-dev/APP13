import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TrustIntelligenceService,
  buildComponentScores,
  calculateTrustScore,
} from "../src/trust/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

const PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("AI-4 TrustIntelligenceService", () => {
  const service = new TrustIntelligenceService();

  it("calculates emerald trust profile for strong provider metrics", () => {
    const result = service.calculate({
      provider_id: PROVIDER_ID,
      metrics: {
        completed_contracts: 52,
        completion_rate: 0.96,
        average_rating: 4.8,
        refund_rate: 0.01,
        issue_rate: 0.03,
        evidence_quality_score: 0.9,
        identity_verification_level: "iron",
      },
    });

    assert.equal(result.trust_score, 92);
    assert.equal(result.trust_tier, "emerald");
    assert.equal(result.live_frame_color, "emerald");
    assert.equal(result.recommendation, "trusted");
    assert.deepEqual(result.restrictions, []);
    assert.deepEqual(result.component_scores, {
      verification: 100,
      rating: 96,
      completion: 95,
      issues: 90,
      refunds: 98,
      evidence: 90,
    });
  });

  it("assigns minimum verification score for unknown identity level", () => {
    const result = service.calculate({
      provider_id: PROVIDER_ID,
      metrics: {
        completed_contracts: 10,
        completion_rate: 0.9,
        average_rating: 4.5,
        refund_rate: 0.02,
        issue_rate: 0.02,
        evidence_quality_score: 0.8,
        identity_verification_level: "unknown",
      },
    });

    assert.equal(result.component_scores.verification, 0);
    assert.ok(result.trust_score < 70);
  });

  it("rejects invalid provider_id", () => {
    assert.throws(
      () =>
        service.calculate({
          provider_id: "not-a-uuid",
          metrics: {
            completed_contracts: 1,
            completion_rate: 1,
            average_rating: 5,
            refund_rate: 0,
            issue_rate: 0,
            evidence_quality_score: 1,
            identity_verification_level: "iron",
          },
        }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "trust"
    );
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      provider_id: PROVIDER_ID,
      metrics: {
        completed_contracts: 20,
        completion_rate: 0.92,
        average_rating: 4.7,
        refund_rate: 0.02,
        issue_rate: 0.04,
        evidence_quality_score: 0.85,
        identity_verification_level: "gold",
      },
    };

    assert.deepEqual(service.calculate(input), service.calculate(input));
  });
});

describe("AI-4 trust score calculation", () => {
  it("clamps final score between 0 and 100", () => {
    const high = calculateTrustScore({
      completed_contracts: 100,
      completion_rate: 1,
      average_rating: 5,
      refund_rate: 0,
      issue_rate: 0,
      evidence_quality_score: 1,
      identity_verification_level: "iron",
    });
    assert.equal(high.trust_score, 100);

    const low = calculateTrustScore({
      completed_contracts: 0,
      completion_rate: 0.2,
      average_rating: 2,
      refund_rate: 0.4,
      issue_rate: 0.5,
      evidence_quality_score: 0.1,
      identity_verification_level: "unknown",
    });
    assert.ok(low.trust_score >= 0);
    assert.ok(low.trust_score <= 100);
  });

  it("builds component scores from behavior metrics", () => {
    const components = buildComponentScores({
      completed_contracts: 52,
      completion_rate: 0.96,
      average_rating: 4.8,
      refund_rate: 0.01,
      issue_rate: 0.03,
      evidence_quality_score: 0.9,
      identity_verification_level: "iron",
    });

    assert.equal(components.verification, 100);
    assert.equal(components.rating, 96);
    assert.equal(components.completion, 95);
    assert.equal(components.issues, 90);
    assert.equal(components.refunds, 98);
    assert.equal(components.evidence, 90);
  });
});
