import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveProviderRiskProfile } from "../src/provider/intelligence/risk-profile-library.js";

describe("AI-8 provider risk profile rules", () => {
  it("classifies strong providers as low risk", () => {
    assert.equal(
      resolveProviderRiskProfile({
        years_experience: 8,
        completion_rate: 0.96,
        issue_rate: 0.03,
        refund_rate: 0.01,
      }),
      "low"
    );
  });

  it("classifies weak completion or high issue rates as high risk", () => {
    assert.equal(
      resolveProviderRiskProfile({
        years_experience: 5,
        completion_rate: 0.7,
        issue_rate: 0.03,
        refund_rate: 0.01,
      }),
      "high"
    );

    assert.equal(
      resolveProviderRiskProfile({
        years_experience: 5,
        completion_rate: 0.9,
        issue_rate: 0.15,
        refund_rate: 0.01,
      }),
      "high"
    );

    assert.equal(
      resolveProviderRiskProfile({
        years_experience: 5,
        completion_rate: 0.9,
        issue_rate: 0.03,
        refund_rate: 0.08,
      }),
      "high"
    );
  });

  it("classifies mixed metrics as medium risk", () => {
    assert.equal(
      resolveProviderRiskProfile({
        years_experience: 2,
        completion_rate: 0.85,
        issue_rate: 0.06,
        refund_rate: 0.03,
      }),
      "medium"
    );
  });
});
