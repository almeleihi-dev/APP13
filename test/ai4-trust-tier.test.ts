import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TRUST_TIER_DEFINITIONS,
  resolveTrustTier,
} from "../src/trust/intelligence/trust-tier-library.js";

describe("AI-4 trust tier library", () => {
  it("maps score ranges to expected tiers", () => {
    assert.equal(resolveTrustTier(100).tier, "platinum");
    assert.equal(resolveTrustTier(95).tier, "platinum");
    assert.equal(resolveTrustTier(94).tier, "emerald");
    assert.equal(resolveTrustTier(85).tier, "emerald");
    assert.equal(resolveTrustTier(84).tier, "gold");
    assert.equal(resolveTrustTier(70).tier, "gold");
    assert.equal(resolveTrustTier(69).tier, "silver");
    assert.equal(resolveTrustTier(50).tier, "silver");
    assert.equal(resolveTrustTier(49).tier, "restricted");
    assert.equal(resolveTrustTier(0).tier, "restricted");
  });

  it("maps live frame colors by tier", () => {
    assert.equal(resolveTrustTier(96).liveFrameColor, "platinum");
    assert.equal(resolveTrustTier(90).liveFrameColor, "emerald");
    assert.equal(resolveTrustTier(75).liveFrameColor, "gold");
    assert.equal(resolveTrustTier(60).liveFrameColor, "silver");
    assert.equal(resolveTrustTier(20).liveFrameColor, "gray");
  });

  it("returns recommendation and restrictions per tier", () => {
    assert.equal(resolveTrustTier(96).recommendation, "trusted");
    assert.deepEqual(resolveTrustTier(96).restrictions, []);

    assert.equal(resolveTrustTier(60).recommendation, "conditional");
    assert.ok(resolveTrustTier(60).restrictions.includes("enhanced_monitoring"));

    assert.equal(resolveTrustTier(20).recommendation, "restricted");
    assert.ok(
      resolveTrustTier(20).restrictions.includes("contracts_require_manual_approval")
    );
  });

  it("defines non-overlapping tier bands covering 0-100", () => {
    const sorted = [...TRUST_TIER_DEFINITIONS].sort((a, b) => a.minScore - b.minScore);
    assert.equal(sorted[0]?.minScore, 0);
    assert.equal(sorted[sorted.length - 1]?.maxScore, 100);
  });
});
