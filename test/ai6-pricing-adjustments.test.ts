import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveTrustAdjustment,
  resolveComplexityAdjustment,
  resolveUrgencyAdjustment,
  resolveLocationAdjustment,
} from "../src/pricing/intelligence/pricing-adjustment-library.js";

describe("AI-6 trust adjustment rules", () => {
  it("applies +15% for trust score 95 and above", () => {
    assert.equal(resolveTrustAdjustment(95), 15);
    assert.equal(resolveTrustAdjustment(100), 15);
  });

  it("applies +10% for trust score 85 and above", () => {
    assert.equal(resolveTrustAdjustment(85), 10);
    assert.equal(resolveTrustAdjustment(92), 10);
  });

  it("applies +5% for trust score 70 and above", () => {
    assert.equal(resolveTrustAdjustment(70), 5);
    assert.equal(resolveTrustAdjustment(84), 5);
  });

  it("applies -10% for trust score below 50", () => {
    assert.equal(resolveTrustAdjustment(49), -10);
    assert.equal(resolveTrustAdjustment(20), -10);
  });

  it("applies neutral adjustment between 50 and 69", () => {
    assert.equal(resolveTrustAdjustment(50), 0);
    assert.equal(resolveTrustAdjustment(69), 0);
  });
});

describe("AI-6 complexity adjustment rules", () => {
  it("applies expected complexity percentages", () => {
    assert.equal(resolveComplexityAdjustment("low"), 0);
    assert.equal(resolveComplexityAdjustment("medium"), 10);
    assert.equal(resolveComplexityAdjustment("high"), 25);
  });
});

describe("AI-6 urgency adjustment rules", () => {
  it("applies no adjustment for non-urgent work", () => {
    assert.equal(resolveUrgencyAdjustment(false), 0);
  });

  it("applies +20% for urgent work", () => {
    assert.equal(resolveUrgencyAdjustment(true), 20);
  });
});

describe("AI-6 location tier adjustment rules", () => {
  it("applies expected location tier percentages", () => {
    assert.equal(resolveLocationAdjustment("rural"), -5);
    assert.equal(resolveLocationAdjustment("standard"), 0);
    assert.equal(resolveLocationAdjustment("metro"), 5);
    assert.equal(resolveLocationAdjustment("premium"), 15);
  });
});
