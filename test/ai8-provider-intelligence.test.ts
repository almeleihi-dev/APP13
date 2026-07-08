import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderIntelligenceService } from "../src/provider/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

const PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440000";

const STRONG_PROVIDER_INPUT = {
  provider_id: PROVIDER_ID,
  profession: "software_developer",
  profile_text:
    "Full-stack TypeScript developer building APIs, React websites, and backend integrations.",
  years_experience: 8,
  certifications: ["AWS Certified", "Scrum Master"],
  licenses: ["Commercial Registration"],
  completed_contracts: 52,
  completion_rate: 0.96,
  issue_rate: 0.03,
  refund_rate: 0.01,
  rating: 4.8,
  availability_hours_per_week: 30,
  active_contracts: 1,
  average_price: 12000,
  location_tier: "metro" as const,
};

describe("AI-8 ProviderIntelligenceService", () => {
  const service = createProviderIntelligenceService();

  it("builds a complete provider profile using AI-1 extraction", () => {
    const result = service.profile(STRONG_PROVIDER_INPUT);

    assert.equal(result.identity_profile.profession, "software_developer");
    assert.equal(result.identity_profile.experience_years, 8);
    assert.equal(result.identity_profile.verification_level, "iron");
    assert.ok(result.identity_profile.specializations.includes("AWS Certified"));
    assert.deepEqual(result.action_profile.action_codes, ["E.3.1", "B.3.3"]);
    assert.ok(result.action_profile.skills.length >= 3);
    assert.ok(result.action_profile.deliverables.length >= 1);
    assert.equal(result.capability_profile.level, "senior");
    assert.equal(result.capability_profile.capability_score, 83);
    assert.equal(result.trust_inputs.verification_score, 100);
    assert.equal(result.trust_inputs.completion_score, 95);
    assert.equal(result.trust_inputs.rating_score, 96);
    assert.equal(result.pricing_profile.average_price, 12000);
    assert.equal(result.pricing_profile.pricing_position, "market");
    assert.equal(result.availability_profile.available_now, true);
    assert.equal(result.availability_profile.estimated_start_days, 3);
    assert.ok(result.matching_profile.matching_tags.includes("senior"));
    assert.equal(result.matching_profile.preferred_contract_size, "medium");
    assert.ok(result.matching_profile.preferred_categories.includes("software"));
    assert.equal(result.risk_profile, "low");
  });

  it("builds action profile from profession when profile_text is absent", () => {
    const result = service.profile({
      provider_id: PROVIDER_ID,
      profession: "cleaning_sanitization",
    });

    assert.deepEqual(result.action_profile.action_codes, ["A.4.2"]);
    assert.ok(result.action_profile.skills.length >= 1);
  });

  it("rejects invalid provider_id", () => {
    assert.throws(
      () => service.profile({ provider_id: "not-a-uuid" }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "provider"
    );
  });

  it("rejects invalid rating values", () => {
    assert.throws(
      () => service.profile({ provider_id: PROVIDER_ID, rating: 6 }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "provider"
    );
  });

  it("produces deterministic output for the same input", () => {
    assert.deepEqual(service.profile(STRONG_PROVIDER_INPUT), service.profile(STRONG_PROVIDER_INPUT));
  });
});

describe("AI-8 trust input compatibility", () => {
  const service = createProviderIntelligenceService();

  it("generates trust component scores compatible with AI-4 weighting", () => {
    const result = service.profile(STRONG_PROVIDER_INPUT);

    assert.ok(result.trust_inputs.verification_score >= 0);
    assert.ok(result.trust_inputs.verification_score <= 100);
    assert.ok(result.trust_inputs.completion_score >= 0);
    assert.ok(result.trust_inputs.issue_score >= 0);
    assert.ok(result.trust_inputs.refund_score >= 0);
    assert.ok(result.trust_inputs.evidence_score >= 0);
  });
});
