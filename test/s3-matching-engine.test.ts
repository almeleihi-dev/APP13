import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MATCH_SCORE_WEIGHTS,
  compareRankedMatches,
  createMatchingService,
  scoreAvailabilityComponent,
  scoreDistanceComponent,
} from "../src/matching/module.js";

const FIXED_TIME = new Date("2026-06-19T12:00:00.000Z");
const ACTION = { actionId: "action-1", budget: 1000, maxDistanceKm: 20 };

function baseCandidate(overrides: Partial<{
  providerId: string;
  trustScore: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
}> = {}) {
  return {
    providerId: "provider-a",
    trustScore: 80,
    availableNow: true,
    distanceKm: 5,
    priceEstimate: 800,
    completedContractsForAction: 3,
    ...overrides,
  };
}

describe("S3.6 Matching Engine", () => {
  const matching = createMatchingService();

  it("ranks providers by totalScore descending", () => {
    const ranked = matching.rankProviders(
      ACTION,
      [
        baseCandidate({ providerId: "low", trustScore: 55, availableNow: false, distanceKm: 18 }),
        baseCandidate({ providerId: "high", trustScore: 92, availableNow: true, distanceKm: 2 }),
        baseCandidate({ providerId: "mid", trustScore: 75, availableNow: true, distanceKm: 8 }),
      ],
      FIXED_TIME
    );

    assert.deepEqual(
      ranked.map((entry) => entry.providerId),
      ["high", "mid", "low"]
    );
    assert.ok(ranked[0]!.totalScore > ranked[1]!.totalScore);
    assert.ok(ranked[1]!.totalScore > ranked[2]!.totalScore);
  });

  it("applies trust weighting at 40%", () => {
    const shared = {
      availableNow: true,
      distanceKm: 5,
      priceEstimate: 800,
      completedContractsForAction: 2,
    };

    const highTrust = matching.scoreProviderForAction(
      baseCandidate({ providerId: "trusted", trustScore: 95, ...shared }),
      ACTION,
      FIXED_TIME
    );
    const lowTrust = matching.scoreProviderForAction(
      baseCandidate({ providerId: "risky", trustScore: 40, ...shared }),
      ACTION,
      FIXED_TIME
    );

    const trustDelta = highTrust.totalScore - lowTrust.totalScore;
    const expectedDelta = Math.round((95 - 40) * MATCH_SCORE_WEIGHTS.trust);
    assert.equal(trustDelta, expectedDelta);
    assert.equal(MATCH_SCORE_WEIGHTS.trust, 0.4);
  });

  it("applies availability weighting at 25%", () => {
    const shared = {
      trustScore: 80,
      distanceKm: 5,
      priceEstimate: 800,
      completedContractsForAction: 2,
    };

    const available = matching.scoreProviderForAction(
      baseCandidate({ providerId: "now", availableNow: true, ...shared }),
      ACTION,
      FIXED_TIME
    );
    const unavailable = matching.scoreProviderForAction(
      baseCandidate({ providerId: "later", availableNow: false, ...shared }),
      ACTION,
      FIXED_TIME
    );

    const availabilityDelta = available.totalScore - unavailable.totalScore;
    const componentGap =
      scoreAvailabilityComponent(true) - scoreAvailabilityComponent(false);
    assert.ok(componentGap > 0);
    assert.ok(availabilityDelta > 0);
    assert.ok(
      Math.abs(availabilityDelta - Math.round(componentGap * MATCH_SCORE_WEIGHTS.availability)) <= 1
    );
    assert.equal(MATCH_SCORE_WEIGHTS.availability, 0.25);
  });

  it("applies distance weighting at 15%", () => {
    const shared = {
      trustScore: 80,
      availableNow: true,
      priceEstimate: 800,
      completedContractsForAction: 2,
    };

    const near = matching.scoreProviderForAction(
      baseCandidate({ providerId: "near", distanceKm: 2, ...shared }),
      ACTION,
      FIXED_TIME
    );
    const far = matching.scoreProviderForAction(
      baseCandidate({ providerId: "far", distanceKm: 18, ...shared }),
      ACTION,
      FIXED_TIME
    );

    const distanceDelta = near.totalScore - far.totalScore;
    const expectedDelta = Math.round(
      (scoreDistanceComponent(2, ACTION.maxDistanceKm) -
        scoreDistanceComponent(18, ACTION.maxDistanceKm)) *
        MATCH_SCORE_WEIGHTS.distance
    );
    assert.equal(distanceDelta, expectedDelta);
    assert.equal(MATCH_SCORE_WEIGHTS.distance, 0.15);
  });

  it("breaks ties by trust, experience, then lower price", () => {
    const sharedScore = {
      actionId: ACTION.actionId,
      totalScore: 82,
      availabilityScore: 90,
      distanceScore: 90,
      priceScore: 80,
      experienceScore: 80,
      generatedAt: FIXED_TIME,
    };

    const ranked = [
      {
        score: { ...sharedScore, providerId: "price-winner", trustScore: 80 },
        candidate: baseCandidate({
          providerId: "price-winner",
          trustScore: 80,
          priceEstimate: 700,
          completedContractsForAction: 2,
        }),
      },
      {
        score: { ...sharedScore, providerId: "experience-winner", trustScore: 80 },
        candidate: baseCandidate({
          providerId: "experience-winner",
          trustScore: 80,
          priceEstimate: 900,
          completedContractsForAction: 5,
        }),
      },
      {
        score: { ...sharedScore, providerId: "trust-winner", trustScore: 88 },
        candidate: baseCandidate({
          providerId: "trust-winner",
          trustScore: 88,
          priceEstimate: 900,
          completedContractsForAction: 2,
        }),
      },
    ].sort(compareRankedMatches);

    assert.equal(ranked[0]?.score.providerId, "trust-winner");
    assert.equal(ranked[1]?.score.providerId, "experience-winner");
    assert.equal(ranked[2]?.score.providerId, "price-winner");
  });

  it("returns deterministic scores for identical inputs", () => {
    const candidate = baseCandidate({ providerId: "deterministic" });
    const first = matching.scoreProviderForAction(candidate, ACTION, FIXED_TIME);
    const second = matching.scoreProviderForAction(candidate, ACTION, FIXED_TIME);

    assert.deepEqual(first, second);
  });

  it("returns best matches with limit", () => {
    const best = matching.getBestMatches(
      ACTION,
      [
        baseCandidate({ providerId: "p1", trustScore: 60 }),
        baseCandidate({ providerId: "p2", trustScore: 90 }),
        baseCandidate({ providerId: "p3", trustScore: 75 }),
      ],
      2,
      FIXED_TIME
    );

    assert.equal(best.length, 2);
    assert.equal(best[0]?.providerId, "p2");
    assert.equal(best[1]?.providerId, "p3");
  });
});
