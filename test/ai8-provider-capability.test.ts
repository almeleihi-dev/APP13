import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCapabilityProfile,
  calculateCapabilityScore,
  resolveCapabilityLevel,
} from "../src/provider/intelligence/capability-rule-library.js";

describe("AI-8 capability level rules", () => {
  it("maps experience years to capability levels", () => {
    assert.equal(resolveCapabilityLevel(1), "junior");
    assert.equal(resolveCapabilityLevel(2), "junior");
    assert.equal(resolveCapabilityLevel(3), "professional");
    assert.equal(resolveCapabilityLevel(5), "professional");
    assert.equal(resolveCapabilityLevel(6), "senior");
    assert.equal(resolveCapabilityLevel(10), "senior");
    assert.equal(resolveCapabilityLevel(11), "expert");
    assert.equal(resolveCapabilityLevel(20), "expert");
  });

  it("calculates capability scores within 0-100", () => {
    assert.equal(calculateCapabilityScore("junior", 1), 46);
    assert.equal(calculateCapabilityScore("professional", 4), 66);
    assert.equal(calculateCapabilityScore("senior", 8), 83);
    assert.equal(calculateCapabilityScore("expert", 12), 95);
  });

  it("builds capability profiles from experience years", () => {
    const profile = buildCapabilityProfile(4);
    assert.equal(profile.level, "professional");
    assert.equal(profile.capability_score, 66);
  });
});
