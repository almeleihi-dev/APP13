import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MatchingIntelligenceService,
  buildComponentScores,
  calculateMatchScore,
} from "../src/matching/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

const BASE_REQUIREMENT = {
  required_action_codes: ["E.3.1"],
  required_skills: ["frontend", "backend"],
  budget: 12000,
  currency: "SAR",
  location: { lat: 24.7136, lng: 46.6753 },
  urgent: true,
};

const BASE_PROVIDER = {
  provider_id: "provider_1",
  action_codes: ["E.3.1"],
  skills: ["frontend", "backend", "deployment"],
  trust_score: 92,
  completion_rate: 0.96,
  average_rating: 4.8,
  price_estimate: 11000,
  available_now: true,
  location: { lat: 24.7, lng: 46.68 },
};

describe("AI-5 MatchingIntelligenceService", () => {
  const service = new MatchingIntelligenceService();

  it("ranks the reference provider with expected component scores", () => {
    const result = service.rank({
      requirement: BASE_REQUIREMENT,
      providers: [BASE_PROVIDER],
    });

    const match = result.ranked_matches[0];
    assert.ok(match);
    assert.equal(match.provider_id, "provider_1");
    assert.equal(match.match_score, 95);
    assert.equal(match.recommendation, "best_match");
    assert.deepEqual(match.component_scores, {
      action_fit: 100,
      skill_fit: 95,
      trust: 92,
      availability: 100,
      price_fit: 90,
      distance: 88,
      rating: 96,
    });
    assert.deepEqual(match.reasons, []);
  });

  it("sorts providers by descending match score", () => {
    const result = service.rank({
      requirement: BASE_REQUIREMENT,
      providers: [
        {
          ...BASE_PROVIDER,
          provider_id: "provider_low",
          trust_score: 40,
          price_estimate: 18000,
          available_now: false,
        },
        { ...BASE_PROVIDER, provider_id: "provider_high" },
      ],
    });

    assert.equal(result.ranked_matches[0]?.provider_id, "provider_high");
    assert.equal(result.ranked_matches[1]?.provider_id, "provider_low");
    assert.ok(result.ranked_matches[0]!.match_score > result.ranked_matches[1]!.match_score);
  });

  it("rejects empty provider lists", () => {
    assert.throws(
      () => service.rank({ requirement: BASE_REQUIREMENT, providers: [] }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "matching"
    );
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      requirement: BASE_REQUIREMENT,
      providers: [BASE_PROVIDER, { ...BASE_PROVIDER, provider_id: "provider_2", trust_score: 80 }],
    };

    assert.deepEqual(service.rank(input), service.rank(input));
  });
});

describe("AI-5 matching score calculation", () => {
  it("calculates weighted match score from component scores", () => {
    const components = buildComponentScores(BASE_REQUIREMENT, BASE_PROVIDER);
    assert.equal(calculateMatchScore(components), 95);
  });
});
