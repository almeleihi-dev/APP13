import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scoreAvailability,
  scorePriceFit,
  scoreDistance,
  scoreActionFit,
} from "../src/matching/intelligence/matching-rule-library.js";

describe("AI-5 urgent availability penalties", () => {
  it("scores urgent available providers at 100", () => {
    assert.equal(scoreAvailability(true, true), 100);
  });

  it("applies strong penalty when urgent provider is unavailable", () => {
    assert.equal(scoreAvailability(true, false), 20);
  });

  it("allows moderate score for non-urgent unavailable providers", () => {
    assert.equal(scoreAvailability(false, false), 70);
  });
});

describe("AI-5 price fit scoring", () => {
  it("scores within-budget estimates highly", () => {
    const score = scorePriceFit(12000, 11000);
    assert.ok(score >= 85);
    assert.ok(score <= 95);
  });

  it("penalizes estimates far above budget", () => {
    const withinBudget = scorePriceFit(12000, 11500);
    const farAbove = scorePriceFit(12000, 20000);

    assert.ok(farAbove < withinBudget);
    assert.ok(farAbove < 50);
  });
});

describe("AI-5 distance scoring", () => {
  it("scores nearby providers higher than distant providers", () => {
    const requirement = { lat: 24.7136, lng: 46.6753 };
    const nearby = scoreDistance(requirement, { lat: 24.7, lng: 46.68 });
    const distant = scoreDistance(requirement, { lat: 25.2, lng: 47.2 });

    assert.ok(nearby > distant);
    assert.equal(nearby, 88);
  });

  it("returns neutral score when locations are missing", () => {
    assert.equal(scoreDistance(undefined, { lat: 24.7, lng: 46.68 }), 75);
    assert.equal(scoreDistance({ lat: 24.7136, lng: 46.6753 }, undefined), 75);
  });
});

describe("AI-5 action fit penalties", () => {
  it("penalizes missing required action codes", () => {
    assert.equal(scoreActionFit(["E.3.1"], ["E.3.1"]), 100);
    assert.ok(scoreActionFit(["E.3.1", "B.1.2"], ["E.3.1"]) < 100);
  });
});
